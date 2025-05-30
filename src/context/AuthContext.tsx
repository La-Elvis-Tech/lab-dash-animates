// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import {
  login as doLogin,
  logout as doLogout,
  getSession,
} from '../services/authService';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signin: (username: string, password: string) => boolean;
  signout: () => void;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const logoutTimer = useRef<number>();

  // Função para agendar o auto-logout
  const scheduleLogout = (expiresAt: number) => {
    const ms = expiresAt - Date.now();
    if (ms <= 0) {
      signout();
    } else {
      // limpa timer anterior
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      // agenda novo logout
      logoutTimer.current = window.setTimeout(() => {
        signout();
        alert('Sua sessão expirou. Faça login novamente.');
      }, ms);
    }
  };

  // Carrega sessão salva no storage quando monta
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser({
        id: session.id,
        username: session.username,
        role: session.role,
      });
      scheduleLogout(session.expires);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signin = (username: string, password: string): boolean => {
    const session = doLogin({ username, password });
    if (!session) return false;

    setUser({
      id: session.id,
      username: session.username,
      role: session.role,
    });
    scheduleLogout(session.expires);
    return true;
  };

  const signout = () => {
    doLogout();
    setUser(null);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};
