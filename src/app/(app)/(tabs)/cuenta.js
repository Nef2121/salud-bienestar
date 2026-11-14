import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import Boton from '../../../components/Boton';
import Pantalla from '../../../components/Pantalla';
import TarjetaAcceso from '../../../components/TarjetaAcceso';
import Titulo from '../../../components/Titulo';
import { colores, espacio, radioGrande, tipografia } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';

// Cuenta del usuario: datos básicos, perfil, administración y cierre de sesión.
export default function Cuenta() {
  const { usuario, cerrarSesion, esAdmin } = useAuth();
  const router = useRouter();

  const salir = async () => {
    await cerrarSesion();
    router.replace('/');
  };

  return (
    <Pantalla>
      <Titulo titulo="Cuenta" />

      <View style={styles.datos}>
        <Text style={styles.nombre}>{usuario.perfil.nombre}</Text>
        <Text style={styles.detalle}>{usuario.perfil.correo}</Text>
        <Text style={styles.detalle}>Rol: {usuario.perfil.rol}</Text>
      </View>

      <TarjetaAcceso
        icono="editar"
        titulo="Mi perfil"
        descripcion="Datos personales y objetivos de salud"
        onPress={() => router.push('/perfil')}
      />

      {esAdmin ? (
        <TarjetaAcceso
          icono="admin"
          titulo="Administrar usuarios"
          descripcion="Nombrar moderadores"
          onPress={() => router.push('/admin')}
        />
      ) : null}

      <Boton titulo="Cerrar sesión" variante="secundario" onPress={salir} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  datos: {
    gap: 2,
    padding: espacio.m,
    backgroundColor: colores.superficie,
    borderRadius: radioGrande,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  nombre: { ...tipografia.seccion, color: colores.texto },
  detalle: { fontSize: 14, color: colores.textoSuave },
});