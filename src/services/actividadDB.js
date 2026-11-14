import {
    consultar,
    consultarUno,
    crearEsquema,
    ejecutar,
    transaccion,
} from "./sqlite";

import { randomUUID } from "expo-crypto";

//Comprueba que el identificador del usuario sea válido.
function validarUid(uid) {
  if (!uid || typeof uid !== "string") {
    throw new Error("El usuario no es válido.");
  }
}

//Comprueba que la fecha tenga el formato correcto y que corresponda a una fecha real.
function validarFecha(fecha) {
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error("La fecha debe tener el formato YYYY-MM-DD.");
  }

  const [anio, mes, dia] = fecha.split("-").map(Number);
  const fechaReal = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    fechaReal.getUTCFullYear() !== anio ||
    fechaReal.getUTCMonth() !== mes - 1 ||
    fechaReal.getUTCDate() !== dia
  ) {
    throw new Error("La fecha ingresada no es válida.");
  }
}

//Valida los datos de actividad física antes de guardarlos.
function validarActividadFisica(uid, fecha, pasos, distancia, calorias) {
  validarUid(uid);
  validarFecha(fecha);

  if (!Number.isInteger(pasos) || pasos < 0) {
    throw new Error(
      "Los pasos deben ser un número entero igual o mayor que cero.",
    );
  }

  if (!Number.isFinite(distancia) || distancia < 0) {
    throw new Error(
      "La distancia debe ser un número válido igual o mayor que cero.",
    );
  }

  if (!Number.isInteger(calorias) || calorias < 0) {
    throw new Error(
      "Las calorías deben ser un número entero igual o mayor que cero.",
    );
  }
}

//Crea las tablas necesarias si todavía no existen.
export async function iniciarActividadDB() {
  await crearEsquema(`
    CREATE TABLE IF NOT EXISTS actividades_fisicas (
      id TEXT PRIMARY KEY,
      uid TEXT NOT NULL,
      fecha TEXT NOT NULL,
      pasos INTEGER NOT NULL,
      distancia REAL NOT NULL,
      calorias INTEGER NOT NULL,
      UNIQUE (uid, fecha)
    );

    CREATE TABLE IF NOT EXISTS entrenamientos (
      id TEXT PRIMARY KEY,
      uid TEXT NOT NULL,
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL,
      duracion_min INTEGER NOT NULL,
      intensidad TEXT NOT NULL,
      calorias INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS sincronizacion_pendiente (
    id TEXT PRIMARY KEY,
    uid TEXT NOT NULL,
    tipo TEXT NOT NULL,
    fecha TEXT NOT NULL,
    intentos INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

//Registra la actividad física diaria. Si ya existe un registro para esa fecha, actualiza sus datos.
export async function guardarActividadFisica(
  uid,
  fecha,
  pasos,
  distancia,
  calorias,
) {
  validarActividadFisica(uid, fecha, pasos, distancia, calorias);

  const id = `${uid}_${fecha}`;

  await transaccion(async () => {
    await ejecutar(
      `INSERT INTO actividades_fisicas
        (id, uid, fecha, pasos, distancia, calorias)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(uid, fecha)
       DO UPDATE SET
         pasos = excluded.pasos,
         distancia = excluded.distancia,
         calorias = excluded.calorias`,
      [id, uid, fecha, pasos, distancia, calorias],
    );

    await agregarPendienteSincronizacion(id, uid, "actividad_fisica", fecha);
  });
}

//Obtiene la actividad física de un usuario en una fecha específica.
export async function obtenerActividadFisica(uid, fecha) {
  validarUid(uid);
  validarFecha(fecha);

  return await consultarUno(
    `SELECT * FROM actividades_fisicas
     WHERE uid = ? AND fecha = ?`,
    [uid, fecha],
  );
}

//Recupera todos los registros diarios de actividad física.
export async function listarActividadesFisicas(uid) {
  validarUid(uid);

  return await consultar(
    `SELECT * FROM actividades_fisicas
     WHERE uid = ?
     ORDER BY fecha DESC`,
    [uid],
  );
}

//Registra una sesión de entrenamiento. Permite guardar varias sesiones en un mismo día.
export async function guardarEntrenamiento(
  uid,
  fecha,
  tipo,
  duracion,
  intensidad,
  calorias,
) {
  validarUid(uid);
  validarFecha(fecha);

  if (!tipo || typeof tipo !== "string" || !tipo.trim()) {
    throw new Error("Debes indicar el tipo de entrenamiento.");
  }

  if (!Number.isInteger(duracion) || duracion <= 0) {
    throw new Error("La duración debe ser mayor que cero.");
  }

  if (!["Baja", "Media", "Alta"].includes(intensidad)) {
    throw new Error("La intensidad no es válida.");
  }

  if (!Number.isInteger(calorias) || calorias < 0) {
    throw new Error(
      "Las calorías deben ser un número entero igual o mayor que cero.",
    );
  }

  const id = randomUUID();

  await transaccion(async () => {
    await ejecutar(
      `INSERT INTO entrenamientos
        (id, uid, fecha, tipo, duracion_min, intensidad, calorias)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, uid, fecha, tipo.trim(), duracion, intensidad, calorias],
    );

    await agregarPendienteSincronizacion(id, uid, "entrenamiento", fecha);
  });
}

