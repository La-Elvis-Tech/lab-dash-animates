import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { login as doLogin, logout as doLogout, getSession } from '../services/authService';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextData {
  user: User | null;
  signin: (username: string, password: string) => boolean;
  signout: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser({ id: session.id, username: session.username, role: session.role });
    }
  }, []);

  const signin = (username: string, password: string): boolean => {
    const session = doLogin({ username, password });
    if (!session) return false;

    setUser({ id: session.id, username: session.username, role: session.role });
    return true;
  };

  const signout = () => {
    doLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};
