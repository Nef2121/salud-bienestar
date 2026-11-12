// Cifrado AES-256-GCM (cifrado autenticado: si alguien altera el dato, descifrar falla).
// Módulo puro y reutilizable: lo usan Firestore (perfil) y SQLite (Miembro 2).
//
// Formato del paquete cifrado (texto): "v1." + base64( nonce[12] + datos cifrados + etiqueta[16] )
// El nonce (valor aleatorio único por cada cifrado) se pasa desde fuera: así este módulo
// no depende de la plataforma y se puede probar. Ver services/claves.js (generarNonce).

import { gcm } from '@noble/ciphers/aes.js';

export const LONGITUD_CLAVE = 32; // bytes (AES-256)
export const LONGITUD_NONCE = 12; // bytes (recomendado para GCM)
const PREFIJO = 'v1.';

const codificador = new TextEncoder();
const decodificador = new TextDecoder();

export function bytesABase64(bytes) {
  let binario = '';
  for (let i = 0; i < bytes.length; i++) binario += String.fromCharCode(bytes[i]);
  return btoa(binario);
}

export function base64ABytes(texto) {
  const binario = atob(texto);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

function validarClave(clave) {
  if (!(clave instanceof Uint8Array) || clave.length !== LONGITUD_CLAVE) {
    throw new Error('La clave de cifrado no es válida.');
  }
}

// Cifra un texto. Devuelve el paquete "v1.xxxx".
export function cifrarTexto(texto, clave, nonce) {
  validarClave(clave);
  if (!(nonce instanceof Uint8Array) || nonce.length !== LONGITUD_NONCE) {
    throw new Error('El nonce no es válido.');
  }
  const cifrado = gcm(clave, nonce).encrypt(codificador.encode(texto));
  const paquete = new Uint8Array(nonce.length + cifrado.length);
  paquete.set(nonce, 0);
  paquete.set(cifrado, nonce.length);
  return PREFIJO + bytesABase64(paquete);
}

// Descifra un paquete "v1.xxxx". Lanza error si la clave es incorrecta o el dato fue alterado.
export function descifrarTexto(paquete, clave) {
  validarClave(clave);
  if (typeof paquete !== 'string' || !paquete.startsWith(PREFIJO)) {
    throw new Error('El dato cifrado no tiene un formato válido.');
  }
  const bytes = base64ABytes(paquete.slice(PREFIJO.length));
  if (bytes.length <= LONGITUD_NONCE + 16) throw new Error('El dato cifrado está incompleto.');
  const nonce = bytes.slice(0, LONGITUD_NONCE);
  const cifrado = bytes.slice(LONGITUD_NONCE);
  try {
    return decodificador.decode(gcm(clave, nonce).decrypt(cifrado));
  } catch {
    throw new Error('No se pudo descifrar el dato (clave incorrecta o dato alterado).');
  }
}

// Atajos para objetos (se guardan como JSON).
export function cifrarObjeto(objeto, clave, nonce) {
  return cifrarTexto(JSON.stringify(objeto), clave, nonce);
}

export function descifrarObjeto(paquete, clave) {
  return JSON.parse(descifrarTexto(paquete, clave));
}
