// Validaciones de formularios (registro, login y perfil).
// Cada validador devuelve un mensaje de error (string) o '' si el valor es válido.

export const RANGOS = {
  edad: { min: 12, max: 100 },
  peso: { min: 30, max: 300 }, // kg
  altura: { min: 100, max: 250 }, // cm
};

export const MAYORIA_EDAD = 18;
export const SEXOS = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'];
export const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const OBJETIVOS = [
  'Perder peso',
  'Ganar músculo',
  'Mantener peso',
  'Mejorar resistencia',
  'Dormir mejor',
  'Reducir estrés',
];

// ---------- Utilidades ----------

export function aNumero(texto) {
  const limpio = String(texto ?? '').trim().replace(',', '.');
  if (limpio === '') return NaN;
  return Number(limpio);
}

export function esMenor(edadTexto) {
  const edad = aNumero(edadTexto);
  return Number.isInteger(edad) && edad >= RANGOS.edad.min && edad < MAYORIA_EDAD;
}

// "123456789" -> "12345678-9"
export function formatearDui(texto) {
  const digitos = String(texto ?? '').replace(/\D/g, '').slice(0, 9);
  return digitos.length > 8 ? `${digitos.slice(0, 8)}-${digitos.slice(8)}` : digitos;
}

// Quita espacios, guiones y el prefijo +503. Devuelve solo dígitos.
export function limpiarTelefono(texto) {
  let digitos = String(texto ?? '').replace(/\D/g, '');
  if (digitos.length === 11 && digitos.startsWith('503')) digitos = digitos.slice(3);
  return digitos;
}

// ---------- Validadores de campo ----------

export function validarCorreo(correo) {
  const valor = String(correo ?? '').trim();
  if (!valor) return 'El correo es obligatorio.';
  if (valor.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) {
    return 'Ingresa un correo válido (ejemplo: nombre@correo.com).';
  }
  return '';
}

export function validarPassword(password) {
  const valor = String(password ?? '');
  if (!valor) return 'La contraseña es obligatoria.';
  if (valor.length < 8) return 'Debe tener al menos 8 caracteres.';
  if (valor.length > 64) return 'No puede superar los 64 caracteres.';
  if (!/[a-z]/.test(valor)) return 'Debe incluir una letra minúscula.';
  if (!/[A-Z]/.test(valor)) return 'Debe incluir una letra mayúscula.';
  if (!/\d/.test(valor)) return 'Debe incluir un número.';
  return '';
}

export function validarConfirmacion(password, confirmacion) {
  if (!confirmacion) return 'Confirma tu contraseña.';
  if (password !== confirmacion) return 'Las contraseñas no coinciden.';
  return '';
}

export function validarNombre(nombre) {
  const valor = String(nombre ?? '').trim();
  if (!valor) return 'El nombre es obligatorio.';
  if (valor.length < 2) return 'El nombre es demasiado corto.';
  if (valor.length > 60) return 'El nombre no puede superar los 60 caracteres.';
  if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(valor)) return 'El nombre solo puede contener letras.';
  return '';
}

export function validarEdad(edadTexto) {
  const { min, max } = RANGOS.edad;
  const edad = aNumero(edadTexto);
  if (String(edadTexto ?? '').trim() === '') return 'La edad es obligatoria.';
  if (!Number.isInteger(edad)) return 'La edad debe ser un número entero.';
  if (edad < min || edad > max) return `La edad debe estar entre ${min} y ${max} años.`;
  return '';
}

export function validarPeso(pesoTexto) {
  const { min, max } = RANGOS.peso;
  const peso = aNumero(pesoTexto);
  if (String(pesoTexto ?? '').trim() === '') return 'El peso es obligatorio.';
  if (!Number.isFinite(peso)) return 'El peso debe ser un número.';
  if (peso < min || peso > max) return `El peso debe estar entre ${min} y ${max} kg.`;
  return '';
}

export function validarAltura(alturaTexto) {
  const { min, max } = RANGOS.altura;
  const altura = aNumero(alturaTexto);
  if (String(alturaTexto ?? '').trim() === '') return 'La altura es obligatoria.';
  if (!Number.isFinite(altura)) return 'La altura debe ser un número.';
  if (altura < min || altura > max) return `La altura debe estar entre ${min} y ${max} cm.`;
  return '';
}

