
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'supervisor';
  department?: string;
  position?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  // Compatibilidade com código existente
  signin?: (username: string, password: string) => boolean;
  signout?: () => void;
}

// Export the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user: supabaseUser,
    profile,
    userRole,
    loading: supabaseLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: supabaseAuthenticated
  } = useSupabaseAuth();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabaseUser && profile && userRole) {
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: profile.full_name,
        role: userRole.role,
        department: profile.department,
        position: profile.position,
      });
    } else {
      setUser(null);
    }
    
    setLoading(supabaseLoading);
  }, [supabaseUser, profile, userRole, supabaseLoading]);

  const login = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      throw new Error(error.message);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const { error } = await signUp(email, password, name);
    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    const { error } = await signOut();
    if (error) {
      throw new Error(error.message);
    }
  };

  const handleResetPassword = async (email: string) => {
    const { error } = await resetPassword(email);
    if (error) {
      throw new Error(error.message);
    }
  };

  // Funções de compatibilidade com código antigo
  const signin = (username: string, password: string): boolean => {
    // Esta é uma implementação de fallback para compatibilidade
    // O código antigo deve usar login() em vez de signin()
    console.warn('signin() is deprecated, use login() instead');
    return false;
  };

  const signout = () => {
    logout().catch(console.error);
  };

  const value = {
    user,
    login,
    register,
    logout,
    resetPassword: handleResetPassword,
    isAuthenticated: supabaseAuthenticated,
    loading,
    signin,
    signout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
