
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

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile and role fetching
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
            await fetchUserRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
        }
        
        setLoading(false);
        setInitializing(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserRole(session.user.id);
      }
      
      setLoading(false);
      setInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role')
        .limit(1);

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      if (data && data.length > 0) {
        setUserRole({ role: data[0].role });
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
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

  const signIn = async (email: string, password: string) => {
    // Verificar se o usuário está ativo antes de fazer login
    const { data: profileData } = await supabase
      .from('profiles')
      .select('status')
      .eq('email', email)
      .single();

    if (profileData && profileData.status === 'pending') {
      throw new Error('Sua conta ainda está pendente de aprovação. Aguarde a aprovação de um administrador.');
    }

    if (profileData && profileData.status === 'inactive') {
      throw new Error('Sua conta foi desativada. Entre em contato com um administrador.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
    // Verificar se o email existe no banco de dados antes de enviar
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

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }

    return { data, error };
  };

  const hasRole = (role: 'admin' | 'user' | 'supervisor'): boolean => {
    return userRole?.role === role;
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isSupervisor = (): boolean => hasRole('supervisor') || hasRole('admin');

  return {
    user,
    session,
    profile,
    userRole,
    loading,
    initializing,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    hasRole,
    isAdmin,
    isSupervisor,
    isAuthenticated: !!user,
  };
};
