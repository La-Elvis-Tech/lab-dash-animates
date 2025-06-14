
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  used_by?: string;
  max_uses: number;
  current_uses: number;
  expires_at?: string;
  is_active: boolean;
  role: 'admin' | 'user' | 'supervisor';
  metadata: any;
  created_at: string;
  used_at?: string;
}

export const useInviteCodes = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateInviteCode = async (code: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('validate_invite_code', {
        p_code: code
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error validating invite code:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível validar o código de convite.',
        variant: 'destructive',
      });
      return { valid: false, message: 'Erro interno' };
    } finally {
      setLoading(false);
    }
  };

  const useInviteCode = async (code: string, userId: string) => {
    try {
      const { data, error } = await supabase.rpc('use_invite_code', {
        p_code: code,
        p_user_id: userId
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error using invite code:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível usar o código de convite.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const generateInviteCode = async (
    role: 'admin' | 'user' | 'supervisor' = 'user',
    maxUses: number = 1,
    expiresHours: number = 168
  ) => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('generate_invite_code', {
        p_created_by: userData.user.id,
        p_role: role,
        p_max_uses: maxUses,
        p_expires_hours: expiresHours
      });

      if (error) throw error;

      // Enviar código por email ao administrador
      try {
        await supabase.functions.invoke('send-invite-email', {
          body: {
            code: data,
            role: role,
            maxUses: maxUses,
            expiresHours: expiresHours,
            adminEmail: 'admin@dasalabs.com'
          }
        });

        toast({
          title: 'Código gerado e enviado!',
          description: 'O código de convite foi enviado para o administrador.',
        });
      } catch (emailError) {
        console.warn('Falha ao enviar email, exibindo código localmente:', emailError);
        // Fallback: mostrar código se email falhar
        toast({
          title: 'Código gerado!',
          description: `Código de convite: ${data}`,
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error generating invite code:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível gerar o código de convite.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchInviteCodes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error fetching invite codes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os códigos de convite.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    validateInviteCode,
    useInviteCode,
    generateInviteCode,
    fetchInviteCodes,
  };
};
