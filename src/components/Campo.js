import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colores, espacio, radio } from '../constants/theme';

// Campo de texto con etiqueta, ayuda y mensaje de error.
// `secreto` oculta el texto y muestra el botón "Mostrar".
export default function Campo({ etiqueta, error, ayuda, secreto = false, style, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.grupo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <View style={[styles.caja, error ? styles.cajaError : null]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colores.textoSuave}
          secureTextEntry={secreto && !visible}
          accessibilityLabel={etiqueta}
          {...props}
        />
        {secreto ? (
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
            <Text style={styles.mostrar}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && ayuda ? <Text style={styles.ayuda}>{ayuda}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: espacio.xs },
  etiqueta: { fontSize: 14, fontWeight: '600', color: colores.texto },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio,
    paddingHorizontal: espacio.m,
  },
  cajaError: { borderColor: colores.error },
  input: { flex: 1, minHeight: 46, fontSize: 16, color: colores.texto },
  mostrar: { color: colores.primario, fontWeight: '600', fontSize: 14 },
  error: { color: colores.error, fontSize: 13 },
  ayuda: { color: colores.textoSuave, fontSize: 13 },
});
