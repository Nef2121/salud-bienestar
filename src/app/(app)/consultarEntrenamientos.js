import { useState } from "react";
import { Text, View } from "react-native";
import Boton from "../../components/Boton";
import Campo from "../../components/Campo";
import Mensaje from "../../components/Mensaje";
import Pantalla from "../../components/Pantalla";
import Titulo from "../../components/Titulo";
import { useAuth } from "../../context/AuthContext";

import { filtrarEntrenamientos } from "../../services/actividadDB";

export default function ConsultarEntrenamientos() {
  const { usuario } = useAuth();

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipo, setTipo] = useState("");
  const [intensidad, setIntensidad] = useState("");
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  function limpiarFiltros() {
    setFechaInicio("");
    setFechaFin("");
    setTipo("");
    setIntensidad("");

    setEntrenamientos([]);
    setMensaje("");
  }

  async function buscarEntrenamientos() {
    try {
      setCargando(true);
      setMensaje("");

      if (!usuario?.uid) {
        throw new Error("No se pudo identificar al usuario.");
      }

      const resultados = await filtrarEntrenamientos(
        usuario.uid,
        fechaInicio.trim() || null,
        fechaFin.trim() || null,
        tipo.trim() || null,
        intensidad.trim() || null,
      );

      setEntrenamientos(resultados);

      if (resultados.length === 0) {
        setMensaje("No se encontraron entrenamientos.");
      }
    } catch (error) {
      setMensaje(error.message || "Error al consultar los entrenamientos.");
      setEntrenamientos([]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Pantalla>
      <Titulo
        titulo="Consultar entrenamientos"
        subtitulo="Filtra tus entrenamientos por fecha, tipo e intensidad."
      />

      <Campo
        etiqueta="Fecha inicial"
        value={fechaInicio}
        onChangeText={setFechaInicio}
        placeholder="YYYY-MM-DD"
      />

      <Campo
        etiqueta="Fecha final"
        value={fechaFin}
        onChangeText={setFechaFin}
        placeholder="YYYY-MM-DD"
      />

      <Campo
        etiqueta="Tipo de entrenamiento"
        value={tipo}
        onChangeText={setTipo}
        placeholder="Ej. Musculación"
      />

      <Campo
        etiqueta="Intensidad"
        value={intensidad}
        onChangeText={setIntensidad}
        placeholder="Baja, Media o Alta"
      />

      <Boton
        titulo="Limpiar filtros"
        onPress={limpiarFiltros}
        variante="secundario"
      />

      <Boton
        titulo="Buscar entrenamientos"
        onPress={buscarEntrenamientos}
        cargando={cargando}
        deshabilitado={cargando}
      />

      {mensaje ? <Mensaje tipo="info">{mensaje}</Mensaje> : null}

      {entrenamientos.map((item) => (
        <View
          key={item.id}
          style={{
            backgroundColor: "#FFFFFF",
            padding: 16,
            marginTop: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#C9D6D2",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.tipo}</Text>

          <Text>Fecha: {item.fecha}</Text>
          <Text>Duración: {item.duracion_min} minutos</Text>
          <Text>Intensidad: {item.intensidad}</Text>
          <Text>Calorías: {item.calorias}</Text>
        </View>
      ))}
    </Pantalla>
  );
}
