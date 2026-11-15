import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import Boton from '../../../components/Boton';
import Mensaje from '../../../components/Mensaje';
import Pantalla from '../../../components/Pantalla';
import Selector from '../../../components/Selector';
import Titulo from '../../../components/Titulo';
import { colores, espacio, radioGrande, sombra, tipografia } from '../../../constants/theme';
import useAppActiva from '../../../hooks/useAppActiva';
import { CATEGORIAS, escucharPosts, formatearFecha } from '../../../services/foro';

// Foro de salud: lista de publicaciones en tiempo real.
export default function Comunidad() {
  const router = useRouter();
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('Todas');
  const appActiva = useAppActiva();

  // Ciclo de vida: solo escucha con la pestaña visible y la app en primer plano.
    useFocusEffect(
    useCallback(() => {
      if (!appActiva) {
        console.log('FORO: app en segundo plano, sin escucha');
        return undefined;
      }
      console.log('FORO: escuchando publicaciones');
      setError('');
      const dejar = escucharPosts(setPosts, setError);
      return () => {
        console.log('FORO: escucha detenida');
        dejar();
      };
    }, [appActiva]),
  );

  const visibles = (posts ?? []).filter((p) => filtro === 'Todas' || p.categoria === filtro);

  return (
    <Pantalla>
      <Titulo titulo="Comunidad" subtitulo="Comparte experiencias y recibe apoyo" />

      <Boton titulo="Nueva publicación" onPress={() => router.push('/nuevoPost')} />

      <Selector
        etiqueta="Categoría"
        opciones={['Todas', ...CATEGORIAS]}
        valor={filtro}
        onChange={setFiltro}
      />

      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}
      {posts === null && !error ? <ActivityIndicator size="large" color={colores.primario} /> : null}
      {posts !== null && visibles.length === 0 ? (
        <Mensaje tipo="info">Aún no hay publicaciones. ¡Sé el primero en publicar!</Mensaje>
      ) : null}

      {visibles.map((p) => (
        <Pressable
          key={p.id}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/post', params: { id: p.id } })}
          style={({ pressed }) => [styles.tarjeta, pressed && { opacity: 0.85 }]}>
          <Text style={styles.categoria}>{p.categoria}</Text>
          <Text style={styles.titulo}>{p.titulo}</Text>
          <Text style={styles.contenido} numberOfLines={2}>
            {p.contenido}
          </Text>
          <View>
            <Text style={styles.pie}>
              {p.autor} · {formatearFecha(p.creado)}
            </Text>
          </View>
        </Pressable>
      ))}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    gap: espacio.xs,
    padding: espacio.m,
    backgroundColor: colores.superficie,
    borderRadius: radioGrande,
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombra,
  },
  categoria: { ...tipografia.etiqueta, color: colores.primario },
  titulo: { ...tipografia.cuerpo, fontWeight: '700', color: colores.texto },
  contenido: { fontSize: 14, color: colores.texto },
  pie: { fontSize: 12, color: colores.textoSuave },
});