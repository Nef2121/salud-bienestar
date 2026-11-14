import { useRouter } from 'expo-router';

import Pantalla from '../../../components/Pantalla';
import TarjetaAcceso from '../../../components/TarjetaAcceso';
import Titulo from '../../../components/Titulo';

// Centro de actividad física: reúne las pantallas de seguimiento.
export default function Actividad() {
  const router = useRouter();

  return (
    <Pantalla>
      <Titulo titulo="Actividad" subtitulo="Registra y revisa tu actividad física" />

      <TarjetaAcceso
        icono="actividad"
        titulo="Registrar actividad"
        descripcion="Pasos, distancia y calorías"
        onPress={() => router.push('/registroActividad')}
      />
      <TarjetaAcceso
        icono="entrenar"
        titulo="Registrar entrenamiento"
        descripcion="Tipo, duración e intensidad"
        onPress={() => router.push('/registroEntrenamientos')}
      />
      <TarjetaAcceso
        icono="lista"
        titulo="Consultar entrenamientos"
        descripcion="Filtra por fecha, tipo e intensidad"
        onPress={() => router.push('/consultarEntrenamientos')}
      />
      <TarjetaAcceso
        icono="progreso"
        titulo="Mi progreso"
        descripcion="Gráficos y estadísticas"
        onPress={() => router.push('/progreso')}
      />
    </Pantalla>
  );
}