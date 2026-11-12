import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colores, radio } from '../constants/theme';

// variante: 'primario' (relleno) | 'secundario' (borde) | 'texto' (enlace)
export default function Boton({ titulo, onPress, variante = 'primario', cargando = false, deshabilitado = false }) {
  const inactivo = cargando || deshabilitado;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        variante === 'primario' && styles.primario,
        variante === 'secundario' && styles.secundario,
        variante === 'texto' && styles.sinFondo,
        pressed && styles.presionado,
        inactivo && styles.inactivo,
      ]}>
      {cargando ? (
        <ActivityIndicator color={variante === 'primario' ? '#FFFFFF' : colores.primario} />
      ) : (
        <Text style={[styles.texto, variante !== 'primario' && styles.textoOscuro]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radio, paddingHorizontal: 16 },
  primario: { backgroundColor: colores.primario },
  secundario: { borderWidth: 1, borderColor: colores.primario, backgroundColor: colores.superficie },
  sinFondo: { minHeight: 40 },
  presionado: { opacity: 0.85 },
  inactivo: { opacity: 0.5 },
  texto: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  textoOscuro: { color: colores.primario },
});
