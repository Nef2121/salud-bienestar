# Guía básica del usuario — Salud y Bienestar

Versión de trabajo para integrar al documento del equipo. Describe las pantallas implementadas en este repositorio. Las capturas reales y los módulos de los miembros 2 y 4 deben incorporarse cuando estén disponibles; no se presentan imágenes simuladas como evidencia.

## Acceder y crear una cuenta

Al abrir la aplicación se muestra Iniciar sesión. Escribir correo y contraseña y pulsar el botón de acceso. Para crear una cuenta, entrar en Registro, completar los datos solicitados y corregir los campos marcados en rojo. Para recuperar el acceso, utilizar Recuperar contraseña e introducir el correo. Revisar la bandeja de entrada y correo no deseado.

Capturas pendientes: inicio de sesión, formulario de registro y recuperación.

## Inicio y perfil

Inicio presenta accesos a Mi perfil, Mis objetivos, Medicamentos y vitaminas, Planificar comidas y Notificaciones. Mi perfil permite modificar los datos personales y guardar los cambios. Los objetivos generales del perfil expresan preferencias; Mis objetivos permite registrar metas medibles y seguir su progreso.

Capturas pendientes: inicio y perfil.

## Objetivos de salud

1. Abrir Mis objetivos.
2. Escribir un nombre, valor inicial, valor actual, meta y unidad. Ejemplo de demostración: caminar, inicio 0, actual 10, meta 30, unidad minutos.
3. Indicar la fecha objetivo con formato AAAA-MM-DD y pulsar Guardar.
4. Consultar el progreso en Mis registros. Buscar por nombre y filtrar pendientes/completados.
5. Para actualizar el avance, pulsar Editar en la tarjeta, modificar el valor actual en el formulario de arriba y Guardar cambios.
6. Marcar meta alcanzada coloca el valor actual en la meta. Para corregirlo, editar el valor actual.
7. Eliminar solicita una confirmación. Conservar cancela la eliminación.

Capturas pendientes: formulario de objetivo, tarjeta con progreso y confirmación de eliminación.

## Medicamentos y vitaminas

1. Abrir Medicamentos y vitaminas y activar las alertas del dispositivo móvil.
2. Introducir nombre, dosis indicada por el profesional de salud y hora en formato de 24 horas (por ejemplo, 08:30).
3. Elegir Diario o Semanal. En Semanal, seleccionar el día.
4. Guardar y comprobar el estado de la programación mostrado en pantalla.
5. Utilizar Pausar para detener las alertas de ese recordatorio; Activar las habilita nuevamente. Editar permite cambiar los datos y el horario.
6. Para varias tomas diarias, crear un registro por horario.

Las alertas no muestran la dosis en la pantalla bloqueada; consultar los detalles dentro de la app. No cambiar dosis a partir de esta guía. En el navegador se gestionan registros, pero las alertas programadas se reciben en el móvil. Al modificar datos desde otro dispositivo, volver a abrir la app móvil con conexión para actualizar sus alertas.

Capturas pendientes: formulario diario/semanal, permiso del sistema, tarjeta pausada y notificación real en Android.

## Planificador de comidas

Abrir Planificar comidas. Escribir el menú, fecha, tipo de comida e ingredientes o notas opcionales. Guardar. Las tarjetas se ordenan por fecha; se pueden buscar por nombre y filtrar por estado. Marcar consumida registra que la comida se realizó; Marcar pendiente revierte ese estado. Editar y Eliminar funcionan como en los objetivos.

Capturas pendientes: formulario y listado de comidas.

## Notificaciones

Activar recordatorios locales solicita permisos en el móvil. Probar alerta en 5 segundos permite comprobar la recepción. Activar notificaciones push registra este dispositivo para recibir avisos remotos; requiere la versión Android configurada del proyecto. Desactivar notificaciones push elimina ese registro, sin borrar objetivos, comidas o recordatorios.

Solo si el equipo despliega la función de envío y habilita esa opción, las cuentas administradoras/moderadoras ven Enviar aviso. Actualmente se mantiene desactivada para conservar el proyecto sin facturación. Introducir el UID del destinatario, elegir la categoría y pulsar Enviar notificación. El destinatario debe haber activado push. La pantalla informa cuántos envíos aceptó el servicio y cuántos fallaron; aceptación no garantiza que el teléfono haya mostrado el aviso.

Capturas pendientes: configuración de notificaciones y envío con cuenta autorizada.

## Administración y cierre de sesión

Las cuentas administradoras pueden abrir Administrar usuarios y gestionar los roles permitidos por el sistema. Cerrar sesión, desde Inicio, cancela los recordatorios de este dispositivo y desregistra sus notificaciones push para esa cuenta. Si ocurre un error de conexión, revisarlo y volver a intentar.

Captura pendiente: administración (sin datos personales reales).

## Mensajes frecuentes

- Nombre demasiado corto: escribir al menos tres caracteres.
- Fecha inválida: usar una fecha existente con formato AAAA-MM-DD.
- Hora inválida: usar HH:MM entre 00:00 y 23:59.
- Sin permiso de datos: solicitar al responsable del proyecto que revise las reglas de Firebase.
- Sin permiso de notificaciones: habilitarlo en los ajustes del sistema.
- Sin conexión: restablecer internet y comprobar el resultado antes de repetir una operación.

## Pendientes del documento completo

Solicitar a cada integrante las capturas de sus pantallas. Añadir las instrucciones de actividad, entrenamientos, estadísticas, foro y consejos cuando estén implementados. No aparecen en esta copia del repositorio. Integrar esta guía al documento final con Arial 11, títulos 12, interlineado 1.5, papel carta y márgenes de 2.5 cm, según la repartición del equipo.
