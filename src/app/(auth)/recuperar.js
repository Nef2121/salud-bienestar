import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Mensaje from '../../components/Mensaje';
import Pantalla from '../../components/Pantalla';
import Titulo from '../../components/Titulo';
import { colores } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { validarCorreo } from '../../utils/validators';

export default function Recuperar() {
  const { recuperarPassword } = useAuth();
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: 'info', texto: '' });
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    setMensaje({ tipo: 'info', texto: '' });
    const errorCorreo = validarCorreo(correo);
    setError(errorCorreo);
    if (errorCorreo) return;

    setCargando(true);
    try {
      await recuperarPassword(correo);
      // No se revela si el correo existe (evita descubrir cuentas registradas).
      setMensaje({
        tipo: 'exito',
        texto: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
      });
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message || 'No se pudo enviar el correo.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo titulo="Recuperar contraseña" subtitulo="Te enviaremos un enlace a tu correo" />
      <Mensaje tipo={mensaje.tipo}>{mensaje.texto}</Mensaje>
      <Campo
        etiqueta="Correo electrónico"
        value={correo}
        onChangeText={setCorreo}
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        onSubmitEditing={enviar}
      />
      <Boton titulo="Enviar enlace" onPress={enviar} cargando={cargando} />
      <Link href="/login" style={styles.enlace}>Volver a iniciar sesión</Link>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  enlace: { color: colores.primario, fontWeight: '600', fontSize: 14, textAlign: 'center' },
});
