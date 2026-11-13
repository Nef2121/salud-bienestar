import { useState } from "react";

import Boton from "../../components/Boton";
import Campo from "../../components/Campo";
import Mensaje from "../../components/Mensaje";
import Pantalla from "../../components/Pantalla";
import Titulo from "../../components/Titulo";

import { useAuth } from "../../context/AuthContext";
import { guardarActividadFisica } from "../../services/actividadDB";

//Obtiene la fecha actual en formato YYYY-MM-DD.
function obtenerFechaActual() {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

export default function RegistroActividad() {
  const { usuario } = useAuth();

  //Datos del formulario.
  const [fecha, setFecha] = useState(obtenerFechaActual());
  const [pasos, setPasos] = useState("");
  const [distancia, setDistancia] = useState("");
  const [calorias, setCalorias] = useState("");

  //Controla el estado del formulario.
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("info");

  //Guarda los datos de actividad física en SQLite.
  const registrarActividad = async () => {
    try {
      setMensaje("");

      //Comprueba que todos los campos estén completos.
      if (
        !fecha.trim() ||
        !pasos.trim() ||
        !distancia.trim() ||
        !calorias.trim()
      ) {
        throw new Error("Debes completar todos los campos.");
      }

      //Convierte los valores de texto a números.
      const pasosNumero = Number(pasos.replace(/,/g, ""));
      const distanciaNumero = Number(distancia);
      const caloriasNumero = Number(calorias.replace(/,/g, ""));

      //Valida los datos antes de guardarlos.
      if (!Number.isInteger(pasosNumero) || pasosNumero < 0) {
        throw new Error("Ingresa una cantidad válida de pasos.");
      }

      if (!Number.isFinite(distanciaNumero) || distanciaNumero < 0) {
        throw new Error("Ingresa una distancia válida.");
      }

      if (!Number.isInteger(caloriasNumero) || caloriasNumero < 0) {
        throw new Error("Ingresa una cantidad válida de calorías.");
      }

      if (!usuario?.uid) {
        throw new Error("No se pudo identificar al usuario.");
      }

      setCargando(true);

      //Guarda la actividad asociada al usuario autenticado.
      await guardarActividadFisica(
        usuario.uid,
        fecha,
        pasosNumero,
        distanciaNumero,
        caloriasNumero,
      );

      //Muestra la confirmación.
      setTipoMensaje("exito");
      setMensaje("Actividad física guardada correctamente.");

      //Limpia los campos numéricos.
      setPasos("");
      setDistancia("");
      setCalorias("");
    } catch (error) {
      setTipoMensaje("error");
      setMensaje(error.message || "No se pudo guardar la actividad.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo
        titulo="Registrar actividad"
        subtitulo="Ingresa los datos de tu actividad física diaria."
      />

      {mensaje ? <Mensaje tipo={tipoMensaje}>{mensaje}</Mensaje> : null}

      <Campo
        etiqueta="Fecha"
        value={fecha}
        onChangeText={setFecha}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />

      <Campo
        etiqueta="Pasos realizados"
        value={pasos}
        onChangeText={setPasos}
        placeholder="Ej. 5000"
        keyboardType="numeric"
        ayuda="Ingresa la cantidad total de pasos."
      />

      <Campo
        etiqueta="Distancia recorrida (km)"
        value={distancia}
        onChangeText={setDistancia}
        placeholder="Ej. 3.5"
        keyboardType="decimal-pad"
        ayuda="Utiliza un punto para separar los decimales."
      />

      <Campo
        etiqueta="Calorías quemadas"
        value={calorias}
        onChangeText={setCalorias}
        placeholder="Ej. 250"
        keyboardType="numeric"
        ayuda="Ingresa la cantidad de calorías."
      />

      <Boton
        titulo="Guardar actividad"
        onPress={registrarActividad}
        cargando={cargando}
        deshabilitado={cargando}
      />
    </Pantalla>
  );
}
