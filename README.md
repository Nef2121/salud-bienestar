# Salud y Bienestar

Aplicación móvil de salud y bienestar (Proyecto 2, Diseño de Aplicaciones Móviles Avanzadas, ITCA-FEPADE).
Funciona en Android y en el navegador. Hecha con Expo (React Native), JavaScript, Expo Router y Firebase.

## Estructura

```
src/
  app/            Pantallas (Expo Router). (auth) = sin sesión, (app) = con sesión
  components/     Componentes reutilizables (Campo, Boton, Selector, Mensaje, Pantalla, Titulo)
  constants/      Tema visual (provisional, lo define el Miembro 4)
  context/        AuthContext: sesión del usuario (hook useAuth)
  services/       Firebase, autenticación, claves de cifrado, SQLite seguro, administración
  utils/          Validaciones, cifrado AES y reglas de SQL seguro
firestore.rules   Reglas de seguridad de Firestore
```

## Miembro 1: Gestión de usuarios y seguridad (hecho)

- **Autenticación** con Firebase Authentication: registro, inicio de sesión, recuperar contraseña y cerrar sesión.
  La sesión se mantiene al reabrir la app.
- **Validaciones** de formularios (`src/utils/validators.js`): correo, contraseña segura (mínimo 8 caracteres con
  mayúscula, minúscula y número), edad 12–100, peso 30–300 kg, altura 100–250 cm, tipo de sangre, DUI de
  9 dígitos con guion automático. Para menores de 18 años se pide el teléfono del encargado y el DUI es opcional.
- **Perfil** del usuario: ver y editar nombre, edad, sexo, peso, altura, tipo de sangre, DUI y objetivos de salud.
- **Roles**: `usuario`, `moderador` y `admin`. Los administradores tienen una pantalla para nombrar moderadores.
  Los admins se asignan a mano desde Firebase Console. Se pueden usar `esAdmin` y `esModerador` desde `useAuth()`.
- **Cifrado** AES-256-GCM de los datos personales y de salud del perfil en Firestore. Ni un administrador puede
  descifrarlos.
- **Prevención de ataques**: reglas de seguridad de Firestore (cada usuario solo accede a lo suyo, nadie puede
  asignarse el rol de admin) y consultas SQL parametrizadas obligatorias en `src/services/sqlite.js`.

## Para todo el equipo

- **Pantallas privadas** van dentro de `src/app/(app)/`; ahí solo entra quien tenga sesión.
- **Usuario actual:** `const { usuario } = useAuth()`; `usuario.uid` identifica al dueño de cada dato.
- **SQLite:** usar solo `src/services/sqlite.js`, nunca `expo-sqlite` directamente, y nunca armar SQL con
  texto concatenado. Cada tabla lleva `uid` y cada consulta filtra por él.
- **Firestore:** cada colección nueva necesita sus reglas en `firestore.rules`. Las reglas se publican
  a mano en Firebase Console y una sola persona publica el archivo completo.
- **Secretos:** la configuración de Firebase va solo en `.env`. Nunca en el código ni en GitHub.

## Estado y pendientes

- La autenticación y el perfil funcionan con Firebase real. Probados en navegador y Android.
- El acceso seguro a SQLite está listo, pero aún no se ha probado con tablas reales.
- SQLite en el navegador es experimental y la clave local es débil allí; los datos reales se prueban en Android.
