import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espacio } from '../constants/theme';

// Selector de opciones en formato "chips".
// Simple: `valor` es un string. Múltiple (`multiple`): `valor` es un arreglo.
export default function Selector({ etiqueta, opciones, valor, onChange, multiple = false, error }) {
  const seleccionada = (opcion) => (multiple ? valor.includes(opcion) : valor === opcion);

  const alternar = (opcion) => {
    if (!multiple) return onChange(opcion);
    onChange(valor.includes(opcion) ? valor.filter((o) => o !== opcion) : [...valor, opcion]);
  };

  return (
    <View style={styles.grupo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <View style={styles.fila}>
        {opciones.map((opcion) => (
          <Pressable
            key={opcion}
            onPress={() => alternar(opcion)}
            accessibilityRole={multiple ? 'checkbox' : 'radio'}
            accessibilityState={{ selected: seleccionada(opcion) }}
            style={[styles.chip, seleccionada(opcion) && styles.chipActivo]}>
            <Text style={[styles.texto, seleccionada(opcion) && styles.textoActivo]}>{opcion}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: espacio.s },
  etiqueta: { fontSize: 14, fontWeight: '600', color: colores.texto },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.s },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  texto: { color: colores.texto, fontSize: 14 },
  textoActivo: { color: '#FFFFFF', fontWeight: '600' },
  error: { color: colores.error, fontSize: 13 },
});
