import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Mensaje from '../../components/Mensaje';
import Pantalla from '../../components/Pantalla';
import Titulo from '../../components/Titulo';
import { colores, espacio, radio } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { cambiarRol, listarUsuarios } from '../../services/usuarios';

const ETIQUETA_ROL = { usuario: 'Usuario', moderador: 'Moderador', admin: 'Administrador' };

export default function Administracion() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [trabajando, setTrabajando] = useState(null); // uid en proceso
  const [mensaje, setMensaje] = useState({ tipo: 'info', texto: '' });

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setUsuarios(await listarUsuarios());
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    const buscado = filtro.trim().toLowerCase();
    if (!buscado) return usuarios;
    return usuarios.filter(
      (u) => u.nombre.toLowerCase().includes(buscado) || u.correo.toLowerCase().includes(buscado),
    );
  }, [usuarios, filtro]);

  const alternarModerador = async (u) => {
    const nuevoRol = u.rol === 'moderador' ? 'usuario' : 'moderador';
    setTrabajando(u.uid);
    setMensaje({ tipo: 'info', texto: '' });
    try {
      await cambiarRol(u.uid, nuevoRol);
      setUsuarios((lista) => lista.map((x) => (x.uid === u.uid ? { ...x, rol: nuevoRol } : x)));
      setMensaje({
        tipo: 'exito',
        texto: `${u.nombre} ahora es ${ETIQUETA_ROL[nuevoRol].toLowerCase()}.`,
      });
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message });
    } finally {
      setTrabajando(null);
    }
  };

  return (
    <Pantalla>
      <Titulo titulo="Administrar usuarios" subtitulo="Asigna o quita el rol de moderador" />
      <Mensaje tipo={mensaje.tipo}>{mensaje.texto}</Mensaje>
      <Campo
        etiqueta="Buscar por nombre o correo"
        value={filtro}
        onChangeText={setFiltro}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {cargando ? (
        <ActivityIndicator size="large" color={colores.primario} style={{ marginVertical: espacio.l }} />
      ) : visibles.length === 0 ? (
        <Mensaje tipo="info">No se encontraron usuarios.</Mensaje>
      ) : (
        visibles.map((u) => {
          const esYo = u.uid === usuario.uid;
          const esAdminU = u.rol === 'admin';
          return (
            <View key={u.uid} style={styles.tarjeta}>
              <View style={styles.datos}>
                <Text style={styles.nombre}>
                  {u.nombre}
                  {esYo ? ' (tú)' : ''}
                </Text>
                <Text style={styles.correo}>{u.correo}</Text>
                <Text style={[styles.rol, esAdminU && styles.rolAdmin]}>{ETIQUETA_ROL[u.rol] ?? u.rol}</Text>
              </View>
              {esYo || esAdminU ? null : (
                <Boton
                  titulo={u.rol === 'moderador' ? 'Quitar moderador' : 'Hacer moderador'}
                  variante="secundario"
                  onPress={() => alternarModerador(u)}
                  cargando={trabajando === u.uid}
                  deshabilitado={trabajando !== null}
                />
              )}
            </View>
          );
        })
      )}

      <Boton titulo="Actualizar lista" variante="secundario" onPress={cargar} deshabilitado={cargando} />
      <Boton titulo="Volver" variante="texto" onPress={() => router.back()} />
      <Text style={styles.nota}>
        Los administradores se nombran directamente en Firebase Console, por seguridad.
      </Text>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espacio.m,
    gap: espacio.s,
  },
  datos: { gap: 2 },
  nombre: { fontSize: 16, fontWeight: '600', color: colores.texto },
  correo: { fontSize: 14, color: colores.textoSuave },
  rol: { fontSize: 13, color: colores.primario, fontWeight: '600', marginTop: 2 },
  rolAdmin: { color: colores.error },
  nota: { fontSize: 12, color: colores.textoSuave, textAlign: 'center', marginBottom: espacio.l },
});
