import { StyleSheet, Text, View } from 'react-native';

import { colores, espacio } from '../constants/theme';

export default function Titulo({ titulo, subtitulo }) {
  return (
    <View style={styles.caja}>
      <Text style={styles.titulo} accessibilityRole="header">{titulo}</Text>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { gap: espacio.xs, marginTop: espacio.m },
  titulo: { fontSize: 26, fontWeight: '700', color: colores.texto },
  subtitulo: { fontSize: 15, color: colores.textoSuave },
});
