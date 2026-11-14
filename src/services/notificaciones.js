import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "./firebase";
import { tokenFCM, sincronizar } from "./avisosDispositivo";

let cola = Promise.resolve();
export function sincronizarAlertas(uid, datos) {
  const tarea = cola.catch(() => {}).then(() => sincronizar(uid, datos));
  cola = tarea;
  return tarea;
}
async function dispositivo() {
  let id = await AsyncStorage.getItem("salud.dispositivo");
  if (!id) {
    id = Crypto.randomUUID();
    await AsyncStorage.setItem("salud.dispositivo", id);
  }
  return id;
}
export async function guardarToken(uid, token) {
  const id = await dispositivo();
  await setDoc(doc(db, "users", uid, "dispositivos", id), {
    token,
    plataforma: "android",
    actualizado: serverTimestamp(),
  });
}
export async function activarPush(uid) {
  const token = await tokenFCM();
  await guardarToken(uid, token);
  await AsyncStorage.setItem("salud.push." + uid, "true");
  return token;
}
export async function pushHabilitado(uid) {
  return (await AsyncStorage.getItem("salud.push." + uid)) === "true";
}
export async function desactivarPush(uid) {
  const id = await dispositivo();
  await deleteDoc(doc(db, "users", uid, "dispositivos", id));
  await AsyncStorage.removeItem("salud.push." + uid);
}
export async function limpiarNotificaciones(uid) {
  await sincronizarAlertas(null, []);
  if (uid && (await pushHabilitado(uid))) await desactivarPush(uid);
}
export async function enviarAviso(destinatario, categoria) {
  const resultado = await httpsCallable(
    getFunctions(app, "us-central1"),
    "enviarAviso",
  )({ destinatario: destinatario.trim(), categoria });
  return resultado.data;
}
