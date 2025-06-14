
import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface AuthContextType {
  user: any;
  session: any;
  profile: any;
  userRole: any;
  loading: boolean;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<{ data: any; error: any }>;
  hasRole: (role: 'admin' | 'user' | 'supervisor') => boolean;
  isAdmin: () => boolean;
  isSupervisor: () => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseAuth = useSupabaseAuth();

  const login = async (email: string, password: string) => {
    const { error } = await supabaseAuth.signIn(email, password);
    if (error) throw error;
  };

  const register = async (email: string, password: string, fullName: string) => {
    const { error } = await supabaseAuth.signUp(email, password, fullName);
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabaseAuth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabaseAuth.resetPassword(email);
    if (error) throw error;
  };

  const updateProfile = async (updates: any) => {
    const result = await supabaseAuth.updateProfile(updates);
    return {
      data: result.data || null,
      error: result.error || null
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user: supabaseAuth.user,
        session: supabaseAuth.session,
        profile: supabaseAuth.profile,
        userRole: supabaseAuth.userRole,
        loading: supabaseAuth.loading,
        initializing: supabaseAuth.initializing,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        hasRole: supabaseAuth.hasRole,
        isAdmin: supabaseAuth.isAdmin,
        isSupervisor: supabaseAuth.isSupervisor,
        isAuthenticated: supabaseAuth.isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
