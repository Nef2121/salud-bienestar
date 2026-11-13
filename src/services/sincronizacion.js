import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "./firebase";

import {
    eliminarPendienteSincronizacion,
    obtenerActividadFisica,
    obtenerEntrenamientos,
    obtenerPendientesSincronizacion,
} from "./actividadDB";

// Envía a Firestore los registros pendientes de un usuario.
export async function sincronizarPendientes(uid) {
  if (!uid || typeof uid !== "string") {
    throw new Error("El usuario no es válido.");
  }

  const pendientes = await obtenerPendientesSincronizacion(uid);

  let sincronizados = 0;
  let fallidos = 0;

  for (const pendiente of pendientes) {
    try {
      let datos;

      if (pendiente.tipo === "actividad_fisica") {
        datos = await obtenerActividadFisica(uid, pendiente.fecha);

        if (!datos || datos.id !== pendiente.id) {
          throw new Error("No se encontró la actividad física.");
        }

        await setDoc(
          doc(db, "users", uid, "actividades_fisicas", pendiente.id),
          {
            uid,
            fecha: datos.fecha,
            pasos: datos.pasos,
            distancia: datos.distancia,
            calorias: datos.calorias,
            sincronizado_en: serverTimestamp(),
          },
        );
      } else if (pendiente.tipo === "entrenamiento") {
        const entrenamientos = await obtenerEntrenamientos(
          uid,
          pendiente.fecha,
        );

        datos = entrenamientos.find(
          (entrenamiento) => entrenamiento.id === pendiente.id,
        );

        if (!datos) {
          throw new Error("No se encontró el entrenamiento.");
        }

        await setDoc(doc(db, "users", uid, "entrenamientos", pendiente.id), {
          uid,
          fecha: datos.fecha,
          tipo: datos.tipo,
          duracion_min: datos.duracion_min,
          intensidad: datos.intensidad,
          calorias: datos.calorias,
          sincronizado_en: serverTimestamp(),
        });
      } else {
        throw new Error("Tipo de registro desconocido.");
      }

      await eliminarPendienteSincronizacion(pendiente.id, uid);
      sincronizados++;
    } catch (error) {
      console.log(
        "No se pudo sincronizar el registro:",
        pendiente.id,
        error.message,
      );

      fallidos++;
    }
  }

  return {
    totalPendientes: pendientes.length,
    sincronizados,
    fallidos,
  };
}
