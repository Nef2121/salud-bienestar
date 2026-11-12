// Administración de usuarios (solo para el rol 'admin'; las reglas de Firestore lo exigen).
// El admin ve nombre, correo y rol. Los datos cifrados (DUI, sangre, peso...) no se leen aquí.

import { collection, doc, getDocs, limit, query, updateDoc } from 'firebase/firestore';

import { db } from './firebase';

export const ROLES_ASIGNABLES = ['usuario', 'moderador'];

export async function listarUsuarios() {
  try {
    const resultado = await getDocs(query(collection(db, 'users'), limit(200)));
    return resultado.docs
      .map((d) => {
        const { nombre, correo, rol } = d.data();
        return { uid: d.id, nombre: nombre ?? '(sin nombre)', correo: correo ?? '', rol: rol ?? 'usuario' };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  } catch (e) {
    throw new Error(
      e?.code === 'permission-denied'
        ? 'No tienes permiso para ver los usuarios.'
        : 'No se pudo cargar la lista de usuarios.',
    );
  }
}

export async function cambiarRol(uid, rol) {
  if (!ROLES_ASIGNABLES.includes(rol)) throw new Error('Rol no permitido.');
  try {
    await updateDoc(doc(db, 'users', uid), { rol });
  } catch (e) {
    throw new Error(
      e?.code === 'permission-denied'
        ? 'No tienes permiso para cambiar ese rol.'
        : 'No se pudo cambiar el rol. Inténtalo de nuevo.',
    );
  }
}
