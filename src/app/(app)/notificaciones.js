import { useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import Pantalla from "../../components/Pantalla";
import Titulo from "../../components/Titulo";
import Boton from "../../components/Boton";
import Mensaje from "../../components/Mensaje";
import Campo from "../../components/Campo";
import Selector from "../../components/Selector";
import { useAuth } from "../../context/AuthContext";
import { useNotificaciones } from "../../context/NotificacionesContext";
import {
  activarPush,
  desactivarPush,
  enviarAviso,
} from "../../services/notificaciones";
import { pruebaLocal } from "../../services/avisosDispositivo";
import { mensajeError } from "../../services/planificacion";
export default function Notificaciones() {
  const { usuario, esModerador } = useAuth();
  const router = useRouter();
  const [tokenPrueba, setTokenPrueba] = useState("");
  const envioServidor = process.env.EXPO_PUBLIC_HABILITAR_ENVIO_PUSH === "true";
  const avisos = useNotificaciones();
  const [mensaje, setMensaje] = useState(""),
    [error, setError] = useState(""),
    [ocupado, setOcupado] = useState(false);
  const [destinatario, setDestinatario] = useState(""),
    [categoria, setCategoria] = useState("consejo");
  const ejecutar = async (fn, texto) => {
    if (ocupado) return;
    setOcupado(true);
    setError("");
    setMensaje("");
    try {
      const resultado = await fn();
      setMensaje(typeof resultado === "string" ? resultado : texto);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  };
  return (
    <Pantalla>
      <Titulo
        titulo="Notificaciones"
        subtitulo="Configura las alertas de este dispositivo."
      />
      <Mensaje tipo="error">{error || avisos.error}</Mensaje>
      <Mensaje tipo="exito">{mensaje}</Mensaje>
      <Mensaje>{avisos.estado}</Mensaje>
      <Boton
        titulo="Activar recordatorios locales"
        deshabilitado={ocupado}
        onPress={() =>
          ejecutar(avisos.activarLocales, "Alertas locales habilitadas.")
        }
      />
      <Boton
        titulo="Probar alerta en 5 segundos"
        deshabilitado={ocupado}
        onPress={() => ejecutar(pruebaLocal, "Prueba programada.")}
      />
      <Mensaje>
        Las notificaciones push requieren una compilación Android configurada
        con Firebase. Los recordatorios locales funcionan sin recibir un envío
        del servidor.
      </Mensaje>
      <Boton
        titulo="Activar notificaciones push"
        deshabilitado={ocupado}
        onPress={() =>
          ejecutar(
            async () => { const token = await activarPush(usuario.uid); setTokenPrueba(token); },
            "Dispositivo registrado para recibir notificaciones.",
          )
        }
      />
      <Boton
        titulo="Desactivar notificaciones push"
        variante="secundario"
        deshabilitado={ocupado}
        onPress={() =>
          ejecutar(
            async () => { await desactivarPush(usuario.uid); setTokenPrueba(""); },
            "Notificaciones push desactivadas para esta cuenta en este dispositivo.",
          )
        }
      />
      <Boton
        titulo="Ver mis recordatorios"
        onPress={() => router.push("/recordatorios")}
      />
      {__DEV__ && tokenPrueba ? (<>
        <Titulo titulo="Token FCM para pruebas" subtitulo="Copia este token en Enviar mensaje de prueba de Firebase Console." />
        <Text selectable accessibilityLabel="Token FCM de este dispositivo">{tokenPrueba}</Text>
      </>) : null}
      {esModerador && envioServidor && (
        <>
          <Titulo
            titulo="Enviar aviso"
            subtitulo="Disponible para administradores y moderadores."
          />
          <Campo
            etiqueta="UID del destinatario"
            value={destinatario}
            onChangeText={setDestinatario}
            autoCapitalize="none"
          />
          <Selector
            etiqueta="Categoría"
            opciones={["recordatorio", "consejo", "actividad"]}
            valor={categoria}
            onChange={setCategoria}
          />
          <Boton
            titulo="Enviar notificación"
            deshabilitado={ocupado || !destinatario.trim()}
            onPress={() =>
              ejecutar(async () => {
                const r = await enviarAviso(destinatario, categoria);
                return (
                  "Envíos aceptados: " +
                  r.enviados +
                  ". Fallidos: " +
                  r.fallidos +
                  "."
                );
              }, "Aviso enviado.")
            }
          />
        </>
      )}
      <Boton
        titulo="Volver al inicio"
        variante="secundario"
        onPress={() => router.replace("/inicio")}
      />
    </Pantalla>
  );
}
