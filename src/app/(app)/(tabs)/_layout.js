import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Icono from '../../../components/Icono';
import { colores, tipografia } from '../../../constants/theme';

// Navegación principal: barra de pestañas inferior.
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const pestana = (nombre) => ({ color }) => <Icono nombre={nombre} color={color} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarLabelStyle: tipografia.etiqueta,
        tabBarStyle: {
          backgroundColor: colores.superficie,
          borderTopColor: colores.borde,
          height: 58 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 4,
        },
      }}>
      <Tabs.Screen name="inicio" options={{ title: 'Inicio', tabBarIcon: pestana('inicio') }} />
      <Tabs.Screen name="actividad" options={{ title: 'Actividad', tabBarIcon: pestana('actividad') }} />
      <Tabs.Screen name="comunidad" options={{ title: 'Comunidad', tabBarIcon: pestana('comunidad') }} />
      <Tabs.Screen name="consejos" options={{ title: 'Consejos', tabBarIcon: pestana('consejos') }} />
      <Tabs.Screen name="cuenta" options={{ title: 'Cuenta', tabBarIcon: pestana('cuenta') }} />
    </Tabs>
  );
}