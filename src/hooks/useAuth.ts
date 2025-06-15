
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export type UserRole = 'admin' | 'supervisor' | 'user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
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

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('granted_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        return { data: null, error };
      }
      
      setRole(data?.role || null);
      return { data: data?.role || null, error: null };
    } catch (error: any) {
      console.error('Error fetching user role:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Fetch profile and role without blocking
          setTimeout(() => {
            if (mounted) {
              fetchProfile(currentSession.user.id);
              fetchUserRole(currentSession.user.id);
            }
          }, 0);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitializing(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change in useAuth hook:', event);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
              fetchUserRole(session.user.id);
            }
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        
        setLoading(false);
        setInitializing(false);
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    
    if (result.error) {
      toast({
        title: 'Erro no login',
        description: result.error.message,
        variant: 'destructive',
      });
    }
    
    return result;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    
    if (result.error) {
      toast({
        title: 'Erro no cadastro',
        description: result.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Cadastro realizado',
        description: 'Verifique seu email para confirmar a conta.',
      });
    }
    
    return result;
  };

  const signOut = async () => {
    const result = await supabase.auth.signOut();
    
    if (result.error) {
      toast({
        title: 'Erro ao sair',
        description: result.error.message,
        variant: 'destructive',
      });
    }
    
    return result;
  };

  const resetPassword = async (email: string) => {
    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (result.error) {
      toast({
        title: 'Erro',
        description: result.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Email enviado',
        description: 'Verifique seu email para redefinir a senha.',
      });
    }
    
    return result;
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    return role === requiredRole;
  };

  const isAdmin = (): boolean => {
    return role === 'admin';
  };

  const isSupervisor = (): boolean => {
    return role === 'supervisor' || role === 'admin';
  };

  return {
    user,
    session,
    profile,
    role,
    loading,
    initializing,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile: () => user && fetchProfile(user.id),
    refreshRole: () => user && fetchUserRole(user.id),
    isAuthenticated: !!session,
    userRole: role,
    hasRole,
    isAdmin,
    isSupervisor,
  };
};
