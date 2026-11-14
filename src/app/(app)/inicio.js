import { useState } from "react";
import { useRouter } from "expo-router";

import Boton from "../../components/Boton";
import Mensaje from "../../components/Mensaje";
import Pantalla from "../../components/Pantalla";
import Titulo from "../../components/Titulo";
import { useAuth } from "../../context/AuthContext";

//Pantalla principal de la aplicación.
export default function Inicio() {
  const { usuario, cerrarSesion, esModerador, esAdmin } = useAuth();
  const router = useRouter();
  const nombre = usuario.perfil.nombre.split(" ")[0];

  const [error, setError] = useState("");
  const [saliendo, setSaliendo] = useState(false);

  //Cierra la sesión y regresa a la pantalla de acceso.
  const salir = async () => {
    setSaliendo(true);
    setError("");
    try {
      await cerrarSesion();
      router.replace("/");
    } catch (e) {
      setError(e.message || "No se pudo cerrar sesión. Revisa tu conexión.");
    } finally {
      setSaliendo(false);
    }
  };

  return (
    <Pantalla>
      <Titulo
        titulo={`Hola, ${nombre}`}
        subtitulo={`Rol: ${usuario.perfil.rol}`}
      />
      <Mensaje tipo="error">{error}</Mensaje>
      <Mensaje tipo="info">
        Registra tu actividad y organiza tus objetivos, comidas y recordatorios desde aquí.
      </Mensaje>
      {esModerador ? (
        <Mensaje tipo="exito">Tienes permisos de moderación.</Mensaje>
      ) : null}
      <Boton titulo="Mi perfil" onPress={() => router.push("/perfil")} />
      <Boton titulo="Mis objetivos" onPress={() => router.push("/objetivos")} />
      <Boton
        titulo="Medicamentos y vitaminas"
        onPress={() => router.push("/recordatorios")}
      />
      <Boton
        titulo="Planificar comidas"
        onPress={() => router.push("/comidas")}
      />
      <Boton
        titulo="Notificaciones"
        onPress={() => router.push("/notificaciones")}
      />

      {/*Acceso al seguimiento de actividad física.*/}
      <Boton titulo="Mi progreso" onPress={() => router.push("/progreso")} />

      <Boton
        titulo="Registrar actividad"
        onPress={() => router.push("/registroActividad")}
      />

      <Boton
        titulo="Registrar entrenamiento"
        onPress={() => router.push("/registroEntrenamientos")}
      />

      <Boton
        titulo="Consultar entrenamientos"
        onPress={() => router.push("/consultarEntrenamientos")}
      />

      {/*Acceso exclusivo para administradores.*/}
      {esAdmin ? (
        <Boton
          titulo="Administrar usuarios"
          onPress={() => router.push("/admin")}
        />
      ) : null}
      <Boton
        titulo="Cerrar sesión"
        variante="secundario"
        cargando={saliendo}
        onPress={salir}
      />
    </Pantalla>
  );
}
