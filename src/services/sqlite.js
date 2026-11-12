// Acceso seguro a SQLite (base de datos local). Pensado para que el Miembro 2 lo use
// en lugar de llamar a expo-sqlite directamente.
//
// Seguridad que ofrece:
//  - Consultas parametrizadas obligatorias: se rechaza cualquier SQL con valores pegados
//    dentro del texto (comillas, comentarios, varias sentencias). Ver utils/sqlSeguro.js.
//  - Cifrado AES-256-GCM de campos sensibles con la clave del dispositivo (guardada en el
//    almacenamiento seguro de Android).
//
// Ejemplo de uso:
//
//   import { ejecutar, consultar, guardarCifrado, leerCifrado } from '../services/sqlite';
//
//   await ejecutar(
//     'INSERT INTO actividades (uid, tipo, minutos, notas) VALUES (?, ?, ?, ?)',
//     [uid, tipo, minutos, await guardarCifrado(notas)],     // notas va cifrada
//   );
//   const filas = await consultar('SELECT * FROM actividades WHERE uid = ? AND tipo = ?', [uid, tipo]);
//   const notas = await leerCifrado(filas[0].notas);

import * as SQLite from 'expo-sqlite';

import { cifrarTexto, descifrarTexto } from '../utils/cifrado';
import { normalizarParametros, validarConsulta } from '../utils/sqlSeguro';
import { claveLocal, generarNonce } from './claves';

export { identificador, patronLike } from '../utils/sqlSeguro';

const NOMBRE_BD = 'salud_bienestar.db';
let promesaBd = null;

// Abre (una sola vez) la base de datos local.
function bd() {
  if (!promesaBd) {
    promesaBd = SQLite.openDatabaseAsync(NOMBRE_BD).then(async (db) => {
      await db.execAsync('PRAGMA foreign_keys = ON;');
      return db;
    });
  }
  return promesaBd;
}

// ---------- Consultas parametrizadas ----------

// INSERT / UPDATE / DELETE. Devuelve { changes, lastInsertRowId }.
export async function ejecutar(sql, params = []) {
  validarConsulta(sql, params);
  const db = await bd();
  return db.runAsync(sql, normalizarParametros(params));
}

// SELECT que devuelve todas las filas (arreglo de objetos).
export async function consultar(sql, params = []) {
  validarConsulta(sql, params);
  const db = await bd();
  return db.getAllAsync(sql, normalizarParametros(params));
}

// SELECT que devuelve solo la primera fila (o null).
export async function consultarUno(sql, params = []) {
  validarConsulta(sql, params);
  const db = await bd();
  return db.getFirstAsync(sql, normalizarParametros(params));
}

// Agrupa varias operaciones: si una falla, se deshacen todas.
//
//   await transaccion(async () => {
//     await ejecutar('INSERT ...', [...]);
//     await ejecutar('UPDATE ...', [...]);
//   });
export async function transaccion(tarea) {
  const db = await bd();
  return db.withTransactionAsync(tarea);
}

// Para crear tablas e índices (CREATE TABLE ...). Acepta varias sentencias y comillas
// (por ejemplo DEFAULT 'pendiente'), por eso SOLO debe recibir texto fijo escrito en el
// código, NUNCA texto que venga de un usuario, de un formulario o de Firebase.
export async function crearEsquema(sqlFijo) {
  if (typeof sqlFijo !== 'string') throw new Error('El esquema debe ser un texto fijo.');
  const db = await bd();
  await db.execAsync(sqlFijo);
}

// ---------- Cifrado de campos ----------

// Cifra un texto para guardarlo en una columna TEXT. Devuelve "v1.xxxx".
// null / '' se guardan tal cual (no hay nada que proteger).
export async function guardarCifrado(texto) {
  if (texto === null || texto === undefined || texto === '') return texto ?? null;
  return cifrarTexto(String(texto), await claveLocal(), generarNonce());
}

// Descifra lo guardado con guardarCifrado.
export async function leerCifrado(paquete) {
  if (paquete === null || paquete === undefined || paquete === '') return paquete ?? null;
  return descifrarTexto(paquete, await claveLocal());
}

// Atajos para objetos / números (se guardan como JSON cifrado).
export async function guardarCifradoJson(valor) {
  return guardarCifrado(JSON.stringify(valor));
}

export async function leerCifradoJson(paquete) {
  const texto = await leerCifrado(paquete);
  return texto === null ? null : JSON.parse(texto);
}
