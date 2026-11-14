import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import Mensaje from '../../../components/Mensaje';
import Pantalla from '../../../components/Pantalla';
import TarjetaAcceso from '../../../components/TarjetaAcceso';
import Titulo from '../../../components/Titulo';
import { colores, tipografia } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';

// Pantalla principal: saludo y accesos rápidos.
export default function Inicio() {
  const { usuario, esModerador } = useAuth();
  const router = useRouter();
  const nombre = usuario.perfil.nombre.split(' ')[0];

  return (
    <Pantalla>
      <Titulo titulo={`Hola, ${nombre}`} subtitulo="¿Qué quieres hacer hoy?" />

      {esModerador ? <Mensaje tipo="exito">Tienes permisos de moderación.</Mensaje> : null}

      <Text style={styles.seccion}>Accesos rápidos</Text>
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
        icono="progreso"
        titulo="Mi progreso"
        descripcion="Gráficos y estadísticas"
        onPress={() => router.push('/progreso')}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  seccion: { ...tipografia.seccion, color: colores.texto },
});