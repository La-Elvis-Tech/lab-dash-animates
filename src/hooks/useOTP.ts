
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOTP = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateOTP = async (email: string, type: 'login' | 'signup' | 'password_reset' = 'login') => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('generate_otp_code', {
        p_email: email,
        p_type: type
      });

      if (error) throw error;

      // Enviar código por email através da edge function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-otp-email', {
          body: {
            code: data,
            userEmail: email,
            adminEmail: 'admin@dasalabs.com',
            type: type
          }
        });

        if (emailError) throw emailError;

        toast({
          title: 'Código OTP enviado!',
          description: 'O código de verificação foi enviado para o administrador.',
        });
      } catch (emailError) {
        console.warn('Falha ao enviar email, exibindo código localmente:', emailError);
        toast({
          title: 'Código OTP gerado!',
          description: `Código: ${data} (válido por 10 minutos)`,
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error generating OTP:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o código OTP.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email: string, code: string, type: 'login' | 'signup' | 'password_reset' = 'login') => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('verify_otp_code', {
        p_email: email,
        p_code: code,
        p_type: type
      });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Código verificado!',
          description: 'OTP validado com sucesso.',
        });
      } else {
        toast({
          title: 'Código inválido',
          description: 'Verifique o código e tente novamente.',
          variant: 'destructive',
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar o código OTP.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateOTP,
    verifyOTP,
  };
};
