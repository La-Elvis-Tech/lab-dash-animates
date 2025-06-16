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

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return { data: null, error };
      }
      
      if (data) {
        const mappedProfile: Profile = {
          ...data,
          status: data.status === 'inactive' ? 'suspended' : data.status
        };
        
        setProfile(mappedProfile);
        return { data: mappedProfile, error: null };
      }
      
      return { data: null, error: null };
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
      
      const userRole = data?.role || 'user';
      setRole(userRole);
      return { data: userRole, error: null };
    } catch (error: any) {
      console.error('Error fetching user role:', error);
      return { data: null, error };
    }
  };

  const checkUserAccess = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('status, full_name')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.log(`[AUTH] Perfil não encontrado para usuário: ${userId}`);
        await supabase.auth.signOut();
        return false;
      }

      if (data.status === 'pending') {
        console.log(`[AUTH] Acesso negado - conta pendente: ${userId}`);
        toast({
          title: 'Conta Pendente',
          description: 'Sua conta ainda está pendente de aprovação. Aguarde a aprovação de um administrador.',
          variant: 'destructive',
        });
        await supabase.auth.signOut();
        return false;
      }

      if (data.status === 'inactive' || data.status === 'suspended') {
        console.log(`[AUTH] Acesso negado - conta desativada: ${userId}`);
        toast({
          title: 'Conta Desativada',
          description: 'Sua conta foi desativada. Entre em contato com um administrador.',
          variant: 'destructive',
        });
        await supabase.auth.signOut();
        return false;
      }

      return data.status === 'active';
    } catch (error: any) {
      console.error('Error checking user access:', error);
      await supabase.auth.signOut();
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change:', event, session?.user?.email);
            
            if (!mounted) return;

            if (session?.user) {
              // Verificar acesso do usuário antes de definir a sessão
              const hasAccess = await checkUserAccess(session.user.id);
              
              if (hasAccess && mounted) {
                setSession(session);
                setUser(session.user);
                
                setTimeout(async () => {
                  if (mounted) {
                    await fetchProfile(session.user.id);
                    await fetchUserRole(session.user.id);
                  }
                }, 0);
              } else {
                // Se não tem acesso, limpar estado
                setSession(null);
                setUser(null);
                setProfile(null);
                setRole(null);
              }
            } else {
              setSession(session);
              setUser(session?.user ?? null);
              setProfile(null);
              setRole(null);
            }
            
            setLoading(false);
            setInitializing(false);
          }
        );

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession?.user) {
          const hasAccess = await checkUserAccess(currentSession.user.id);
          
          if (hasAccess && mounted) {
            setSession(currentSession);
            setUser(currentSession.user);
            
            setTimeout(async () => {
              if (mounted) {
                await fetchProfile(currentSession.user.id);
                await fetchUserRole(currentSession.user.id);
              }
            }, 0);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
            setRole(null);
          }
        } else {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
        
        setLoading(false);
        setInitializing(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Verificar status do usuário ANTES do login
      const { data: profileData } = await supabase
        .from('profiles')
        .select('status, full_name')
        .eq('email', email)
        .single();

      if (!profileData) {
        const errorMsg = 'Usuário não encontrado no sistema.';
        toast({
          title: 'Erro no login',
          description: errorMsg,
          variant: 'destructive',
        });
        return { data: null, error: { message: errorMsg } };
      }

      if (profileData.status === 'pending') {
        const errorMsg = 'Sua conta ainda está pendente de aprovação. Aguarde a aprovação de um administrador.';
        toast({
          title: 'Conta Pendente',
          description: errorMsg,
          variant: 'destructive',
        });
        return { data: null, error: { message: errorMsg } };
      }

      if (profileData.status === 'inactive' || profileData.status === 'suspended') {
        const errorMsg = 'Sua conta foi desativada. Entre em contato com um administrador.';
        toast({
          title: 'Conta Desativada',
          description: errorMsg,
          variant: 'destructive',
        });
        return { data: null, error: { message: errorMsg } };
      }

      // Só permite login se status for 'active'
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: 'Erro no login',
          description: error.message,
          variant: 'destructive',
        });
        return { data: null, error };
      }

      console.log('Sign in successful:', data.user?.email);
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in catch error:', error);
      toast({
        title: 'Erro no login',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: 'Erro no cadastro',
          description: error.message,
          variant: 'destructive',
        });
        return { data: null, error };
      }

      console.log('Sign up successful:', data.user?.email);
      toast({
        title: 'Cadastro realizado',
        description: 'Verifique seu email para confirmar a conta.',
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up catch error:', error);
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: 'Erro ao sair',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      console.log('Sign out successful');
      return { error: null };
    } catch (error: any) {
      console.error('Sign out catch error:', error);
      toast({
        title: 'Erro ao sair',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('Reset password error:', error);
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      console.log('Reset password email sent');
      toast({
        title: 'Email enviado',
        description: 'Verifique seu email para redefinir a senha.',
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Reset password catch error:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive',
      });
      return { error };
    }
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
    isAuthenticated: !!session && !!user && profile?.status === 'active',
    userRole: role,
    hasRole,
    isAdmin,
    isSupervisor,
  };
};
