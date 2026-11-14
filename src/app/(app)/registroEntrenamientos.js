import { useState } from "react";
import Boton from "../../components/Boton";
import Campo from "../../components/Campo";
import Mensaje from "../../components/Mensaje";
import Pantalla from "../../components/Pantalla";
import Titulo from "../../components/Titulo";
import { useAuth } from "../../context/AuthContext";

import {
    guardarEntrenamiento,
    obtenerPendientesSincronizacion,
} from "../../services/actividadDB";

function obtenerFechaActual() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

export default function RegistroEntrenamiento() {
  const { usuario } = useAuth();

  const [fecha, setFecha] = useState(obtenerFechaActual());
  const [tipo, setTipo] = useState("");
  const [duracion, setDuracion] = useState("");
  const [intensidad, setIntensidad] = useState("");
  const [calorias, setCalorias] = useState("");

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("info");

  async function registrarEntrenamiento() {
    setMensaje("");

    if (
      !fecha ||
      !tipo.trim() ||
      !duracion ||
      !intensidad.trim() ||
      !calorias
    ) {
      setTipoMensaje("error");
      setMensaje("Completa todos los campos.");
      return;
    }

    const duracionNumero = Number(duracion);
    const caloriasNumero = Number(calorias);

    if (
      !Number.isInteger(duracionNumero) ||
      duracionNumero <= 0 ||
      !Number.isInteger(caloriasNumero) ||
      caloriasNumero < 0
    ) {
      setTipoMensaje("error");
      setMensaje("Verifica la duración y las calorías ingresadas.");
      return;
    }

    try {
      setCargando(true);

      await guardarEntrenamiento(
        usuario.uid,
        fecha,
        tipo.trim(),
        duracionNumero,
        intensidad.trim(),
        caloriasNumero,
      );

      setTipoMensaje("exito");
      setMensaje("Entrenamiento guardado correctamente.");

      const pendientes = await obtenerPendientesSincronizacion(usuario.uid);

      console.log("REGISTROS PENDIENTES:", pendientes);

      setTipo("");
      setDuracion("");
      setIntensidad("");
      setCalorias("");
    } catch (error) {
      setTipoMensaje("error");
      setMensaje(error.message || "No se pudo guardar el entrenamiento.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Pantalla>
      <Titulo
        titulo="Registrar entrenamiento"
        subtitulo="Registra los detalles de tu sesión de ejercicio."
      />

      {mensaje ? <Mensaje tipo={tipoMensaje}>{mensaje}</Mensaje> : null}

      <Campo
        etiqueta="Fecha"
        value={fecha}
        onChangeText={setFecha}
        placeholder="AAAA-MM-DD"
      />

      <Campo
        etiqueta="Tipo de entrenamiento"
        value={tipo}
        onChangeText={setTipo}
        placeholder="Ej. Musculación, correr, bicicleta"
      />

      <Campo
        etiqueta="Duración (minutos)"
        value={duracion}
        onChangeText={setDuracion}
        placeholder="Ej. 60"
        keyboardType="numeric"
      />

      <Campo
        etiqueta="Intensidad"
        value={intensidad}
        onChangeText={setIntensidad}
        placeholder="Baja, Media o Alta"
      />

      <Campo
        etiqueta="Calorías quemadas"
        value={calorias}
        onChangeText={setCalorias}
        placeholder="Ej. 350"
        keyboardType="numeric"
      />

      <Boton
        titulo="Guardar entrenamiento"
        onPress={registrarEntrenamiento}
        cargando={cargando}
        deshabilitado={cargando}
      />
    </Pantalla>
  );
}