//Devuelve todas las sesiones realizadas en una fecha específica.
export async function obtenerEntrenamientos(uid, fecha) {
  validarUid(uid);
  validarFecha(fecha);

  return await consultar(
    `SELECT * FROM entrenamientos
     WHERE uid = ? AND fecha = ?
     ORDER BY fecha DESC, id DESC`,
    [uid, fecha],
  );
}

//Recupera el historial completo de entrenamientos del usuario.
export async function listarEntrenamientos(uid) {
  validarUid(uid);

  return await consultar(
    `SELECT * FROM entrenamientos
     WHERE uid = ?
     ORDER BY fecha DESC, id DESC`,
    [uid],
  );
}

//Obtiene los totales de actividad física entre dos fechas.
export async function obtenerResumenActividad(uid, fechaInicio, fechaFin) {
  validarUid(uid);
  validarFecha(fechaInicio);
  validarFecha(fechaFin);

  if (fechaInicio > fechaFin) {
    throw new Error("La fecha inicial no puede ser posterior a la final.");
  }

  return await consultarUno(
    `SELECT
       COALESCE(SUM(pasos), 0) AS totalPasos,
       COALESCE(SUM(distancia), 0) AS totalDistancia,
       COALESCE(SUM(calorias), 0) AS totalCalorias
     FROM actividades_fisicas
     WHERE uid = ? AND fecha >= ? AND fecha <= ?`,
    [uid, fechaInicio, fechaFin],
  );
}

//Obtiene la cantidad de entrenamientos, minutos y calorías acumuladas durante un período.
export async function obtenerResumenEntrenamientos(uid, fechaInicio, fechaFin) {
  validarUid(uid);
  validarFecha(fechaInicio);
  validarFecha(fechaFin);

  if (fechaInicio > fechaFin) {
    throw new Error("La fecha inicial no puede ser posterior a la final.");
  }

  return await consultarUno(
    `SELECT
       COUNT(*) AS cantidadEntrenamientos,
       COALESCE(SUM(duracion_min), 0) AS totalMinutos,
       COALESCE(SUM(calorias), 0) AS totalCalorias
     FROM entrenamientos
     WHERE uid = ? AND fecha >= ? AND fecha <= ?`,
    [uid, fechaInicio, fechaFin],
  );
}

//Obtiene la actividad física y los entrenamientos de un día.
export async function obtenerDetalleDiario(uid, fecha) {
  validarUid(uid);
  validarFecha(fecha);

  const actividad = await obtenerActividadFisica(uid, fecha);
  const entrenamientos = await obtenerEntrenamientos(uid, fecha);

  return {
    actividad,
    entrenamientos,
  };
}

