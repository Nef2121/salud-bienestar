import Mensaje from '../../../components/Mensaje';
import Pantalla from '../../../components/Pantalla';
import Titulo from '../../../components/Titulo';

// Foro de salud (en construcción: lo desarrolla el Miembro 4).
export default function Comunidad() {
  return (
    <Pantalla>
      <Titulo titulo="Comunidad" subtitulo="Comparte experiencias y recibe apoyo" />
      <Mensaje tipo="info">Aquí estará el foro de salud. Próximamente.</Mensaje>
    </Pantalla>
  );
}