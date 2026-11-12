import { useRouter } from 'expo-router';

import Boton from '../../components/Boton';
import Mensaje from '../../components/Mensaje';
import Pantalla from '../../components/Pantalla';
import Titulo from '../../components/Titulo';
import { useAuth } from '../../context/AuthContext';

// Pantalla de inicio provisional: los demás módulos se enlazan desde aquí.
export default function Inicio() {
  const { usuario, cerrarSesion, esModerador, esAdmin } = useAuth();
  const router = useRouter();
  const nombre = usuario.perfil.nombre.split(' ')[0];

  const salir = async () => {
    await cerrarSesion();
    router.replace('/');
  };

  return (
    <Pantalla>
      <Titulo titulo={`Hola, ${nombre}`} subtitulo={`Rol: ${usuario.perfil.rol}`} />
      <Mensaje tipo="info">
        Aquí se mostrarán los módulos de actividad, recordatorios y comunidad del resto del equipo.
      </Mensaje>
      {esModerador ? <Mensaje tipo="exito">Tienes permisos de moderación.</Mensaje> : null}
      <Boton titulo="Mi perfil" onPress={() => router.push('/perfil')} />
      {esAdmin ? (
        <Boton titulo="Administrar usuarios" onPress={() => router.push('/admin')} />
      ) : null}
      <Boton titulo="Cerrar sesión" variante="secundario" onPress={salir} />
    </Pantalla>
  );
}
