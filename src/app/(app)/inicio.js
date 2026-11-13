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

  //Cierra la sesión y regresa a la pantalla de acceso.
  const salir = async () => {
    await cerrarSesion();
    router.replace("/");
  };

  return (
    <Pantalla>
      <Titulo
        titulo={`Hola, ${nombre}`}
        subtitulo={`Rol: ${usuario.perfil.rol}`}
      />

      <Mensaje tipo="info">
        Aquí se mostrarán los módulos de actividad, recordatorios y comunidad
        del resto del equipo.
      </Mensaje>

      {esModerador ? (
        <Mensaje tipo="exito">Tienes permisos de moderación.</Mensaje>
      ) : null}

      {/*Acceso al perfil del usuario.*/}
      <Boton titulo="Mi perfil" onPress={() => router.push("/perfil")} />

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

      {/*Cerrar sesión.*/}
      <Boton titulo="Cerrar sesión" variante="secundario" onPress={salir} />
    </Pantalla>
  );
}
