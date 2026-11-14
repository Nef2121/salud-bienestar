import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { BarChart } from "react-native-gifted-charts";

import Pantalla from "../../components/Pantalla";
import Titulo from "../../components/Titulo";
import { colores, espacio, radio } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

import {
    obtenerActividadPorDia,
    obtenerEntrenamientosPorDia,
    obtenerResumenActividad,
    obtenerResumenEntrenamientos,
} from "../../services/actividadDB";

const anchoPantalla = Dimensions.get("window").width;

//Convierte una fecha al formato YYYY-MM-DD.
function formatearFecha(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

//Calcula el período semanal o mensual.
function obtenerPeriodo(periodo) {
  const hoy = new Date();

  let inicio;
  let fin;

  if (periodo === "Semanal") {
    inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    const diaSemana = inicio.getDay();
    const diferencia = diaSemana === 0 ? 6 : diaSemana - 1;

    inicio.setDate(inicio.getDate() - diferencia);

    fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
  } else {
    inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  }

  return {
    fechaInicio: formatearFecha(inicio),
    fechaFin: formatearFecha(fin),
    inicio,
    fin,
  };
}

//Genera todas las fechas del período, incluso los días sin actividad.
function generarFechas(inicio, fin, periodo) {
  const fechas = [];
  const actual = new Date(inicio);

  while (actual <= fin) {
    const etiqueta =
      periodo === "Semanal"
        ? actual.toLocaleDateString("es-SV", {
            weekday: "short",
          })
        : String(actual.getDate());

    fechas.push({
      fecha: formatearFecha(actual),
      etiqueta,
    });

    actual.setDate(actual.getDate() + 1);
  }

  return fechas;
}

//Tarjeta reutilizable para presentar los indicadores.
function TarjetaResumen({ titulo, valor, unidad }) {
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.valor}>{valor}</Text>
      <Text style={estilos.etiqueta}>{titulo}</Text>
      {unidad ? <Text style={estilos.unidad}>{unidad}</Text> : null}
    </View>
  );
}

//Sección reutilizable para mostrar cada gráfico.
function SeccionGrafico({ titulo, datos, color, anchoGrafico }) {
  return (
    <View style={estilos.seccionGrafico}>
      <Text style={estilos.tituloGrafico}>{titulo}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={datos}
          width={anchoGrafico}
          height={180}
          barWidth={20}
          spacing={14}
          roundedTop
          hideRules
          yAxisThickness={0}
          xAxisThickness={1}
          noOfSections={4}
          frontColor={color}
          yAxisColor={colores.borde}
          xAxisColor={colores.borde}
          yAxisTextStyle={estilos.textoEje}
          xAxisLabelTextStyle={estilos.textoEje}
        />
      </ScrollView>
    </View>
  );
}

