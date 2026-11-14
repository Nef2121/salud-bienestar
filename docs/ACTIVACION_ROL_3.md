# Activación y comprobación del rol 3

## Qué está implementado

- Objetivos: nombre, valor inicial, valor actual, meta, unidad y fecha. El progreso sirve para metas ascendentes y descendentes. Alta, edición, eliminación, búsqueda y estados.
- Recordatorios: medicamento/vitamina, dosis introducida por el usuario, hora, frecuencia diaria o semanal, día, pausa y reactivación. El sistema operativo programa las alertas locales. No se calculan dosis.
- Comidas: menú, fecha, desayuno/almuerzo/cena/merienda, notas y estado consumida/pendiente. Alta, edición, eliminación y búsqueda.
- Datos cifrados con la clave ya existente del usuario. Rutas: users/{uid}/objetivos, recordatorios y comidas.
- Notificaciones: permisos, prueba local, registro y baja del token nativo FCM por dispositivo, renovación del token y función de envío restringida a administradores/moderadores. Cierre de sesión cancela las alertas locales y elimina el registro push.
- Mensajes de validación, confirmación, carga y errores. La eliminación requiere confirmación.

## 1. Publicar las reglas de Firestore

Las reglas se publicaron en salud-bienestar-9a678 el 13 de noviembre de 2026. Se conservaron las reglas remotas de actividades_fisicas y entrenamientos. Las pruebas del emulador de Firestore verificaron acceso del dueño, rechazo a otros usuarios, validación del contenido y compatibilidad con esos módulos.

1. Coordinar con la persona que publica las reglas para incorporar también cualquier cambio que hayan realizado otros miembros.
2. Firebase Console → Firestore Database → Reglas.
3. Revisar y publicar el archivo integrado completo. No reemplazar reglas nuevas de otros compañeros con una copia antigua.
4. Probar con dos usuarios: cada uno debe ver y modificar solo sus propios registros y dispositivos. Ni el administrador tiene acceso a los registros cifrados de planificación de otro usuario.

También está preparado firebase.json para utilizar Firebase CLI. Elegir explícitamente el proyecto correcto antes de desplegar. El archivo .firebaserc apunta a salud-bienestar-9a678.

## 2. Notificaciones locales

En la aplicación móvil, abrir Medicamentos y vitaminas → Activar alertas en este dispositivo. Aceptar el permiso. Crear un recordatorio unos minutos en el futuro y enviar la app al fondo.

Las notificaciones muestran un texto genérico para no exponer medicamentos en la pantalla bloqueada. Consultar la dosis dentro de la app. Máximo 50 recordatorios activos por dispositivo. La hora usa la zona horaria del dispositivo. No se solicitan alarmas exactas: el sistema puede retrasarlas por ahorro de batería. Un cierre forzado desde los ajustes del sistema puede impedir la entrega hasta volver a abrir la app.

En web solo se gestionan los datos; no hay programación de alertas del navegador. Si se modifica un recordatorio desde otro dispositivo mientras la app móvil está cerrada, se sincroniza la programación al volver a abrirla con conexión. No se promete sincronización remota mientras el proceso está detenido.

## 3. Configuración Android para FCM

1. En el mismo proyecto Firebase, registrar o seleccionar la app Android con paquete com.itca.saludbienestar.
2. Descargar google-services.json y colocarlo en la raíz del repositorio. app.config.js lo incorpora si existe. No usar credenciales de cuenta de servicio en la app.
3. Crear e instalar una compilación Android nativa (por ejemplo, npx expo run:android con Android Studio/SDK configurado). Expo Go no admite push remoto en Android.
4. Iniciar sesión → Notificaciones → Activar notificaciones push. El token se guarda en users/{uid}/dispositivos/{id}.
5. Usar una cuenta administradora/moderadora para probar el envío, después de desplegar la función.

## 4. Función de envío

El equipo eligió mantener el proyecto sin facturación. La función NO está desplegada y el formulario de envío está oculto por defecto. Para probar recepción se utiliza Firebase Console. Si en el futuro se despliega la función, configurar EXPO_PUBLIC_HABILITAR_ENVIO_PUSH=true.

