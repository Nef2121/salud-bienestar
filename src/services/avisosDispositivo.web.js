export const esWeb = true;
export async function permiso() {
  return false;
}
export async function sincronizar() {
  return "En el navegador puedes gestionar tus recordatorios. Las alertas programadas se reciben en la app móvil.";
}
export async function tokenFCM() {
  throw new Error(
    "Abre la compilación Android para activar notificaciones push.",
  );
}
export const escucharToken = () => ({ remove() {} });
export const escucharApertura = () => ({ remove() {} });
export async function pruebaLocal() {
  throw new Error("La prueba de alertas requiere la app móvil.");
}
