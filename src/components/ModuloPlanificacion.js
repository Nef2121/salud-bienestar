import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Pantalla from "./Pantalla";
import Titulo from "./Titulo";
import Campo from "./Campo";
import Selector from "./Selector";
import Boton from "./Boton";
import Mensaje from "./Mensaje";
import { useAuth } from "../context/AuthContext";
import { colores, espacio, radio } from "../constants/theme";
import {
  escucharRegistros,
  guardarRegistro,
  eliminarRegistro,
  mensajeError,
} from "../services/planificacion";
import { DIAS, progreso } from "../utils/planificacion";
import { useNotificaciones } from "../context/NotificacionesContext";

const nombres = {
  objetivos: "Mis objetivos de salud",
  recordatorios: "Medicamentos y vitaminas",
  comidas: "Planificador de comidas",
};
const vacio = (tipo) =>
  tipo === "objetivos"
    ? { nombre: "", inicial: "0", actual: "0", meta: "", unidad: "", fecha: "" }
    : tipo === "recordatorios"
      ? {
          nombre: "",
          dosis: "",
          hora: "08:00",
          frecuencia: "Diario",
          dia: "Lunes",
          activo: true,
        }
      : {
          nombre: "",
          fecha: "",
          tipo: "Desayuno",
          notas: "",
          completado: false,
        };
