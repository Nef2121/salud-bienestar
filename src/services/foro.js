// Foro de salud (Miembro 4). Colección `foro_posts`, con subcolección `comentarios`.
// Las reglas de seguridad están en firestore.rules.

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';

import { db } from './firebase';

export const CATEGORIAS = ['Ejercicio', 'Dieta', 'Sueño', 'Bienestar', 'Otro'];

const conFecha = (d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) });

const mensajeError = (e, porDefecto) =>
  e?.code === 'permission-denied' ? 'No tienes permiso para hacer esto.' : porDefecto;

// Escuchan en tiempo real. Devuelven la función para dejar de escuchar.
export function escucharPosts(alRecibir, alFallar) {
  const q = query(collection(db, 'foro_posts'), orderBy('creado', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snap) => alRecibir(snap.docs.map(conFecha)),
    () => alFallar('No se pudieron cargar las publicaciones.'),
  );
}

export function escucharPost(postId, alRecibir, alFallar) {
  return onSnapshot(
    doc(db, 'foro_posts', postId),
    (snap) => alRecibir(snap.exists() ? conFecha(snap) : null),
    () => alFallar('No se pudo cargar la publicación.'),
  );
}

export function escucharComentarios(postId, alRecibir, alFallar) {
  const q = query(
    collection(db, 'foro_posts', postId, 'comentarios'),
    orderBy('creado', 'asc'),
    limit(200),
  );
  return onSnapshot(
    q,
    (snap) => alRecibir(snap.docs.map(conFecha)),
    () => alFallar('No se pudieron cargar los comentarios.'),
  );
}

export async function crearPost({ usuario, categoria, titulo, contenido }) {
  try {
    await addDoc(collection(db, 'foro_posts'), {
      uid: usuario.uid,
      autor: usuario.perfil.nombre,
      categoria,
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      creado: serverTimestamp(),
    });
  } catch (e) {
    throw new Error(mensajeError(e, 'No se pudo publicar. Inténtalo de nuevo.'));
  }
}

export async function crearComentario({ usuario, postId, contenido }) {
  try {
    await addDoc(collection(db, 'foro_posts', postId, 'comentarios'), {
      uid: usuario.uid,
      autor: usuario.perfil.nombre,
      contenido: contenido.trim(),
      creado: serverTimestamp(),
    });
  } catch (e) {
    throw new Error(mensajeError(e, 'No se pudo comentar. Inténtalo de nuevo.'));
  }
}

export async function eliminarPost(postId) {
  try {
    await deleteDoc(doc(db, 'foro_posts', postId));
  } catch (e) {
    throw new Error(mensajeError(e, 'No se pudo eliminar la publicación.'));
  }
}

export async function eliminarComentario(postId, comentarioId) {
  try {
    await deleteDoc(doc(db, 'foro_posts', postId, 'comentarios', comentarioId));
  } catch (e) {
    throw new Error(mensajeError(e, 'No se pudo eliminar el comentario.'));
  }
}

// Devuelve la lista de uid que dieron "me gusta" (el contador es su longitud).
export function escucharLikes(postId, alRecibir, alFallar) {
  return onSnapshot(
    collection(db, 'foro_posts', postId, 'likes'),
    (snap) => alRecibir(snap.docs.map((d) => d.id)),
    (e) => {
      console.log('ERROR LIKES:', e?.code, e?.message);
      alFallar('No se pudieron cargar los "me gusta".');
    },
  );
}

// El documento usa el uid como ID: un solo "me gusta" por usuario.
export async function alternarLike({ usuario, postId, likeDado }) {
  const ref = doc(db, 'foro_posts', postId, 'likes', usuario.uid);
  try {
    if (likeDado) await deleteDoc(ref);
    else await setDoc(ref, { uid: usuario.uid, creado: serverTimestamp() });
  } catch (e) {
    throw new Error(mensajeError(e, 'No se pudo actualizar el "me gusta".'));
  }
}

export function formatearFecha(valor) {
  const f = valor?.toDate ? valor.toDate() : null;
  if (!f) return '';
  const dia = f.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
  const hora = f.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  return `${dia}, ${hora}`;
}