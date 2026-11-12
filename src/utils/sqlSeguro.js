// Reglas para escribir SQL seguro (prevención de inyección SQL).
// Módulo puro (sin dependencias): lo usa services/sqlite.js antes de ejecutar cualquier consulta.
//
// REGLA DE ORO: los valores NUNCA se pegan dentro del texto SQL. Siempre van en `params`
// y el SQL solo contiene marcadores `?`.
//
//   MAL : `SELECT * FROM actividades WHERE tipo = '${tipo}'`      // vulnerable
//   BIEN: ('SELECT * FROM actividades WHERE tipo = ?', [tipo])    // seguro

const TIPOS_PARAM_VALIDOS = ['string', 'number', 'bigint'];

function error(mensaje) {
  return new Error(`SQL no permitido: ${mensaje}`);
}

// Lanza un error si la consulta no cumple las reglas de seguridad.
export function validarConsulta(sql, params = []) {
  if (typeof sql !== 'string' || sql.trim() === '') {
    throw error('la consulta debe ser un texto no vacío.');
  }
  if (!Array.isArray(params)) {
    throw error('los parámetros deben ir en un arreglo (ejemplo: [valor1, valor2]).');
  }

  // 1) Sin valores escritos dentro del SQL: nada de comillas.
  if (/['"`]/.test(sql)) {
    throw error(
      'no uses comillas dentro del SQL. Pon los valores en `params` y usa `?` en la consulta.',
    );
  }

  // 2) Sin comentarios (técnica clásica para cortar el resto de una consulta).
  if (/--|\/\*|\*\//.test(sql)) {
    throw error('no se permiten comentarios (-- o /* */).');
  }

  // 3) Una sola sentencia: no se permite `;` salvo al final.
  const sinFinal = sql.trim().replace(/;\s*$/, '');
  if (sinFinal.includes(';')) {
    throw error('solo se permite una sentencia por consulta.');
  }

  // 4) Solo marcadores `?` (sin :nombre, @nombre, $nombre ni ?NNN).
  if (/[:@$]\w/.test(sql) || /\?\d/.test(sql)) {
    throw error('usa únicamente marcadores `?` sin nombre ni número.');
  }

  // 5) Cantidad de `?` igual a cantidad de parámetros.
  const marcadores = (sql.match(/\?/g) ?? []).length;
  if (marcadores !== params.length) {
    throw error(`hay ${marcadores} marcador(es) \`?\` pero ${params.length} parámetro(s).`);
  }

  // 6) Tipos de parámetros válidos.
  params.forEach((valor, i) => {
    const valido =
      valor === null ||
      TIPOS_PARAM_VALIDOS.includes(typeof valor) ||
      typeof valor === 'boolean' ||
      valor instanceof Uint8Array;
    if (!valido) throw error(`el parámetro ${i + 1} tiene un tipo no permitido.`);
    if (typeof valor === 'number' && !Number.isFinite(valor)) {
      throw error(`el parámetro ${i + 1} no es un número válido.`);
    }
  });
}

// SQLite no tiene booleanos: se guardan como 1 / 0.
export function normalizarParametros(params = []) {
  return params.map((valor) => (typeof valor === 'boolean' ? (valor ? 1 : 0) : valor));
}

// Los nombres de tablas y columnas NO se pueden pasar como parámetro `?`.
// Si hace falta usar uno dinámico (por ejemplo, ordenar por una columna elegida por el
// usuario), pásalo por aquí con una lista de nombres permitidos.
//
//   const col = identificador(ordenPor, ['fecha', 'tipo', 'intensidad']);
//   await consultar(`SELECT * FROM actividades ORDER BY ${col}`);
export function identificador(nombre, permitidos) {
  if (!Array.isArray(permitidos) || permitidos.length === 0) {
    throw error('indica la lista de nombres permitidos.');
  }
  if (!permitidos.includes(nombre) || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(nombre)) {
    throw error(`el nombre "${String(nombre).slice(0, 30)}" no está permitido.`);
  }
  return nombre;
}

// Para búsquedas con LIKE: escapa % y _ del texto del usuario.
//
//   consultar('SELECT * FROM actividades WHERE nombre LIKE ? ESCAPE ?', [patronLike(texto), '\\'])
export function patronLike(texto, { modo = 'contiene' } = {}) {
  const limpio = String(texto ?? '').replace(/[\\%_]/g, (c) => `\\${c}`);
  if (modo === 'empieza') return `${limpio}%`;
  if (modo === 'termina') return `%${limpio}`;
  return `%${limpio}%`;
}
