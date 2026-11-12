import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { anchoMaximo, colores, espacio } from '../constants/theme';

// Contenedor de pantalla: área segura, scroll, teclado y ancho máximo (web).
export default function Pantalla({ children }) {
  return (
    <SafeAreaView style={styles.area}>
      <KeyboardAvoidingView
        style={styles.area}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={styles.contenido}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, backgroundColor: colores.fondo },
  scroll: { flexGrow: 1, alignItems: 'center', padding: espacio.m },
  contenido: { width: '100%', maxWidth: anchoMaximo, gap: espacio.m },
});
