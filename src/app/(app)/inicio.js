import { useState } from "react";
import { useRouter } from "expo-router";

import Boton from "../../components/Boton";
import Mensaje from "../../components/Mensaje";
import Pantalla from "../../components/Pantalla";
import Titulo from "../../components/Titulo";
import { useAuth } from "../../context/AuthContext";

// Pantalla de inicio provisional: los demás módulos se enlazan desde aquí.
export default function Inicio() {
  const { usuario, cerrarSesion, esModerador, esAdmin } = useAuth();
  const router = useRouter();
  const nombre = usuario.perfil.nombre.split(" ")[0];

  const [error, setError] = useState("");
  const [saliendo, setSaliendo] = useState(false);
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
        Organiza tus objetivos, comidas y recordatorios desde aquí.
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
