import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./AuthContext";
import { escucharRegistros, mensajeError } from "../services/planificacion";
import {
  sincronizarAlertas,
  pushHabilitado,
  activarPush,
  guardarToken,
} from "../services/notificaciones";
import {
  permiso,
  escucharToken,
  escucharApertura,
} from "../services/avisosDispositivo";
const Contexto = createContext(null);
export const useNotificaciones = () => useContext(Contexto);
export function NotificacionesProvider({ children }) {
  const { usuario } = useAuth();
  const router = useRouter();
  const [estado, setEstado] = useState("Comprobando recordatorios…"),
    [error, setError] = useState("");
  const registros = useRef([]);
  const uid = usuario?.uid;
  useEffect(() => {
    let activo = true;
    registros.current = [];
    const informar = (e) => {
      if (activo) setError(mensajeError(e));
    };
    const actualizar = () =>
      sincronizarAlertas(uid, registros.current)
        .then((m) => {
          if (activo) {
            setEstado(m);
            setError("");
          }
        })
        .catch(informar);
    actualizar();
    const cancelar = uid
      ? escucharRegistros(
          uid,
          "recordatorios",
          (datos) => {
            registros.current = datos;
            actualizar();
          },
          informar,
        )
      : () => {};
    const renovar = async () => {
      if (uid && (await pushHabilitado(uid))) await activarPush(uid);
    };
    renovar().catch(informar);
    const appState = AppState.addEventListener("change", (s) => {
      if (s === "active") {
        actualizar();
        renovar().catch(informar);
      }
    });
    const token = escucharToken((t) => {
      if (uid)
        pushHabilitado(uid)
          .then((ok) => ok && guardarToken(uid, t))
          .catch(informar);
    });
    const abrir = uid
      ? escucharApertura(() => router.push("/notificaciones"))
      : null;
    return () => {
      activo = false;
      cancelar();
      appState.remove();
      token.remove();
      abrir?.remove();
      sincronizarAlertas(null, []).catch(() => {});
    };
  }, [uid]);
  const activarLocales = async () => {
    if (!(await permiso(true)))
      throw new Error(
        "No hay permiso para mostrar alertas. Actívalo en los ajustes del teléfono.",
      );
    setEstado(await sincronizarAlertas(uid, registros.current));
    setError("");
  };
  return (
    <Contexto.Provider value={{ estado, error, activarLocales }}>
      {children}
    </Contexto.Provider>
  );
}
