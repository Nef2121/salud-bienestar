import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espacio, radioGrande, sombra, tipografia } from '../constants/theme';
import Icono from './Icono';

// Tarjeta de acceso rápido: icono, título, descripción y flecha.
export default function TarjetaAcceso({ icono, titulo, descripcion, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      style={({ pressed }) => [styles.tarjeta, pressed && styles.presionado]}>
      <View style={styles.icono}>
        <Icono nombre={icono} />
      </View>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        {descripcion ? <Text style={styles.descripcion}>{descripcion}</Text> : null}
      </View>
      <Icono nombre="siguiente" color={colores.textoSuave} tamano={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.m,
    padding: espacio.m,
    backgroundColor: colores.superficie,
    borderRadius: radioGrande,
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombra,
  },
  presionado: { opacity: 0.85 },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.suave,
  },
  textos: { flex: 1, gap: 2 },
  titulo: { ...tipografia.cuerpo, fontWeight: '600', color: colores.texto },
  descripcion: { fontSize: 13, color: colores.textoSuave },
});