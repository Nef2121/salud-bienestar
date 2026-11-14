import { Stack } from "expo-router";

import { useAuth } from "../../context/AuthContext";

// Grupo de pantallas privadas (requieren sesión).
// El Miembro 4 puede reemplazar este Stack por la navegación principal (tabs).
export default function AppLayout() {
  const { esAdmin } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="inicio" />
      <Stack.Screen name="perfil" />
      <Stack.Screen name="objetivos" />
      <Stack.Screen name="recordatorios" />
      <Stack.Screen name="comidas" />
      <Stack.Screen name="notificaciones" />
      {/* Solo accesible para administradores (las reglas de Firestore también lo exigen) */}
      <Stack.Protected guard={esAdmin}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
}
