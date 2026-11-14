const fs = require("fs"),
  assert = require("node:assert/strict"),
  vm = require("vm");
const root = require("path").resolve(__dirname, "..");
const script = fs
  .readFileSync(root + "/src/utils/planificacion.js", "utf8")
  .replaceAll("export ", "");
const ctx = vm.createContext({});
vm.runInContext(
  script + "\nthis.api={fechaValida,validarRegistro,progreso};",
  ctx,
);
const { fechaValida, validarRegistro, progreso } = ctx.api;
assert.equal(fechaValida("2026-02-29"), false);
assert.equal(fechaValida("2028-02-29"), true);
assert.equal(fechaValida("2026-04-31"), false);
const base = {
  nombre: "Meta saludable",
  inicial: 80,
  actual: 75,
  meta: 70,
  unidad: "kg",
  fecha: "2026-12-31",
};
assert.equal(progreso(base), 50);
assert.equal(validarRegistro("objetivos", base).completado, false);
assert.equal(
  validarRegistro("objetivos", { ...base, actual: 69 }).completado,
  true,
);
assert.equal(progreso({ ...base, actual: 85 }), 0);
assert.equal(progreso({ ...base, actual: 65 }), 100);
assert.throws(() => validarRegistro("objetivos", { ...base, meta: 80 }));
assert.throws(() => validarRegistro("objetivos", { ...base, actual: "" }));
assert.throws(() => validarRegistro("objetivos", { ...base, nombre: "  " }));
assert.throws(() =>
  validarRegistro("recordatorios", {
    nombre: "Vitamina",
    dosis: "Una",
    hora: "24:00",
    frecuencia: "Diario",
    dia: "Lunes",
  }),
);
const valid = {
  nombre: "Vitamina",
  dosis: "Una",
  hora: "08:30",
  frecuencia: "Semanal",
  dia: "Lunes",
  activo: true,
};
assert.equal(validarRegistro("recordatorios", valid).hora, "08:30");
assert.throws(() =>
  validarRegistro("comidas", {
    nombre: "Menú",
    fecha: "2026-02-30",
    tipo: "Cena",
  }),
);
console.log(
  "Validaciones: fechas, metas ascendentes/descendentes, límites y formularios OK.",
);
const scheduled = new Map();
const Notifications = {
  setNotificationHandler() {},
  AndroidImportance: { HIGH: 4 },
  IosAuthorizationStatus: { PROVISIONAL: 3 },
  SchedulableTriggerInputTypes: { DAILY: "daily", WEEKLY: "weekly" },
  async setNotificationChannelAsync() {},
  async getPermissionsAsync() {
    return { granted: true };
  },
  async getAllScheduledNotificationsAsync() {
    return [...scheduled.values()];
  },
  async cancelScheduledNotificationAsync(id) {
    scheduled.delete(id);
  },
  async scheduleNotificationAsync(n) {
    scheduled.set(n.identifier, n);
  },
};
const native = fs
  .readFileSync(root + "/src/services/avisosDispositivo.js", "utf8")
  .replace(/^import .*;\r?\n/gm, "")
  .replaceAll("export ", "");
const nc = vm.createContext({
  Notifications,
  isRunningInExpoGo: () => false,
  Platform: { OS: "android" },
  DIAS: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ],
});
vm.runInContext(native + "\nthis.api={sincronizar};", nc);
(async () => {
  const sync = nc.api.sincronizar;
  await sync("alice", [{ ...valid, id: "1" }]);
  assert.equal(scheduled.size, 1);
  assert.equal(scheduled.get("salud:alice:1").trigger.weekday, 2);
  assert.equal(scheduled.get("salud:alice:1").trigger.hour, 8);
  await sync("alice", [{ ...valid, id: "1" }]);
  assert.equal(scheduled.size, 1);
  await sync("alice", [{ ...valid, id: "1", hora: "21:15" }]);
  assert.equal(scheduled.get("salud:alice:1").trigger.hour, 21);
  await sync("alice", [{ ...valid, id: "1", activo: false }]);
  assert.equal(scheduled.size, 0);
  await sync("alice", [{ ...valid, id: "1" }]);
  await sync("bob", []);
  assert.equal(scheduled.size, 0);
  await sync("alice", [{ ...valid, id: "1" }]);
  await sync(null, []);
  assert.equal(scheduled.size, 0);
  console.log(
    "Recordatorios: alta, idempotencia, edición, pausa, cambio de usuario y cierre de sesión OK (API nativa simulada).",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
