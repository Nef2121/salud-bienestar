import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Mensaje from '../../components/Mensaje';
import Pantalla from '../../components/Pantalla';
import Titulo from '../../components/Titulo';
import { colores, espacio } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { validarCorreo } from '../../utils/validators';

export default function Login() {
  const { iniciarSesion } = useAuth();
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    setMensaje('');
    const nuevos = {};
    const errorCorreo = validarCorreo(correo);
    if (errorCorreo) nuevos.correo = errorCorreo;
    if (!password) nuevos.password = 'La contraseña es obligatoria.';
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    setCargando(true);
    try {
      await iniciarSesion(correo, password);
      router.replace('/');
    } catch (e) {
      setMensaje(e.message || 'No se pudo iniciar sesión.');
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo titulo="Iniciar sesión" subtitulo="Bienvenido de nuevo a Salud y Bienestar" />
      <Mensaje tipo="error">{mensaje}</Mensaje>
      <Campo
        etiqueta="Correo electrónico"
        value={correo}
        onChangeText={setCorreo}
        error={errores.correo}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
      />
      <Campo
        etiqueta="Contraseña"
        value={password}
        onChangeText={setPassword}
        error={errores.password}
        secreto
        autoCapitalize="none"
        autoComplete="current-password"
        onSubmitEditing={enviar}
      />
      <Boton titulo="Entrar" onPress={enviar} cargando={cargando} />
      <View style={styles.enlaces}>
        <Link href="/recuperar" style={styles.enlace}>¿Olvidaste tu contraseña?</Link>
        <Text style={styles.texto}>
          ¿No tienes cuenta? <Link href="/registro" style={styles.enlace}>Regístrate</Link>
        </Text>
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  enlaces: { alignItems: 'center', gap: espacio.s },
  enlace: { color: colores.primario, fontWeight: '600', fontSize: 14 },
  texto: { color: colores.textoSuave, fontSize: 14 },
});