functions/index.js exporta enviarAviso en us-central1. Usa Firebase Admin exclusivamente en el servidor. Autentica al emisor, comprueba su rol, acepta categorías predeterminadas y limita a un envío cada 30 segundos por emisor. Elimina tokens que FCM declara inválidos.

Requisitos externos: acceso de despliegue y facturación/servicios requeridos por Cloud Functions en el proyecto. No se habilitaron servicios ni facturación automáticamente.

Con Node 22 y Firebase CLI instalados:

~~~powershell
npm install --prefix functions
firebase login
firebase deploy --only functions:enviarAviso --project ID_DEL_PROYECTO
~~~

Desde Notificaciones, un moderador ingresa el UID del destinatario y selecciona recordatorio, consejo o actividad. Se envía un aviso genérico predeterminado. Es un envío manual; los medicamentos usan programación local, sin depender de esta función. Las sugerencias personalizadas siguen siendo responsabilidad del miembro 4.

No se necesita publicar las funciones para utilizar objetivos y comidas; sí se necesitan las reglas de sus colecciones.

## Pruebas reproducibles

~~~powershell
npm run test:planificacion
npx expo export --platform web
npx expo export --platform android
~~~

Las pruebas automáticas comprueban validación y progreso, programación/cancelación mediante una API nativa simulada, y autorización/límites del envío mediante un servidor simulado. No sustituyen las pruebas de reglas con un emulador ni la recepción real en Android.

Comprobar manualmente después de publicar reglas:

- Crear, editar y eliminar cada tipo de registro. Reiniciar y confirmar persistencia.
- Entrar con otra cuenta y verificar aislamiento.
- Objetivo descendente: inicio 80, actual 75, meta 70 → 50%; actual 70 → completado.
- Cancelar una eliminación mantiene el registro.
- Denegar permisos, concederlos después en ajustes y regresar a la app.
- Programar, editar hora, pausar y eliminar recordatorios; comprobar que no quedan avisos antiguos.
- Cerrar sesión y comprobar que no se reciben recordatorios de la cuenta anterior.
- Probar notificación push con la app abierta, en segundo plano y cerrada; renovar/desactivar el dispositivo.

## Estado de verificación de esta entrega

Compilaciones JavaScript web y Android comprobadas; no equivalen a una APK compilada e instalada. Las reglas sí se desplegaron; Cloud Functions no se desplegó por la decisión de mantener el proyecto sin facturación. La recepción en un teléfono y las capturas definitivas requieren configuración y prueba reales. Las pruebas de reglas se ejecutaron correctamente con Firebase Emulator Suite después de autenticar Firebase CLI.

Referencias: https://docs.expo.dev/versions/v58.0.0/sdk/notifications/ ; https://firebase.google.com/docs/functions/callable ; https://firebase.google.com/docs/cloud-messaging/send/admin-sdk

## Prueba push sin facturación

1. Abrir la compilación de desarrollo Android e iniciar sesión.
2. Notificaciones → Activar notificaciones push. Aceptar el permiso del sistema.
3. Copiar el Token FCM para pruebas que aparece en la pantalla de desarrollo (también se guarda en users/{uid}/dispositivos).
4. Firebase Console → Messaging → Crear una campaña de notificaciones / Nuevo mensaje. Escribir un título y texto de prueba.
5. Elegir Enviar mensaje de prueba, pegar el token de este emulador y enviar la prueba. No publicar una campaña general.
6. Comprobar recepción con la app abierta y en segundo plano. Al pulsarla debe abrir Notificaciones.

Esto prueba el transporte FCM real sin Cloud Functions. No habilita el envío automático desde la app. Los recordatorios locales siguen funcionando de forma independiente.

## Compilación Windows con rutas largas

Se añadió scripts/android-short-paths.gradle para acortar el directorio temporal de CMake y sus nombres de objetos. No modifica el registro de Windows ni mueve el proyecto. Desde la raíz, con Android SDK y Java configurados:

~~~powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA/Android/Sdk"
$init = (Resolve-Path ./scripts/android-short-paths.gradle).Path
./android/gradlew.bat -p android :app:assembleDebug -PreactNativeArchitectures=x86_64 -I $init
~~~

La arquitectura x86_64 corresponde al emulador de esta revisión. Para un teléfono ARM64, usar arm64-v8a. La versión de desarrollo requiere Metro: npx expo start --dev-client.
