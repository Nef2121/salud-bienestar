// API externa (Miembro 4): artículos de salud desde la API pública de Wikipedia en español.
// No requiere clave. Los resultados se guardan en memoria para no repetir descargas.

export const TEMAS = [
  { etiqueta: 'Dieta equilibrada', pagina: 'Dieta_equilibrada' },
  { etiqueta: 'Higiene del sueño', pagina: 'Higiene_del_sueño' },
  { etiqueta: 'Ejercicio físico', pagina: 'Ejercicio_físico' },
  { etiqueta: 'Estrés', pagina: 'Estrés' },
];

const URL_BASE = 'https://es.wikipedia.org/api/rest_v1/page/summary/';
const AGENTE = 'SaludBienestarApp/1.0 (proyecto academico ITCA-FEPADE)';
const cache = new Map();

export async function descargarResumen(pagina) {
  if (cache.has(pagina)) return cache.get(pagina);

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), 10000);
  try {
    const respuesta = await fetch(URL_BASE + encodeURIComponent(pagina), {
      headers: {
        Accept: 'application/json',
        'User-Agent': AGENTE,
        'Api-User-Agent': AGENTE,
      },
      signal: control.signal,
    });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const datos = await respuesta.json();
    if (!datos.extract) throw new Error('Respuesta sin texto');

    const resultado = {
      titulo: datos.title,
      texto: datos.extract,
      url: datos.content_urls?.mobile?.page ?? datos.content_urls?.desktop?.page ?? null,
    };
    cache.set(pagina, resultado);
    return resultado;
  } catch (e) {
    console.log('ERROR ARTICULO:', pagina, e?.name, e?.message);
    throw new Error(
      e?.name === 'AbortError'
        ? 'La descarga tardó demasiado. Inténtalo de nuevo.'
        : 'No se pudo descargar el artículo. Revisa tu conexión e inténtalo de nuevo.',
    );
  } finally {
    clearTimeout(temporizador);
  }
}