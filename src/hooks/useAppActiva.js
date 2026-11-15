import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

// Ciclo de vida: indica si la app está en primer plano ('active').
// Se usa para dejar de escuchar Firestore cuando la app pasa a segundo plano.
export default function useAppActiva() {
  const [activa, setActiva] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) => {
      console.log('APPSTATE:', estado);
      setActiva(estado === 'active');
    });
    return () => suscripcion.remove();
  }, []);

  return activa;
}