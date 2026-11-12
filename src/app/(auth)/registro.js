import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import CamposPerfil from '../../components/CamposPerfil';
import Mensaje from '../../components/Mensaje';
import Pantalla from '../../components/Pantalla';
import Titulo from '../../components/Titulo';
import { colores } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
  normalizarPerfil,
  perfilAFormulario,
  validarConfirmacion,
  validarCorreo,
  validarPassword,
  validarPerfil,
} from '../../utils/validators';

export default function Registro() {
  const { registrar } = useAuth();
  const router = useRouter();
  const [cuenta, setCuenta] = useState({ correo: '', password: '', confirmacion: '' });
  const [perfil, setPerfil] = useState(perfilAFormulario());
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const setCampoCuenta = (campo, valor) => setCuenta((c) => ({ ...c, [campo]: valor }));
  const setCampoPerfil = (campo, valor) => setPerfil((p) => ({ ...p, [campo]: valor }));

  const enviar = async () => {
    setMensaje('');
    const nuevos = {
      correo: validarCorreo(cuenta.correo),
      password: validarPassword(cuenta.password),
      confirmacion: validarConfirmacion(cuenta.password, cuenta.confirmacion),
      ...validarPerfil(perfil),
    };
    const soloErrores = Object.fromEntries(Object.entries(nuevos).filter(([, m]) => m));
    setErrores(soloErrores);
    if (Object.keys(soloErrores).length) {
      setMensaje('Revisa los campos marcados en rojo.');
      return;
    }

    setCargando(true);
    try {
      await registrar(cuenta.correo, cuenta.password, normalizarPerfil(perfil));
      router.replace('/');
    } catch (e) {
      setMensaje(e.message || 'No se pudo crear la cuenta.');
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo titulo="Crear cuenta" subtitulo="Completa tus datos para empezar" />
      <Mensaje tipo="error">{mensaje}</Mensaje>
      <Campo
        etiqueta="Correo electrónico"
        value={cuenta.correo}
        onChangeText={(t) => setCampoCuenta('correo', t)}
        error={errores.correo}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
      />
      <Campo
        etiqueta="Contraseña"
        value={cuenta.password}
        onChangeText={(t) => setCampoCuenta('password', t)}
        error={errores.password}
        ayuda="Mínimo 8 caracteres, con mayúscula, minúscula y número."
        secreto
        autoCapitalize="none"
        autoComplete="new-password"
      />
      <Campo
        etiqueta="Confirmar contraseña"
        value={cuenta.confirmacion}
        onChangeText={(t) => setCampoCuenta('confirmacion', t)}
        error={errores.confirmacion}
        secreto
        autoCapitalize="none"
        autoComplete="new-password"
      />
      <CamposPerfil valores={perfil} errores={errores} setValor={setCampoPerfil} />
      <Boton titulo="Crear cuenta" onPress={enviar} cargando={cargando} />
      <Link href="/login" style={styles.enlace}>¿Ya tienes cuenta? Inicia sesión</Link>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  enlace: { color: colores.primario, fontWeight: '600', fontSize: 14, textAlign: 'center', marginBottom: 24 },
});
