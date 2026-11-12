import { Redirect } from 'expo-router';

import { useAuth } from '../context/AuthContext';

// Punto de entrada: según haya sesión o no, envía a inicio o a login.
export default function Entrada() {
  const { usuario } = useAuth();
  return <Redirect href={usuario ? '/inicio' : '/login'} />;
}
