import NetInfo from "@react-native-community/netinfo";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { colores } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

import { iniciarActividadDB } from "../../services/actividadDB";
import { sincronizarPendientes } from "../../services/sincronizacion";

// Grupo de pantallas privadas.
export default function AppLayout() {
  const { esAdmin, usuario } = useAuth();

  const [bdLista, setBdLista] = useState(false);
  const [errorBD, setErrorBD] = useState(null);

  //Inicializa SQLite al cargar la aplicación.
  useEffect(() => {
    let activo = true;

    async function prepararBaseDatos() {
      try {
        await iniciarActividadDB();

        if (activo) {
          setBdLista(true);
        }
      } catch (error) {
        if (activo) {
          setErrorBD(error.message);
        }
      }
    }

    prepararBaseDatos();

    return () => {
      activo = false;
    };
  }, []);

  //Detecta la conexión y sincroniza los registros pendientes.
  useEffect(() => {
    if (!bdLista || !usuario?.uid) {
      return;
    }

    let sincronizando = false;

    const unsubscribe = NetInfo.addEventListener((estado) => {
      const conectado =
        estado.isConnected === true && estado.isInternetReachable !== false;

      if (!conectado || sincronizando) {
        return;
      }

      sincronizando = true;

      sincronizarPendientes(usuario.uid)
        .then((resultado) => {
          if (resultado.totalPendientes > 0) {
            console.log("SINCRONIZACIÓN AUTOMÁTICA:", resultado);
          }
        })
        .catch((error) => {
          console.log("ERROR EN SINCRONIZACIÓN AUTOMÁTICA:", error.message);
        })
        .finally(() => {
          sincronizando = false;
        });
    });

    //Elimina el listener cuando se desmonta el componente.
    return () => {
      unsubscribe();
    };
  }, [bdLista, usuario?.uid]);

  // Mientras SQLite se prepara.
  if (!bdLista && !errorBD) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colores.fondo,
        }}
      >
        <ActivityIndicator size="large" color={colores.primario} />
        <Text>Preparando base de datos...</Text>
      </View>
    );
  }

  //Error de inicialización.
  if (errorBD) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text>No se pudo preparar la base de datos.</Text>
        <Text>{errorBD}</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="perfil" />
      <Stack.Screen name="progreso" />
      <Stack.Screen name="registroActividad" />
      <Stack.Screen name="registroEntrenamientos" />
      <Stack.Screen name="consultarEntrenamientos" />

      <Stack.Protected guard={esAdmin}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
}
