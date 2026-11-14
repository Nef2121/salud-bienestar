import Mensaje from '../../../components/Mensaje';
import Pantalla from '../../../components/Pantalla';
import Titulo from '../../../components/Titulo';

// Consejos personalizados (en construcción: lo desarrolla el Miembro 4).
export default function Consejos() {
  return (
    <Pantalla>
      <Titulo titulo="Consejos" subtitulo="Dieta, sueño y bienestar" />
      <Mensaje tipo="info">Aquí aparecerán tus consejos personalizados. Próximamente.</Mensaje>
    </Pantalla>
  );
}