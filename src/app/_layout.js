import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { colores } from '../constants/theme';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Rutas protegidas: sin sesión solo existe el grupo (auth); con sesión, el grupo (app).
function Rutas() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colores.fondo }}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!usuario}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Rutas />
    </AuthProvider>
  );
}
