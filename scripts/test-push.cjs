const fs = require("fs"),
  vm = require("vm"),
  assert = require("node:assert/strict"),
  path = require("path");
let rol = "usuario",
  ultimo = 0,
  enviados = 0,
  borrados = 0;
const db = {
  doc: () => ({ get: async () => ({ data: () => ({ rol }) }) }),
  runTransaction: async (fn) =>
    fn({
      get: async () => ({
        data: () => ({ ultimo: { toMillis: () => ultimo } }),
      }),
      set: () => {
        ultimo = Date.now();
      },
    }),
  collection: () => ({
    limit: () => ({
      get: async () => ({
        empty: false,
        docs: [
          {
            data: () => ({ token: "token-prueba" }),
            ref: { delete: async () => borrados++ },
          },
        ],
      }),
    }),
  }),
};
class HttpsError extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}
const sandbox = {
  exports: {},
  require: (n) =>
    n === "firebase-admin/app"
      ? { initializeApp() {} }
      : n === "firebase-admin/firestore"
        ? { getFirestore: () => db, FieldValue: { serverTimestamp: () => 0 } }
        : n === "firebase-admin/messaging"
          ? {
              getMessaging: () => ({
                sendEachForMulticast: async () => {
                  enviados++;
                  return {
                    successCount: 0,
                    failureCount: 1,
                    responses: [
                      {
                        success: false,
                        error: {
                          code: "messaging/registration-token-not-registered",
                        },
                      },
                    ],
                  };
                },
              }),
            }
          : { onCall: (_, fn) => fn, HttpsError },
};
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, "../functions/index.js"), "utf8"),
  sandbox,
);
(async () => {
  const send = sandbox.exports.enviarAviso;
  const req = {
    auth: { uid: "moderador" },
    data: { destinatario: "usuario", categoria: "consejo" },
  };
  await assert.rejects(
    () => send({}),
    (e) => e.code === "unauthenticated",
  );
  await assert.rejects(
    () => send(req),
    (e) => e.code === "permission-denied",
  );
  rol = "moderador";
  await assert.rejects(
    () =>
      send({ ...req, data: { destinatario: "../otro", categoria: "consejo" } }),
    (e) => e.code === "invalid-argument",
  );
  await assert.rejects(
    () =>
      send({
        ...req,
        data: { destinatario: "usuario", categoria: "texto-arbitrario" },
      }),
    (e) => e.code === "invalid-argument",
  );
  const r = await send(req);
  assert.equal(r.fallidos, 1);
  assert.equal(enviados, 1);
  assert.equal(borrados, 1);
  await assert.rejects(
    () => send(req),
    (e) => e.code === "resource-exhausted",
  );
  console.log(
    "Push: autenticación, roles, entrada, límite de frecuencia y limpieza de token inválido OK (servidor simulado).",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
