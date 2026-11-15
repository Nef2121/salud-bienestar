import { useRouter } from 'expo-router';
import { useState } from 'react';

import Boton from '../../components/Boton';
import Campo from '../../components/Campo';
import Mensaje from '../../components/Mensaje';
import Pantalla from '../../components/Pantalla';
import Selector from '../../components/Selector';
import Titulo from '../../components/Titulo';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIAS, crearPost } from '../../services/foro';

// Formulario para crear una publicación en el foro.
export default function NuevoPost() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [categoria, setCategoria] = useState('Bienestar');
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const publicar = async () => {
    const nuevos = {};
    if (titulo.trim().length < 3) nuevos.titulo = 'El título debe tener al menos 3 caracteres.';
    if (contenido.trim().length < 5) nuevos.contenido = 'Escribe al menos 5 caracteres.';
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    setCargando(true);
    setMensaje('');
    try {
      await crearPost({ usuario, categoria, titulo, contenido });
      router.back();
    } catch (e) {
      setMensaje(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo titulo="Nueva publicación" subtitulo="Comparte con la comunidad" />

      <Selector etiqueta="Categoría" opciones={CATEGORIAS} valor={categoria} onChange={setCategoria} />

      <Campo
        etiqueta="Título"
        value={titulo}
        onChangeText={setTitulo}
        maxLength={80}
        error={errores.titulo}
        placeholder="¿De qué quieres hablar?"
      />

      <Campo
        etiqueta="Mensaje"
        value={contenido}
        onChangeText={setContenido}
        maxLength={1000}
        error={errores.contenido}
        placeholder="Cuenta tu experiencia o haz tu pregunta"
        multiline
        numberOfLines={5}
        style={{ minHeight: 120, textAlignVertical: 'top', paddingVertical: 12 }}
      />

      {mensaje ? <Mensaje tipo="error">{mensaje}</Mensaje> : null}

      <Boton titulo="Publicar" onPress={publicar} cargando={cargando} />
      <Boton titulo="Cancelar" variante="texto" onPress={() => router.back()} />
    </Pantalla>
  );
}