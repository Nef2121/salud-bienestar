import * as Notifications from "expo-notifications";
import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";
import { DIAS } from "../utils/planificacion";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export const esWeb = false;
export async function permiso(solicitar = false) {
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("salud", {
      name: "Recordatorios de bienestar",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  let p = await Notifications.getPermissionsAsync();
  if (!p.granted && solicitar)
    p = await Notifications.requestPermissionsAsync();
  return (
    p.granted ||
    p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}
export async function sincronizar(uid, registros) {
  const actuales = (
    await Notifications.getAllScheduledNotificationsAsync()
  ).filter((n) => n.identifier.startsWith("salud:"));
  const permitidas = uid && (await permiso());
  const activos = permitidas ? registros.filter((r) => r.activo) : [];
  const deseados = new Map(
    activos.map((r) => ["salud:" + uid + ":" + r.id, r]),
  );
  for (const n of actuales) {
    const r = deseados.get(n.identifier);
    const firma = r ? JSON.stringify([r.hora, r.frecuencia, r.dia]) : "";
    if (!r || n.content.data?.firma !== firma)
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    else deseados.delete(n.identifier);
  }
  if (activos.length > 50)
    throw new Error(
      "Máximo 50 recordatorios activos por dispositivo. Pausa algunos antes de activar más.",
    );
  for (const [identifier, r] of deseados) {
    const [hour, minute] = r.hora.split(":").map(Number);
    const trigger =
      r.frecuencia === "Semanal"
        ? {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: DIAS.indexOf(r.dia) + 1,
            hour,
            minute,
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          };
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: "Recordatorio de salud",
        body: "Tienes un recordatorio programado. Abre la aplicación para consultarlo.",
        sound: "default",
        data: {
          ruta: "/recordatorios",
          firma: JSON.stringify([r.hora, r.frecuencia, r.dia]),
        },
      },
      trigger: { ...trigger, channelId: "salud" },
    });
  }
  return permitidas
    ? activos.length + " recordatorios programados en este dispositivo."
    : "Las alertas están desactivadas en este dispositivo. Puedes habilitarlas con el botón de abajo.";
}
export async function tokenFCM() {
  if (Platform.OS !== "android")
    throw new Error(
      "El registro FCM de este módulo está disponible en Android.",
    );
  if (isRunningInExpoGo())
    throw new Error(
      "Para FCM instala una compilación Android de desarrollo; Expo Go no admite push remoto.",
    );
  if (!(await permiso(true)))
    throw new Error("Permite las notificaciones en los ajustes del teléfono.");
  return (await Notifications.getDevicePushTokenAsync()).data;
}
export function escucharToken(callback) {
  if (isRunningInExpoGo() || Platform.OS !== "android") return { remove() {} };
  return Notifications.addPushTokenListener((t) => {
    if (Platform.OS === "android") callback(t.data);
  });
}
export function escucharApertura(callback) {
  const sub = Notifications.addNotificationResponseReceivedListener(() =>
    callback(),
  );
  Notifications.getLastNotificationResponseAsync()
    .then((r) => {
      if (r) {
        callback();
        Notifications.clearLastNotificationResponseAsync();
      }
    })
    .catch(() => {});
  return sub;
}
export async function pruebaLocal() {
  if (!(await permiso(true)))
    throw new Error("No se concedió permiso de notificaciones.");
  await Notifications.scheduleNotificationAsync({
    identifier: "salud:prueba",
    content: {
      title: "Salud y Bienestar",
      body: "Las notificaciones locales están funcionando.",
      data: { ruta: "/recordatorios" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: "salud",
    },
  });
}
