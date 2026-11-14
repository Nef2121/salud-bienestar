export const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
export function fechaValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(valor + "T12:00:00");
  return (
    !Number.isNaN(fecha.getTime()) &&
    fecha.getFullYear() === Number(valor.slice(0, 4)) &&
    fecha.getMonth() + 1 === Number(valor.slice(5, 7)) &&
    fecha.getDate() === Number(valor.slice(8, 10))
  );
}
export function validarRegistro(tipo, datos) {
  const d = { ...datos, nombre: String(datos.nombre || "").trim() };
  if (d.nombre.length < 3 || d.nombre.length > 100)
    throw new Error("El nombre debe tener entre 3 y 100 caracteres.");
  if (tipo === "objetivos") {
    d.meta = Number(String(d.meta).replace(",", "."));
    d.actual = Number(String(d.actual).replace(",", "."));
    d.inicial = Number(String(d.inicial).replace(",", "."));
    d.unidad = String(d.unidad || "").trim();
    if (
      [datos.meta, datos.actual, datos.inicial].some(
        (v) => String(v).trim() === "",
      ) ||
      ![d.meta, d.actual, d.inicial].every(
        (n) => Number.isFinite(n) && n >= 0 && n <= 1000000,
      )
    )
      throw new Error("Escribe valores numéricos entre 0 y 1000000.");
    if (d.meta === d.inicial)
      throw new Error("La meta debe ser distinta del valor inicial.");
    if (!d.unidad || d.unidad.length > 30)
      throw new Error(
        "Indica una unidad de hasta 30 caracteres (kg, minutos, etc.).",
      );
    if (!fechaValida(d.fecha))
      throw new Error("Escribe una fecha válida: AAAA-MM-DD.");
    d.completado = d.meta > d.inicial ? d.actual >= d.meta : d.actual <= d.meta;
  } else if (tipo === "recordatorios") {
    d.dosis = String(d.dosis || "").trim();
    if (!d.dosis || d.dosis.length > 100)
      throw new Error("Indica la dosis prescrita (máximo 100 caracteres).");
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(d.hora))
      throw new Error("La hora debe tener formato HH:MM de 24 horas.");
    if (!["Diario", "Semanal"].includes(d.frecuencia) || !DIAS.includes(d.dia))
      throw new Error("Selecciona una frecuencia y día válidos.");
    d.activo = !!d.activo;
  } else if (tipo === "comidas") {
    if (!fechaValida(d.fecha))
      throw new Error("Escribe una fecha válida: AAAA-MM-DD.");
    if (!["Desayuno", "Almuerzo", "Cena", "Merienda"].includes(d.tipo))
      throw new Error("Selecciona el tipo de comida.");
    d.notas = String(d.notas || "").trim();
    if (d.notas.length > 500)
      throw new Error("Las notas no pueden superar 500 caracteres.");
    d.completado = !!d.completado;
  } else throw new Error("Módulo no válido.");
  return d;
}
export function progreso(d) {
  const porcentaje =
    ((Number(d.actual) - Number(d.inicial)) /
      (Number(d.meta) - Number(d.inicial))) *
    100;
  return Number.isFinite(porcentaje)
    ? Math.round(Math.min(100, Math.max(0, porcentaje)))
    : 0;
}
