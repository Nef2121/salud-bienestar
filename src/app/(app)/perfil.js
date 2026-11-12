import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Boton from '../../components/Boton';
import CamposPerfil from '../../components/CamposPerfil';
import Mensaje from '../../components/Mensaje';
import Pantalla from '../../components/Pantalla';
import Titulo from '../../components/Titulo';
import { colores, espacio } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { normalizarPerfil, perfilAFormulario, validarPerfil } from '../../utils/validators';

export default function Perfil() {
  const { usuario, guardarPerfil } = useAuth();
  const router = useRouter();
  const [valores, setValores] = useState(perfilAFormulario(usuario.perfil));
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState({ tipo: 'info', texto: '' });
  const [cargando, setCargando] = useState(false);

  const setValor = (campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    setMensaje({ tipo: 'info', texto: '' });
  };

  const guardar = async () => {
    const nuevos = validarPerfil(valores);
    setErrores(nuevos);
    if (Object.keys(nuevos).length) {
      setMensaje({ tipo: 'error', texto: 'Revisa los campos marcados en rojo.' });
      return;
    }
    setCargando(true);
    try {
      await guardarPerfil(normalizarPerfil(valores));
      setMensaje({ tipo: 'exito', texto: 'Perfil actualizado correctamente.' });
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message || 'No se pudo guardar el perfil.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo titulo="Mi perfil" subtitulo="Consulta y edita tus datos" />
      <View style={styles.cuenta}>
        <Text style={styles.cuentaTexto}>Correo: {usuario.correo}</Text>
        <Text style={styles.cuentaTexto}>Rol: {usuario.perfil.rol}</Text>
      </View>
      <Mensaje tipo={mensaje.tipo}>{mensaje.texto}</Mensaje>
      <CamposPerfil valores={valores} errores={errores} setValor={setValor} />
      <Boton titulo="Guardar cambios" onPress={guardar} cargando={cargando} />
      <Boton titulo="Volver" variante="texto" onPress={() => router.back()} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  cuenta: { backgroundColor: colores.suave, padding: espacio.m, borderRadius: 10, gap: espacio.xs },
  cuentaTexto: { color: colores.texto, fontSize: 14 },
});