export function validarSexo(sexo) {
  return SEXOS.includes(sexo) ? '' : 'Selecciona una opción.';
}

export function validarTipoSangre(tipo) {
  return TIPOS_SANGRE.includes(tipo) ? '' : 'Selecciona tu tipo de sangre.';
}

// DUI de El Salvador: 9 dígitos con guion antes del último (formato 12345678-9).
// Solo se valida la cantidad de dígitos: se acepta cualquier número. La comprobación
// del dígito verificador oficial está comentada abajo; para activarla, descoméntala.
export function validarDui(dui, { obligatorio = true } = {}) {
  const valor = String(dui ?? '').trim();
  if (!valor) return obligatorio ? 'El DUI es obligatorio.' : '';
  if (!/^\d{8}-?\d$/.test(valor)) return 'El DUI debe tener 9 dígitos (formato 12345678-9).';
  // Dígito verificador: suma de (dígito × peso) con pesos 9..2; verificador = (10 - suma % 10) % 10.
  // const digitos = valor.replace('-', '').split('').map(Number);
  // const suma = digitos
  //   .slice(0, 8)
  //   .reduce((total, digito, i) => total + digito * (9 - i), 0);
  // const verificador = (10 - (suma % 10)) % 10;
  // if (verificador !== digitos[8]) return 'El DUI no es válido (dígito verificador incorrecto).';
  return '';
}

// Teléfono de El Salvador: 8 dígitos que empiezan con 2 (fijo), 6 o 7 (móvil).
export function validarTelefono(telefono) {
  const digitos = limpiarTelefono(telefono);
  if (!digitos) return 'El teléfono del encargado es obligatorio para menores de edad.';
  if (!/^[267]\d{7}$/.test(digitos)) {
    return 'Ingresa un teléfono válido de 8 dígitos (ejemplo: 7123-4567).';
  }
  return '';
}

export function validarObjetivos(objetivos) {
  if (!Array.isArray(objetivos) || objetivos.length === 0) {
    return 'Selecciona al menos un objetivo de salud.';
  }
  return '';
}

// ---------- Validación del perfil completo ----------

// `valores` viene del formulario (todo texto, objetivos es un arreglo).
// Devuelve un objeto { campo: mensaje } solo con los campos que tienen error.
export function validarPerfil(valores) {
  const menor = esMenor(valores.edad);
  const errores = {
    nombre: validarNombre(valores.nombre),
    edad: validarEdad(valores.edad),
    sexo: validarSexo(valores.sexo),
    peso: validarPeso(valores.peso),
    altura: validarAltura(valores.altura),
    tipoSangre: validarTipoSangre(valores.tipoSangre),
    // Los menores no tienen DUI: es obligatorio solo para mayores de edad.
    dui: validarDui(valores.dui, { obligatorio: !menor }),
    telefonoEncargado: menor ? validarTelefono(valores.telefonoEncargado) : '',
    objetivos: validarObjetivos(valores.objetivos),
  };
  return Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje));
}

// Convierte los textos del formulario en el objeto que se guarda.
export function normalizarPerfil(valores) {
  const menor = esMenor(valores.edad);
  return {
    nombre: valores.nombre.trim().replace(/\s+/g, ' '),
    edad: aNumero(valores.edad),
    sexo: valores.sexo,
    peso: aNumero(valores.peso),
    altura: aNumero(valores.altura),
    tipoSangre: valores.tipoSangre,
    dui: valores.dui ? formatearDui(valores.dui) : '',
    telefonoEncargado: menor ? limpiarTelefono(valores.telefonoEncargado) : '',
    objetivos: valores.objetivos,
  };
}

// Inverso: convierte un perfil guardado en textos para el formulario.
export function perfilAFormulario(perfil = {}) {
  return {
    nombre: perfil.nombre ?? '',
    edad: perfil.edad != null ? String(perfil.edad) : '',
    sexo: perfil.sexo ?? '',
    peso: perfil.peso != null ? String(perfil.peso) : '',
    altura: perfil.altura != null ? String(perfil.altura) : '',
    tipoSangre: perfil.tipoSangre ?? '',
    dui: perfil.dui ?? '',
    telefonoEncargado: perfil.telefonoEncargado ?? '',
    objetivos: perfil.objetivos ?? [],
  };
}
