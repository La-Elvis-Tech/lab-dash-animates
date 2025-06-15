
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  department?: string;
  unit_id?: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface UserRole {
  role: 'admin' | 'user' | 'supervisor';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          setTimeout(async () => {
            if (mounted) {
              await fetchUserData(session.user.id);
            }
          }, 0);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setUserRole(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        fetchUserData(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const [profileResult, roleResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_roles').select('role').eq('user_id', userId).order('role').limit(1)
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      if (roleResult.data && roleResult.data.length > 0) {
        setUserRole({ role: roleResult.data[0].role });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('status, full_name')
      .eq('email', email)
      .single();

    if (!profileData) {
      throw new Error('Usuário não encontrado no sistema.');
    }

    if (profileData.status === 'pending') {
      throw new Error('Sua conta ainda está pendente de aprovação. Aguarde a aprovação de um administrador.');
    }

    if (profileData.status === 'inactive') {
      throw new Error('Sua conta foi desativada. Entre em contato com um administrador.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `https://laelvistech.netlify.app/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRole(null);
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (profileError || !profileData) {
      throw new Error('Email não encontrado no sistema.');
    }

    const redirectUrl = `https://laelvistech.netlify.app/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    return { error };
  };

  const hasRole = (role: 'admin' | 'user' | 'supervisor'): boolean => {
    return userRole?.role === role;
  };

  return {
    user,
    session,
    profile,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    hasRole,
    isAdmin: () => hasRole('admin'),
    isSupervisor: () => hasRole('supervisor') || hasRole('admin'),
    isAuthenticated: !!user && !!session,
  };
};
