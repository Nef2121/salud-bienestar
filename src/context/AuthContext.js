import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import * as auth from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    return auth.escucharSesion((u) => {
      setUsuario(u);
      setCargando(false);
    });
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      cargando,
      esAdmin: usuario?.perfil?.rol === 'admin',
      esModerador: ['admin', 'moderador'].includes(usuario?.perfil?.rol),
      registrar: auth.registrar,
      iniciarSesion: auth.iniciarSesion,
      cerrarSesion: auth.cerrarSesion,
      recuperarPassword: auth.recuperarPassword,
      guardarPerfil: (cambios) => auth.guardarPerfil(usuario.uid, cambios),
    }),
    [usuario, cargando],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return contexto;
}