//Filtra los entrenamientos según los criterios proporcionados. Los filtros son opcionales y pueden combinarse.
export async function filtrarEntrenamientos(
  uid,
  fechaInicio = null,
  fechaFin = null,
  tipo = null,
  intensidad = null,
) {
  validarUid(uid);

  if (fechaInicio) {
    validarFecha(fechaInicio);
  }

  if (fechaFin) {
    validarFecha(fechaFin);
  }

  if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
    throw new Error("La fecha inicial no puede ser posterior a la final.");
  }

  if (tipo !== null && (typeof tipo !== "string" || !tipo.trim())) {
    throw new Error("El tipo de entrenamiento no es válido.");
  }

  if (intensidad !== null && !["Baja", "Media", "Alta"].includes(intensidad)) {
    throw new Error("La intensidad no es válida.");
  }

  //Consulta principal: únicamente registros del usuario.
  let sql = `
    SELECT * FROM entrenamientos
    WHERE uid = ?
  `;

  //Aquí se almacenan los valores que se enviarán a SQLite.
  const params = [uid];

  //Agrega el filtro de fecha inicial si fue proporcionado.
  if (fechaInicio) {
    sql += " AND fecha >= ?";
    params.push(fechaInicio);
  }

  //Agrega el filtro de fecha final si fue proporcionado.
  if (fechaFin) {
    sql += " AND fecha <= ?";
    params.push(fechaFin);
  }

  //Filtra por tipo de entrenamiento.
  if (tipo) {
    sql += " AND tipo = ?";
    params.push(tipo.trim());
  }

  //Filtra por intensidad.
  if (intensidad) {
    sql += " AND intensidad = ?";
    params.push(intensidad);
  }

  //Ordena los resultados desde el más reciente.
  sql += " ORDER BY fecha DESC, id DESC";

  return await consultar(sql, params);
}

//Obtiene los registros diarios de actividad física para los gráficos.
export async function obtenerActividadPorDia(uid, fechaInicio, fechaFin) {
  validarUid(uid);
  validarFecha(fechaInicio);
  validarFecha(fechaFin);

  if (fechaInicio > fechaFin) {
    throw new Error("La fecha inicial no puede ser posterior a la final.");
  }

  return await consultar(
    `SELECT
       fecha,
       pasos,
       distancia,
       calorias
     FROM actividades_fisicas
     WHERE uid = ?
       AND fecha >= ?
       AND fecha <= ?
     ORDER BY fecha ASC`,
    [uid, fechaInicio, fechaFin],
  );
}

//Obtiene un resumen diario de entrenamientos para los gráficos.
export async function obtenerEntrenamientosPorDia(uid, fechaInicio, fechaFin) {
  validarUid(uid);
  validarFecha(fechaInicio);
  validarFecha(fechaFin);

  if (fechaInicio > fechaFin) {
    throw new Error("La fecha inicial no puede ser posterior a la final.");
  }

  return await consultar(
    `SELECT
       fecha,
       COUNT(*) AS cantidadEntrenamientos,
       SUM(duracion_min) AS totalMinutos,
       SUM(calorias) AS totalCalorias
     FROM entrenamientos
     WHERE uid = ?
       AND fecha >= ?
       AND fecha <= ?
     GROUP BY fecha
     ORDER BY fecha ASC`,
    [uid, fechaInicio, fechaFin],
  );
}

/**
 * Registra un elemento que necesita sincronizarse con Firestore.
 */
export async function agregarPendienteSincronizacion(id, uid, tipo, fecha) {
  validarUid(uid);
  validarFecha(fecha);

  if (!["actividad_fisica", "entrenamiento"].includes(tipo)) {
    throw new Error("El tipo de sincronización no es válido.");
  }

  await ejecutar(
    `INSERT OR IGNORE INTO sincronizacion_pendiente
      (id, uid, tipo, fecha)
     VALUES (?, ?, ?, ?)`,
    [id, uid, tipo, fecha],
  );
}

/**
 * Obtiene los registros pendientes de un usuario.
 */
export async function obtenerPendientesSincronizacion(uid) {
  validarUid(uid);

  return await consultar(
    `SELECT *
     FROM sincronizacion_pendiente
     WHERE uid = ?
     ORDER BY creado_en ASC`,
    [uid],
  );
}

/**
 * Elimina un pendiente cuando se sincroniza correctamente.
 */
export async function eliminarPendienteSincronizacion(id, uid) {
  validarUid(uid);

  await ejecutar(
    `DELETE FROM sincronizacion_pendiente
     WHERE id = ? AND uid = ?`,
    [id, uid],
  );
}
