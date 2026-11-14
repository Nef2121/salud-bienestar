import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { claveDeUsuario, generarNonce } from "./claves";
import { cifrarObjeto, descifrarObjeto } from "../utils/cifrado";
import { validarRegistro } from "../utils/planificacion";

function referencia(uid, tipo) {
  if (!uid || auth.currentUser?.uid !== uid)
    throw new Error("Inicia sesión para continuar.");
  if (!["objetivos", "recordatorios", "comidas"].includes(tipo))
    throw new Error("Módulo no válido.");
  return collection(db, "users", uid, tipo);
}
export function mensajeError(e) {
  if (e?.code === "permission-denied")
    return "No tienes permiso para esta operación. Comprueba que el equipo publicó las reglas de los nuevos módulos.";
  if (e?.code === "unavailable")
    return "No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.";
  return e?.message || "No se pudo completar la operación.";
}
export function escucharRegistros(uid, tipo, recibir, error) {
  let activo = true,
    version = 0;
  const cancelar = onSnapshot(
    referencia(uid, tipo),
    async (snap) => {
      const turno = ++version;
      try {
        const clave = await claveDeUsuario(uid);
        const datos = snap.docs.map((d) => ({
          ...descifrarObjeto(d.data().cifrado, clave),
          id: d.id,
        }));
        if (activo && turno === version)
          recibir(datos.sort((a, b) => a.nombre.localeCompare(b.nombre)));
      } catch (e) {
        if (activo && turno === version) error(e);
      }
    },
    (e) => {
      if (activo) error(e);
    },
  );
  return () => {
    activo = false;
    cancelar();
  };
}
export async function guardarRegistro(uid, tipo, datos, id) {
  const validado = validarRegistro(tipo, datos);
  const ref = id ? doc(referencia(uid, tipo), id) : doc(referencia(uid, tipo));
  const clave = await claveDeUsuario(uid);
  const { id: omitido, ...contenido } = validado;
  await setDoc(ref, {
    cifrado: cifrarObjeto(contenido, clave, generarNonce()),
    actualizado: serverTimestamp(),
  });
  return ref.id;
}
export async function eliminarRegistro(uid, tipo, id) {
  await deleteDoc(doc(referencia(uid, tipo), id));
}
