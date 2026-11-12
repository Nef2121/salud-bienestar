import { StyleSheet, Text, View } from 'react-native';

import { colores, espacio, radio } from '../constants/theme';

// Aviso en pantalla (funciona igual en web y Android). tipo: 'error' | 'exito' | 'info'
export default function Mensaje({ tipo = 'info', children }) {
  if (!children) return null;
  return (
    <View style={[styles.caja, styles[tipo]]} accessibilityRole="alert">
      <Text style={[styles.texto, tipo === 'error' && { color: colores.error }, tipo === 'exito' && { color: colores.exito }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { padding: espacio.m - 4, borderRadius: radio },
  texto: { fontSize: 14, color: colores.texto },
  error: { backgroundColor: colores.errorFondo },
  exito: { backgroundColor: colores.exitoFondo },
  info: { backgroundColor: colores.suave },
});
