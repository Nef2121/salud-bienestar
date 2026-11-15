import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Icono from '../../components/Icono';
import Mensaje from '../../components/Mensaje';
import Pantalla from '../../components/Pantalla';
import { colores, espacio, radioGrande, tipografia } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
    alternarLike,
    crearComentario,
    eliminarComentario,
    eliminarPost,
    escucharComentarios,
    escucharLikes,
    escucharPost,
    formatearFecha,
} from '../../services/foro';

// Detalle de una publicación: contenido, comentarios y moderación.
export default function Post() {
  const { id } = useLocalSearchParams();
  const { usuario, esModerador } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState(undefined); // undefined = cargando, null = no existe
  const [comentarios, setComentarios] = useState([]);
  const [likes, setLikes] = useState([]);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(null); // 'post' o id de un comentario

  // Ciclo de vida: deja de escuchar al salir de la pantalla.
    useEffect(() => {
    const dejarPost = escucharPost(id, setPost, setError);
    const dejarComentarios = escucharComentarios(id, setComentarios, setError);
    const dejarLikes = escucharLikes(id, setLikes, setError);
    return () => {
      dejarPost();
      dejarComentarios();
      dejarLikes();
    };
  }, [id]);

    const likeDado = likes.includes(usuario.uid);

  const darLike = async () => {
    setError('');
    try {
      await alternarLike({ usuario, postId: id, likeDado });
    } catch (e) {
      setError(e.message);
    }
  };

  const puedeBorrar = (uidAutor) => uidAutor === usuario.uid || esModerador;

  const comentar = async () => {
    if (texto.trim().length < 2) {
      setError('Escribe un comentario antes de enviar.');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await crearComentario({ usuario, postId: id, contenido: texto });
      setTexto('');
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const borrar = async () => {
    setError('');
    try {
      if (confirmando === 'post') {
        await eliminarPost(id);
        router.back();
      } else {
        await eliminarComentario(id, confirmando);
        setConfirmando(null);
      }
    } catch (e) {
      setError(e.message);
      setConfirmando(null);
    }
  };

  // Aviso de confirmación antes de eliminar (funciona igual en web y Android).
  const confirmacion = (
    <View style={styles.confirmar}>
      <Text style={styles.pie}>¿Seguro que quieres eliminarlo?</Text>
      <View style={styles.fila}>
        <Pressable onPress={borrar} accessibilityRole="button">
          <Text style={styles.eliminar}>Sí, eliminar</Text>
        </Pressable>
        <Pressable onPress={() => setConfirmando(null)} accessibilityRole="button">
          <Text style={styles.cancelar}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );

  if (post === undefined && !error) {
    return (
      <Pantalla>
        <ActivityIndicator size="large" color={colores.primario} />
      </Pantalla>
    );
  }

  if (post === null || post === undefined) {
    return (
      <Pantalla>
        <Mensaje tipo="info">Esta publicación ya no existe.</Mensaje>
        {error ? <Mensaje tipo="error">{error}</Mensaje> : null}
        <Boton titulo="Volver" variante="texto" onPress={() => router.back()} />
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <Boton titulo="Volver" variante="texto" onPress={() => router.back()} />

      <View style={styles.post}>
        <Text style={styles.categoria}>{post.categoria}</Text>
        <Text style={styles.titulo}>{post.titulo}</Text>
        <Text style={styles.contenido}>{post.contenido}</Text>
        <Text style={styles.pie}>
          {post.autor} · {formatearFecha(post.creado)}
        </Text>

        <Pressable
          onPress={darLike}
          accessibilityRole="button"
          accessibilityLabel="Me gusta"
          style={styles.like}>
          <Icono nombre="corazon" color={likeDado ? colores.error : colores.textoSuave} tamano={20} />
          <Text style={[styles.likeTexto, likeDado && { color: colores.error }]}>
            {likes.length} Me gusta
          </Text>
        </Pressable>

        {puedeBorrar(post.uid) && confirmando !== 'post' ? (
          <Pressable onPress={() => setConfirmando('post')} accessibilityRole="button">
            <Text style={styles.eliminar}>Eliminar publicación</Text>
          </Pressable>
        ) : null}
        {confirmando === 'post' ? confirmacion : null}
      </View>

      <Text style={styles.seccion}>Comentarios ({comentarios.length})</Text>

      {comentarios.length === 0 ? <Mensaje tipo="info">Aún no hay comentarios.</Mensaje> : null}

      {comentarios.map((c) => (
        <View key={c.id} style={styles.comentario}>
          <Text style={styles.contenido}>{c.contenido}</Text>
          <Text style={styles.pie}>
            {c.autor} · {formatearFecha(c.creado)}
          </Text>
          {puedeBorrar(c.uid) && confirmando !== c.id ? (
            <Pressable onPress={() => setConfirmando(c.id)} accessibilityRole="button">
              <Text style={styles.eliminar}>Eliminar</Text>
            </Pressable>
          ) : null}
          {confirmando === c.id ? confirmacion : null}
        </View>
      ))}

      <Campo
        etiqueta="Tu comentario"
        value={texto}
        onChangeText={setTexto}
        maxLength={500}
        placeholder="Escribe un comentario"
      />
      {error ? <Mensaje tipo="error">{error}</Mensaje> : null}
      <Boton titulo="Comentar" onPress={comentar} cargando={enviando} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  post: {
    gap: espacio.s,
    padding: espacio.m,
    backgroundColor: colores.superficie,
    borderRadius: radioGrande,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  categoria: { ...tipografia.etiqueta, color: colores.primario },
  titulo: { ...tipografia.seccion, color: colores.texto },
  contenido: { fontSize: 15, color: colores.texto },
  pie: { fontSize: 12, color: colores.textoSuave },
  seccion: { ...tipografia.seccion, color: colores.texto },
  comentario: {
    gap: espacio.xs,
    padding: espacio.m,
    backgroundColor: colores.superficie,
    borderRadius: radioGrande,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  confirmar: { gap: espacio.xs },
  fila: { flexDirection: 'row', gap: espacio.m },
  eliminar: { color: colores.error, fontWeight: '600', fontSize: 14 },
  cancelar: { color: colores.textoSuave, fontWeight: '600', fontSize: 14 },
  like: { flexDirection: 'row', alignItems: 'center', gap: espacio.s, alignSelf: 'flex-start', paddingVertical: 4 },
  likeTexto: { fontSize: 14, fontWeight: '600', color: colores.textoSuave },
});