export default function Progreso() {
  const { usuario } = useAuth();

  const [periodo, setPeriodo] = useState("Semanal");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [resumenActividad, setResumenActividad] = useState({});
  const [resumenEntrenamientos, setResumenEntrenamientos] = useState({});

  const [datosPasos, setDatosPasos] = useState([]);
  const [datosCalorias, setDatosCalorias] = useState([]);
  const [datosMinutos, setDatosMinutos] = useState([]);

  //Carga los datos cuando cambia el período o el usuario.
  useEffect(() => {
    let activo = true;

    async function cargarProgreso() {
      if (!usuario?.uid) {
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError(null);

        const rango = obtenerPeriodo(periodo);

        const [
          actividad,
          entrenamientos,
          actividadDiaria,
          entrenamientosDiarios,
        ] = await Promise.all([
          obtenerResumenActividad(
            usuario.uid,
            rango.fechaInicio,
            rango.fechaFin,
          ),
          obtenerResumenEntrenamientos(
            usuario.uid,
            rango.fechaInicio,
            rango.fechaFin,
          ),
          obtenerActividadPorDia(
            usuario.uid,
            rango.fechaInicio,
            rango.fechaFin,
          ),
          obtenerEntrenamientosPorDia(
            usuario.uid,
            rango.fechaInicio,
            rango.fechaFin,
          ),
        ]);

        console.log("PERÍODO:", periodo);
        console.log("FECHA INICIO:", rango.fechaInicio);
        console.log("FECHA FIN:", rango.fechaFin);

        console.log("RESUMEN ACTIVIDAD:", actividad);
        console.log("ACTIVIDAD DIARIA:", actividadDiaria);

        console.log("RESUMEN ENTRENAMIENTOS:", entrenamientos);
        console.log("ENTRENAMIENTOS DIARIOS:", entrenamientosDiarios);

        if (!activo) return;

        setResumenActividad(actividad || {});
        setResumenEntrenamientos(entrenamientos || {});

        const fechas = generarFechas(rango.inicio, rango.fin, periodo);

        const actividadMap = new Map(
          actividadDiaria.map((item) => [item.fecha, item]),
        );

        const entrenamientosMap = new Map(
          entrenamientosDiarios.map((item) => [item.fecha, item]),
        );

        setDatosPasos(
          fechas.map((dia) => ({
            value: Number(actividadMap.get(dia.fecha)?.pasos || 0),
            label: dia.etiqueta,
          })),
        );

        setDatosCalorias(
          fechas.map((dia) => ({
            value: Number(actividadMap.get(dia.fecha)?.calorias || 0),
            label: dia.etiqueta,
          })),
        );

        setDatosMinutos(
          fechas.map((dia) => ({
            value: Number(entrenamientosMap.get(dia.fecha)?.totalMinutos || 0),
            label: dia.etiqueta,
          })),
        );
      } catch (err) {
        if (activo) {
          setError(err.message || "No se pudo cargar el progreso.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarProgreso();

    return () => {
      activo = false;
    };
  }, [usuario?.uid, periodo]);

  const anchoGrafico = Math.max(
    anchoPantalla - 100,
    datosPasos.length * 38 + 60,
  );

  return (
    <Pantalla>
      <Titulo
        titulo="Mi progreso"
        subtitulo="Consulta tu actividad física y tus entrenamientos."
      />

      {/*Selector del período.*/}
      <View style={estilos.selector}>
        {["Semanal", "Mensual"].map((opcion) => (
          <Pressable
            key={opcion}
            style={[
              estilos.botonPeriodo,
              periodo === opcion && estilos.botonSeleccionado,
            ]}
            onPress={() => setPeriodo(opcion)}
          >
            <Text
              style={[
                estilos.textoPeriodo,
                periodo === opcion && estilos.textoSeleccionado,
              ]}
            >
              {opcion}
            </Text>
          </Pressable>
        ))}
      </View>

      {cargando ? (
        <View style={estilos.cargando}>
          <ActivityIndicator size="large" color={colores.primario} />
          <Text style={estilos.textoSuave}>Cargando tu progreso...</Text>
        </View>
      ) : error ? (
        <View style={estilos.tarjeta}>
          <Text style={estilos.error}>{error}</Text>
        </View>
      ) : (
        <>
          <Text style={estilos.tituloSeccion}>
            Resumen {periodo.toLowerCase()}
          </Text>

          {/*Indicadores generales.*/}
          <View style={estilos.resumen}>
            <TarjetaResumen
              titulo="Pasos"
              valor={Number(resumenActividad.totalPasos || 0).toLocaleString(
                "es-SV",
              )}
            />

            <TarjetaResumen
              titulo="Distancia"
              valor={Number(resumenActividad.totalDistancia || 0).toFixed(2)}
              unidad="km"
            />

            <TarjetaResumen
              titulo="Calorías de actividad"
              valor={Number(resumenActividad.totalCalorias || 0).toLocaleString(
                "es-SV",
              )}
            />

            <TarjetaResumen
              titulo="Minutos de entrenamiento"
              valor={Number(resumenEntrenamientos.totalMinutos || 0)}
              unidad="min"
            />
          </View>

          {/*Gráfico de pasos.*/}
          <SeccionGrafico
            titulo="Pasos por día"
            datos={datosPasos}
            color={colores.primario}
            anchoGrafico={anchoGrafico}
          />

          {/*Gráfico de calorías.*/}
          <SeccionGrafico
            titulo="Calorías por día"
            datos={datosCalorias}
            color="#D99A38"
            anchoGrafico={anchoGrafico}
          />

          {/*Gráfico de duración.*/}
          <SeccionGrafico
            titulo="Minutos de entrenamiento por día"
            datos={datosMinutos}
            color="#5485B5"
            anchoGrafico={anchoGrafico}
          />

          {/*Resumen de entrenamientos.*/}
          <View style={estilos.tarjetaEntrenamientos}>
            <Text style={estilos.tituloGrafico}>Resumen de entrenamientos</Text>

            <Text style={estilos.valor}>
              {Number(resumenEntrenamientos.cantidadEntrenamientos || 0)}
            </Text>

            <Text style={estilos.etiqueta}>Entrenamientos realizados</Text>

            <Text style={estilos.textoSuave}>
              Calorías de entrenamientos:{" "}
              {Number(resumenEntrenamientos.totalCalorias || 0)}
            </Text>
          </View>
        </>
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  selector: {
    flexDirection: "row",
    backgroundColor: colores.suave,
    borderRadius: radio,
    padding: espacio.xs,
    marginTop: espacio.s,
  },

  botonPeriodo: {
    flex: 1,
    padding: espacio.m,
    alignItems: "center",
    borderRadius: radio - 2,
  },

  botonSeleccionado: {
    backgroundColor: colores.primario,
  },

  textoPeriodo: {
    color: colores.texto,
    fontWeight: "600",
  },

  textoSeleccionado: {
    color: colores.superficie,
  },

  tituloSeccion: {
    fontSize: 19,
    fontWeight: "700",
    color: colores.texto,
    marginTop: espacio.s,
  },

  resumen: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  tarjeta: {
    backgroundColor: colores.superficie,
    width: "48%",
    padding: espacio.m,
    borderRadius: radio,
    marginBottom: espacio.s,
    borderWidth: 1,
    borderColor: colores.borde,
  },

  valor: {
    fontSize: 23,
    fontWeight: "700",
    color: colores.primario,
  },

  etiqueta: {
    fontSize: 13,
    color: colores.textoSuave,
    marginTop: espacio.xs,
  },

  unidad: {
    fontSize: 12,
    color: colores.textoSuave,
  },

  seccionGrafico: {
    backgroundColor: colores.superficie,
    padding: espacio.m,
    borderRadius: radio,
    borderWidth: 1,
    borderColor: colores.borde,
  },

  tituloGrafico: {
    fontSize: 17,
    fontWeight: "700",
    color: colores.texto,
    marginBottom: espacio.l,
  },

  textoEje: {
    color: colores.textoSuave,
    fontSize: 10,
  },

  tarjetaEntrenamientos: {
    backgroundColor: colores.superficie,
    padding: espacio.m,
    borderRadius: radio,
    borderWidth: 1,
    borderColor: colores.borde,
  },

  cargando: {
    alignItems: "center",
    justifyContent: "center",
    padding: espacio.xl,
  },

  textoSuave: {
    color: colores.textoSuave,
    marginTop: espacio.s,
  },

  error: {
    color: colores.error,
  },
});