export default function ModuloPlanificacion({ tipo }) {
  const { usuario } = useAuth();
  const router = useRouter();
  const notificaciones = useNotificaciones();
  const [datos, setDatos] = useState([]),
    [form, setForm] = useState(vacio(tipo));
  const [editando, setEditando] = useState(null),
    [borrar, setBorrar] = useState(null);
  const [error, setError] = useState(""),
    [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true),
    [ocupado, setOcupado] = useState(false);
  const [busqueda, setBusqueda] = useState(""),
    [filtro, setFiltro] = useState("Todos");
  const bloqueo = useRef(false);
  useEffect(() => {
    setCargando(true);
    setDatos([]);
    setError("");
    return escucharRegistros(
      usuario.uid,
      tipo,
      (d) => {
        setDatos(d);
        setCargando(false);
      },
      (e) => {
        setError(mensajeError(e));
        setCargando(false);
      },
    );
  }, [usuario.uid, tipo]);
  const cambiar = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setMensaje("");
  };
  const limpiar = () => {
    setForm(vacio(tipo));
    setEditando(null);
  };
  const ejecutar = async (accion, texto) => {
    if (bloqueo.current) return;
    bloqueo.current = true;
    setOcupado(true);
    setError("");
    setMensaje("");
    try {
      await accion();
      setMensaje(texto);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  };
  const campo = (clave, etiqueta, extra = {}) => (
    <Campo
      key={clave}
      etiqueta={etiqueta}
      value={String(form[clave] ?? "")}
      onChangeText={(v) => cambiar(clave, v)}
      editable={!ocupado}
      {...extra}
    />
  );
  const guardar = () =>
    ejecutar(
      async () => {
        await guardarRegistro(usuario.uid, tipo, form, editando);
        limpiar();
      },
      editando ? "Cambios guardados." : "Registro guardado.",
    );
  const visibles = datos.filter(
    (d) =>
      d.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()) &&
      (filtro === "Todos" ||
        (filtro === "Completados"
          ? d.completado
          : filtro === "Pendientes"
            ? !d.completado
            : filtro === "Activos"
              ? d.activo
              : !d.activo)),
  );
  return (
    <Pantalla>
      <Titulo
        titulo={nombres[tipo]}
        subtitulo="Tus datos se guardan en tu cuenta."
      />
      <Mensaje tipo="error">{error}</Mensaje>
      <Mensaje tipo="exito">{mensaje}</Mensaje>
      {tipo === "recordatorios" && (
        <>
          <Mensaje tipo="info">
            Escribe la dosis indicada por tu profesional de salud. Las alertas
            se activan por dispositivo y pueden retrasarse por las restricciones
            de batería del teléfono.
          </Mensaje>
          <Mensaje tipo="info">{notificaciones.estado}</Mensaje>
          <Mensaje tipo="error">{notificaciones.error}</Mensaje>
          <Boton
            titulo="Activar alertas en este dispositivo"
            deshabilitado={ocupado}
            onPress={() =>
              ejecutar(
                notificaciones.activarLocales,
                "Permiso de notificaciones habilitado.",
              )
            }
          />
        </>
      )}
      <Titulo titulo={editando ? "Editar registro" : "Nuevo registro"} />
      {campo(
        "nombre",
        tipo === "comidas"
          ? "Comida o menú"
          : tipo === "recordatorios"
            ? "Medicamento o vitamina"
            : "Nombre del objetivo",
        { maxLength: 100 },
      )}
      {tipo === "objetivos" && (
        <>
          {campo("inicial", "Valor inicial", { keyboardType: "decimal-pad" })}
          {campo("actual", "Valor actual", { keyboardType: "decimal-pad" })}
          {campo("meta", "Meta", { keyboardType: "decimal-pad" })}
          {campo("unidad", "Unidad (kg, minutos, pasos...)", { maxLength: 30 })}
          {campo("fecha", "Fecha objetivo (AAAA-MM-DD)", {
            maxLength: 10,
            placeholder: "2026-12-31",
          })}
        </>
      )}
      {tipo === "recordatorios" && (
        <>
          {campo("dosis", "Dosis indicada", { maxLength: 100 })}
          {campo("hora", "Hora (24 horas, HH:MM)", {
            maxLength: 5,
            placeholder: "08:00",
          })}
          <Selector
            etiqueta="Frecuencia"
            opciones={["Diario", "Semanal"]}
            valor={form.frecuencia}
            onChange={(v) => cambiar("frecuencia", v)}
          />
          {form.frecuencia === "Semanal" && (
            <Selector
              etiqueta="Día"
              opciones={DIAS}
              valor={form.dia}
              onChange={(v) => cambiar("dia", v)}
            />
          )}
        </>
      )}
      {tipo === "comidas" && (
        <>
          {campo("fecha", "Fecha (AAAA-MM-DD)", {
            maxLength: 10,
            placeholder: "2026-12-01",
          })}
          <Selector
            etiqueta="Tipo de comida"
            opciones={["Desayuno", "Almuerzo", "Cena", "Merienda"]}
            valor={form.tipo}
            onChange={(v) => cambiar("tipo", v)}
          />
          {campo("notas", "Ingredientes o notas (opcional)", {
            maxLength: 500,
            multiline: true,
          })}
        </>
      )}
      <Boton
        titulo={editando ? "Guardar cambios" : "Guardar"}
        cargando={ocupado}
        onPress={guardar}
      />
      {editando && (
        <Boton
          titulo="Cancelar edición"
          variante="secundario"
          deshabilitado={ocupado}
          onPress={limpiar}
        />
      )}
      <Titulo titulo="Mis registros" />
      <Campo
        etiqueta="Buscar por nombre"
        value={busqueda}
        onChangeText={setBusqueda}
      />
      <Selector
        etiqueta="Estado"
        opciones={
          tipo === "recordatorios"
            ? ["Todos", "Activos", "Pausados"]
            : ["Todos", "Pendientes", "Completados"]
        }
        valor={filtro}
        onChange={setFiltro}
      />
      {cargando ? (
        <Mensaje>Cargando registros…</Mensaje>
      ) : visibles.length === 0 ? (
        <Mensaje>No hay registros para mostrar.</Mensaje>
      ) : null}
      {visibles
        .sort((a, b) =>
          tipo === "comidas" ? a.fecha.localeCompare(b.fecha) : 0,
        )
        .map((d) => (
          <View key={d.id} style={styles.tarjeta}>
            <Text style={styles.nombre}>{d.nombre}</Text>
            {tipo === "objetivos" && (
              <>
                <Text style={styles.texto}>
                  Inicio: {d.inicial} · Actual: {d.actual} · Meta: {d.meta}{" "}
                  {d.unidad}
                </Text>
                <Text style={styles.texto}>
                  Fecha: {d.fecha} · Progreso: {progreso(d)}% ·{" "}
                  {d.completado ? "Completado" : "Pendiente"}
                </Text>
              </>
            )}
            {tipo === "recordatorios" && (
              <Text style={styles.texto}>
                {d.dosis} · {d.hora} · {d.frecuencia}
                {d.frecuencia === "Semanal" ? " / " + d.dia : ""} ·{" "}
                {d.activo ? "Activo" : "Pausado"}
              </Text>
            )}
            {tipo === "comidas" && (
              <Text style={styles.texto}>
                {d.fecha} · {d.tipo} ·{" "}
                {d.completado ? "Consumida" : "Planificada"}
                {"\n"}
                {d.notas}
              </Text>
            )}
            <Boton
              titulo="Editar"
              variante="secundario"
              deshabilitado={ocupado}
              onPress={() => {
                setForm(d);
                setEditando(d.id);
                setError("");
                setMensaje("El formulario de edición está arriba de la lista.");
              }}
            />
            <Boton
              titulo={
                tipo === "recordatorios"
                  ? d.activo
                    ? "Pausar"
                    : "Activar"
                  : tipo === "objetivos"
                    ? "Marcar meta alcanzada"
                    : d.completado
                      ? "Marcar pendiente"
                      : "Marcar consumida"
              }
              deshabilitado={ocupado || (tipo === "objetivos" && d.completado)}
              onPress={() =>
                ejecutar(
                  () =>
                    guardarRegistro(
                      usuario.uid,
                      tipo,
                      tipo === "objetivos"
                        ? { ...d, actual: d.meta }
                        : tipo === "recordatorios"
                          ? { ...d, activo: !d.activo }
                          : { ...d, completado: !d.completado },
                      d.id,
                    ),
                  "Estado actualizado.",
                )
              }
            />
            <Boton
              titulo="Eliminar"
              variante="texto"
              deshabilitado={ocupado}
              onPress={() => setBorrar(d.id)}
            />
            {borrar === d.id && (
              <>
                <Mensaje tipo="info">
                  ¿Eliminar este registro? Esta acción no se puede deshacer.
                </Mensaje>
                <Boton
                  titulo="Confirmar eliminación"
                  deshabilitado={ocupado}
                  onPress={() =>
                    ejecutar(async () => {
                      await eliminarRegistro(usuario.uid, tipo, d.id);
                      setBorrar(null);
                      if (editando === d.id) limpiar();
                    }, "Registro eliminado.")
                  }
                />
                <Boton
                  titulo="Conservar"
                  variante="secundario"
                  deshabilitado={ocupado}
                  onPress={() => setBorrar(null)}
                />
              </>
            )}
          </View>
        ))}
      <Boton
        titulo="Volver al inicio"
        variante="secundario"
        onPress={() => router.replace("/inicio")}
      />
    </Pantalla>
  );
}
const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio,
    padding: espacio.m,
    gap: espacio.s,
  },
  nombre: { fontSize: 18, fontWeight: "700", color: colores.texto },
  texto: { color: colores.texto, fontSize: 15 },
});
