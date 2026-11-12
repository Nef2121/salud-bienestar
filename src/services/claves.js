// Gestión de claves de cifrado.
//
// 1) Clave del usuario (Firestore): una clave aleatoria por usuario, guardada en
//    users/{uid}/privado/clave. Las reglas solo permiten leerla a su dueño: ni
//    siquiera un admin puede leerla, así que un admin ve el perfil pero no los
//    datos cifrados (DUI, sangre, peso...). Funciona en cualquier dispositivo.
//
// 2) Clave local (SQLite): una clave aleatoria por dispositivo, guardada en el
//    almacenamiento seguro de Android (Keystore) con expo-secure-store.
//    En el navegador no existe almacenamiento seguro: se usa localStorage, que es
//    mucho más débil (solo sirve para desarrollo/pruebas).

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

import { LONGITUD_CLAVE, LONGITUD_NONCE, base64ABytes, bytesABase64 } from '../utils/cifrado';
import { db } from './firebase';

export const generarBytes = (n) => Crypto.getRandomBytes(n);
export const generarClave = () => generarBytes(LONGITUD_CLAVE);
export const generarNonce = () => generarBytes(LONGITUD_NONCE);

// ---------- 1) Clave del usuario ----------

const cacheClaves = new Map(); // uid -> Uint8Array (solo en memoria)

const refClave = (uid) => doc(db, 'users', uid, 'privado', 'clave');

// Devuelve la clave del usuario. Si no existe y `crear` es true, la genera y la guarda.
export async function claveDeUsuario(uid, { crear = false } = {}) {
  if (cacheClaves.has(uid)) return cacheClaves.get(uid);

  const instantanea = await getDoc(refClave(uid));
  if (instantanea.exists()) {
    const clave = base64ABytes(instantanea.data().k);
    cacheClaves.set(uid, clave);
    return clave;
  }
  if (!crear) throw new Error('No se encontró la clave de cifrado de este usuario.');

  const clave = generarClave();
  await setDoc(refClave(uid), { k: bytesABase64(clave) });
  cacheClaves.set(uid, clave);
  return clave;
}

// Al cerrar sesión se borran las claves de la memoria.
export function olvidarClaves() {
  cacheClaves.clear();
}

// ---------- 2) Clave local del dispositivo (para SQLite) ----------

const NOMBRE_CLAVE_LOCAL = 'salud_bienestar_clave_local';
let claveLocalEnMemoria = null;

async function leerAlmacen() {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(NOMBRE_CLAVE_LOCAL) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(NOMBRE_CLAVE_LOCAL);
}

async function escribirAlmacen(valor) {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(NOMBRE_CLAVE_LOCAL, valor);
    } catch {
      // Sin almacenamiento: la clave solo vive mientras la página esté abierta.
    }
    return;
  }
  await SecureStore.setItemAsync(NOMBRE_CLAVE_LOCAL, valor);
}

// Clave AES-256 de este dispositivo. La primera vez se genera y se guarda.
export async function claveLocal() {
  if (claveLocalEnMemoria) return claveLocalEnMemoria;
  const guardada = await leerAlmacen();
  if (guardada) {
    claveLocalEnMemoria = base64ABytes(guardada);
    return claveLocalEnMemoria;
  }
  const nueva = generarClave();
  await escribirAlmacen(bytesABase64(nueva));
  claveLocalEnMemoria = nueva;
  return nueva;
}
