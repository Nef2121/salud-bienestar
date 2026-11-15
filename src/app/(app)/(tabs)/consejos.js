import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import Mensaje from '../../../components/Mensaje';
import Pantalla from '../../../components/Pantalla';
import Selector from '../../../components/Selector';
import Titulo from '../../../components/Titulo';
import { colores, espacio, radioGrande, sombra, tipografia } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import { TEMAS, descargarResumen } from '../../../services/articulos';
import { CATEGORIAS_CONSEJO, CONSEJOS, consejosParaTi } from '../../../services/consejos';

function TarjetaConsejo({ consejo }) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.categoria}>{consejo.categoria}</Text>
      <Text style={styles.titulo}>{consejo.titulo}</Text>
      <Text style={styles.texto}>{consejo.texto}</Text>
    </View>
  );
}

// Consejos de dieta, sueño, ejercicio y bienestar según el perfil del usuario,
// y artículos descargados de una API externa (Wikipedia).
export default function Consejos() {
  const { usuario } = useAuth();
  const [categoria, setCategoria] = useState('Todas');

  const [tema, setTema] = useState('');
  const [articulo, setArticulo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorArticulo, setErrorArticulo] = useState('');

  const paraTi = useMemo(() => consejosParaTi(usuario.perfil), [usuario.perfil]);
  const filtrar = (lista) => lista.filter((c) => categoria === 'Todas' || c.categoria === categoria);

  const paraTiVisibles = filtrar(paraTi);
  const otrosVisibles = filtrar(CONSEJOS.filter((c) => !paraTi.includes(c)));
  const objetivos = usuario.perfil.objetivos ?? [];

  const abrirTema = async (etiqueta) => {
    setTema(etiqueta);
    setArticulo(null);
    setErrorArticulo('');
    setCargando(true);
    const elegido = TEMAS.find((t) => t.etiqueta === etiqueta);
    try {
      setArticulo(await descargarResumen(elegido.pagina));
    } catch (e) {
      setErrorArticulo(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo titulo="Consejos" subtitulo="Dieta, sueño y bienestar" />

      <Mensaje tipo="info">
        {objetivos.length
          ? `Elegidos según tu perfil y tus objetivos: ${objetivos.join(', ')}.`
          : 'Elegidos según tu perfil.'}
      </Mensaje>

      <Selector
        etiqueta="Categoría"
        opciones={['Todas', ...CATEGORIAS_CONSEJO]}
        valor={categoria}
        onChange={setCategoria}
      />

      <Text style={styles.seccion}>Para ti</Text>
      {paraTiVisibles.length === 0 ? (
        <Mensaje tipo="info">No hay consejos personalizados en esta categoría.</Mensaje>
      ) : (
        paraTiVisibles.map((c) => <TarjetaConsejo key={c.id} consejo={c} />)
      )}

      {otrosVisibles.length > 0 ? <Text style={styles.seccion}>Más consejos</Text> : null}
      {otrosVisibles.map((c) => (
        <TarjetaConsejo key={c.id} consejo={c} />
      ))}

      <Text style={styles.seccion}>Aprende más</Text>
      <Selector
        etiqueta="Artículos de salud (se descargan de internet)"
        opciones={TEMAS.map((t) => t.etiqueta)}
        valor={tema}
        onChange={abrirTema}
      />
      {cargando ? <ActivityIndicator size="large" color={colores.primario} /> : null}
      {errorArticulo ? <Mensaje tipo="error">{errorArticulo}</Mensaje> : null}
      {articulo ? (
        <View style={styles.tarjeta}>
          <Text style={styles.categoria}>Wikipedia</Text>
          <Text style={styles.titulo}>{articulo.titulo}</Text>
          <Text style={styles.texto}>{articulo.texto}</Text>
          {articulo.url ? (
            <Pressable onPress={() => Linking.openURL(articulo.url)} accessibilityRole="link">
              <Text style={styles.enlace}>Leer artículo completo</Text>
            </Pressable>
          ) : null}
          <Text style={styles.fuente}>Fuente: Wikipedia (CC BY-SA)</Text>
        </View>
      ) : null}

      <Text style={styles.aviso}>
        Son consejos generales y no sustituyen la consulta con un profesional de la salud.
      </Text>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  seccion: { ...tipografia.seccion, color: colores.texto },
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
  texto: { fontSize: 14, color: colores.texto },
  enlace: { color: colores.primario, fontWeight: '600', fontSize: 14 },
  fuente: { fontSize: 11, color: colores.textoSuave },
  aviso: { fontSize: 12, color: colores.textoSuave, textAlign: 'center', marginBottom: espacio.m },
});