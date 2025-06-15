
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  status: 'active' | 'pending' | 'suspended';
  department?: string;
  position?: string;
  phone?: string;
  avatar_url?: string;
  unit_id?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<{ data: any; error: any }>;
  login: (email: string, password: string) => Promise<{ data: any; error: any }>;
  register: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return { data: null, error };
      }
      
      const mappedProfile: Profile = {
        ...data,
        status: data.status === 'inactive' ? 'suspended' : data.status
      };
      
      setProfile(mappedProfile);
      return { data: mappedProfile, error: null };
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (initialSession?.user) {
          const authUser: AuthUser = {
            id: initialSession.user.id,
            email: initialSession.user.email!,
            user_metadata: initialSession.user.user_metadata
          };
          
          setSession(initialSession);
          setUser(authUser);
          
          // Fetch profile without blocking
          setTimeout(() => {
            if (mounted) {
              fetchProfile(initialSession.user.id);
            }
          }, 0);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (!mounted) return;

        setSession(session);
        
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            user_metadata: session.user.user_metadata
          };
          setUser(authUser);
          
          // Fetch profile without blocking
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
            }
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (result.error) {
        toast({
          title: 'Erro no login',
          description: result.error.message,
          variant: 'destructive',
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (result.error) {
        toast({
          title: 'Erro no cadastro',
          description: result.error.message,
          variant: 'destructive',
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email);
      
      if (result.error) {
        toast({
          title: 'Erro',
          description: result.error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Email enviado',
          description: 'Verifique sua caixa de entrada para redefinir a senha.',
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  };

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      const result = await supabase.auth.updateUser({
        data: updates,
      });
      
      if (result.error) {
        toast({
          title: 'Erro',
          description: result.error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Perfil atualizado',
          description: 'Suas informações foram atualizadas com sucesso.',
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  };

  const isAdmin = () => {
    return profile?.status === 'active' && user?.email?.includes('admin');
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    login: signIn,
    register: signUp,
    logout: signOut,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
