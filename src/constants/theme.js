// TEMA VISUAL (Miembro 4). Todas las pantallas leen estos valores: al cambiarlos aquí
// se actualiza toda la app. Los nombres anteriores (colores, espacio, radio, anchoMaximo)
// se conservan para no romper las pantallas de los demás módulos.
export const colores = {
  primario: '#2E7D6B',
  primarioOscuro: '#225F51',
  fondo: '#F4F8F6',
  superficie: '#FFFFFF',
  texto: '#1B2B27',
  textoSuave: '#5B6B66',
  borde: '#C9D6D2',
  suave: '#E3EEEA',
  error: '#C62828',
  errorFondo: '#FDECEA',
  exito: '#2E7D32',
  exitoFondo: '#E8F5E9',
};

export const espacio = { xs: 4, s: 8, m: 16, l: 24, xl: 32 };
export const radio = 10;
export const radioGrande = 16;
export const anchoMaximo = 480;

// Tamaños de letra (se usa la fuente del sistema: Roboto en Android, San Francisco en iOS).
export const tipografia = {
  titulo: { fontSize: 26, fontWeight: '700' },
  seccion: { fontSize: 18, fontWeight: '700' },
  subtitulo: { fontSize: 15, fontWeight: '400' },
  cuerpo: { fontSize: 16, fontWeight: '400' },
  etiqueta: { fontSize: 12, fontWeight: '600' },
};

// Sombra suave para tarjetas (funciona en Android, iOS y web).
export const sombra = {
  shadowColor: '#000000',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
