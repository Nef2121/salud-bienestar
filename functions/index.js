const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
initializeApp();
const textos = {
  recordatorio: "Revisa tus recordatorios de salud.",
  consejo: "Dedica un momento a revisar tus hábitos de bienestar.",
  actividad: "Revisa tus objetivos y registra tus avances.",
};
exports.enviarAviso = onCall(
  { region: "us-central1", maxInstances: 3 },
  async (request) => {
    if (!request.auth)
      throw new HttpsError("unauthenticated", "Inicia sesión.");
    const db = getFirestore();
    const perfil = await db.doc("users/" + request.auth.uid).get();
    if (!["admin", "moderador"].includes(perfil.data()?.rol))
      throw new HttpsError(
        "permission-denied",
        "Solo administradores y moderadores pueden enviar avisos.",
      );
    const { destinatario, categoria } = request.data || {};
    if (
      typeof destinatario !== "string" ||
      !/^[a-zA-Z0-9_-]{1,128}$/.test(destinatario) ||
      !Object.hasOwn(textos, categoria)
    )
      throw new HttpsError(
        "invalid-argument",
        "Destinatario o categoría inválidos.",
      );
    const limite = db.doc("limitesAvisos/" + request.auth.uid);
    await db.runTransaction(async (t) => {
      const anterior = await t.get(limite);
      if (Date.now() - (anterior.data()?.ultimo?.toMillis() || 0) < 30000)
        throw new HttpsError(
          "resource-exhausted",
          "Espera 30 segundos entre envíos.",
        );
      t.set(limite, { ultimo: FieldValue.serverTimestamp() });
    });
    const dispositivos = await db
      .collection("users/" + destinatario + "/dispositivos")
      .limit(100)
      .get();
    if (dispositivos.empty)
      throw new HttpsError(
        "failed-precondition",
        "El destinatario no tiene dispositivos registrados.",
      );
    const resultado = await getMessaging().sendEachForMulticast({
      tokens: dispositivos.docs.map((d) => d.data().token),
      notification: { title: "Salud y Bienestar", body: textos[categoria] },
      data: { categoria, ruta: "/notificaciones" },
      android: {
        priority: "high",
        ttl: 3600000,
        notification: { channelId: "salud" },
      },
    });
    await Promise.all(
      resultado.responses.map((r, i) =>
        !r.success &&
        [
          "messaging/registration-token-not-registered",
          "messaging/invalid-registration-token",
        ].includes(r.error?.code)
          ? dispositivos.docs[i].ref.delete()
          : null,
      ),
    );
    return {
      enviados: resultado.successCount,
      fallidos: resultado.failureCount,
    };
  },
);
