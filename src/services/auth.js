import { limpiarNotificaciones } from './notificaciones';
// Autenticación con Firebase Authentication (correo y contraseña) y perfil en Firestore.
// Las pantallas solo usan estas funciones (a través de AuthContext).
//
// Perfil: colección "users", un documento por usuario (id = uid de Authentication).

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { cifrarObjeto, descifrarObjeto } from '../utils/cifrado';
import { claveDeUsuario, generarNonce, olvidarClaves } from './claves';
import { auth, db } from './firebase';

const ROL_POR_DEFECTO = 'usuario'; // roles: 'usuario' | 'moderador' | 'admin'

// Estos campos (identificación y salud) se guardan cifrados dentro de `cifrado`.
// El resto (nombre, edad, sexo, objetivos, rol, correo) queda legible para que las
// reglas de Firestore y la pantalla de administración puedan usarlos.
const CAMPOS_CIFRADOS = ['dui', 'tipoSangre', 'telefonoEncargado', 'peso', 'altura'];

function separarCampos(perfil) {
  const claros = {};
  const secretos = {};
  for (const [campo, valor] of Object.entries(perfil)) {
    if (CAMPOS_CIFRADOS.includes(campo)) secretos[campo] = valor;
    else claros[campo] = valor;
  }
  return { claros, secretos };
}

async function cifrarCampos(uid, secretos, { crearClave = false } = {}) {
  const clave = await claveDeUsuario(uid, { crear: crearClave });
  return cifrarObjeto(secretos, clave, generarNonce());
}

// Documento de Firestore -> perfil completo (descifrado) que usa la app.
async function descifrarDocumento(uid, datos) {
  if (!datos) return null;
  const { cifrado, creado: _creado, ...claros } = datos;
  if (!cifrado) return claros;
  const clave = await claveDeUsuario(uid);
  return { ...claros, ...descifrarObjeto(cifrado, clave) };
}

const MENSAJES = {
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/invalid-email': 'El correo no es válido.',
  'auth/weak-password': 'La contraseña es demasiado débil.',
  // Mismo mensaje para correo inexistente y contraseña incorrecta (no revela cuál falló).
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet e inténtalo de nuevo.',
  'permission-denied': 'No tienes permiso para realizar esta acción.',
  unavailable: 'Sin conexión. Revisa tu internet e inténtalo de nuevo.',
};

function traducir(e, porDefecto) {
  const err = new Error(MENSAJES[e?.code] || porDefecto);
  err.codigo = e?.code;
  return err;
}

async function leerPerfil(uid) {
  const instantanea = await getDoc(doc(db, 'users', uid));
  return instantanea.exists() ? descifrarDocumento(uid, instantanea.data()) : null;
}

function aSesion(user, perfil) {
  return { uid: user.uid, correo: user.email, perfil };
}

// Mientras se registra un usuario, el listener de sesión espera a que se cree
// su perfil (si no, leería un perfil que todavía no existe).
let registrando = false;
let sesionActual = null;
let estadoConocido = false; // true cuando Firebase ya informó si hay sesión o no
const oyentes = new Set();

function publicar(sesion) {
  sesionActual = sesion;
  estadoConocido = true;
  oyentes.forEach((oyente) => oyente(sesion));
}

onAuthStateChanged(auth, async (user) => {
  if (registrando) return;
  if (!user) {
    olvidarClaves();
    return publicar(null);
  }
  try {
    publicar(aSesion(user, await leerPerfil(user.uid)));
  } catch {
    // Sin perfil legible no se puede usar la app: se cierra la sesión.
    await limpiarNotificaciones(auth.currentUser?.uid);
  await signOut(auth);
    publicar(null);
  }
});

// Llama a `oyente` con la sesión actual (o null) y cada vez que cambie.
// Hasta que Firebase informe el estado inicial no se llama a `oyente`.
export function escucharSesion(oyente) {
  oyentes.add(oyente);
  if (estadoConocido) oyente(sesionActual);
  return () => oyentes.delete(oyente);
}

export async function registrar(correo, password, perfil) {
  registrando = true;
  try {
    const { user } = await createUserWithEmailAndPassword(auth, correo.trim(), password);
    const { claros, secretos } = separarCampos(perfil);
    try {
      const cifrado = await cifrarCampos(user.uid, secretos, { crearClave: true });
      await setDoc(doc(db, 'users', user.uid), {
        ...claros,
        correo: user.email,
        rol: ROL_POR_DEFECTO,
        cifrado,
        creado: serverTimestamp(),
      });
    } catch (e) {
      // Si falla el perfil, se elimina la cuenta para no dejarla a medias.
      await user.delete().catch(() => {});
      throw e;
    }
    const sesion = aSesion(user, { ...perfil, correo: user.email, rol: ROL_POR_DEFECTO });
    publicar(sesion);
    return sesion;
  } catch (e) {
    throw traducir(e, 'No se pudo crear la cuenta. Inténtalo de nuevo.');
  } finally {
    registrando = false;
  }
}

export async function iniciarSesion(correo, password) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, correo.trim(), password);
    const sesion = aSesion(user, await leerPerfil(user.uid));
    publicar(sesion);
    return sesion;
  } catch (e) {
    throw traducir(e, 'No se pudo iniciar sesión. Inténtalo de nuevo.');
  }
}

export async function cerrarSesion() {
  await signOut(auth);
  olvidarClaves();
  publicar(null);
}

export async function recuperarPassword(correo) {
  try {
    await sendPasswordResetEmail(auth, correo.trim());
  } catch (e) {
    // No se revela si el correo existe: solo se informan errores de red u otros.
    if (e?.code === 'auth/user-not-found' || e?.code === 'auth/invalid-email') return;
    throw traducir(e, 'No se pudo enviar el correo. Inténtalo de nuevo.');
  }
}

export async function guardarPerfil(uid, cambios) {
  try {
    // El rol y el correo nunca se envían desde el perfil; además las reglas de Firestore
    // bloquean el cambio de rol.
    const { rol: _rol, correo: _correo, ...sinRol } = cambios;
    const completo = { ...sesionActual.perfil, ...sinRol };
    const { rol: _r, correo: _c, ...editable } = completo;
    const { claros, secretos } = separarCampos(editable);
    await updateDoc(doc(db, 'users', uid), { ...claros, cifrado: await cifrarCampos(uid, secretos) });
    const sesion = { ...sesionActual, perfil: completo };
    publicar(sesion);
    return sesion;
  } catch (e) {
    throw traducir(e, 'No se pudo guardar el perfil. Inténtalo de nuevo.');
  }
}
