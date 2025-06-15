
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AlertData {
  type: 'stock' | 'expiry' | 'prediction';
  title: string;
  description: string;
  item: string;
  priority: 'critical' | 'high' | 'medium';
  currentStock?: number;
  minStock?: number;
  unit?: string;
  expiryDate?: string;
  lot?: string;
  predictedDate?: string;
}

export const useEmailAlerts = () => {
  const { toast } = useToast();

  const sendAlertEmail = async (alertData: AlertData, adminEmail = 'admin@dasalabs.com') => {
    try {
      console.log('Enviando alerta por email via edge function:', alertData);
      
      const { data, error } = await supabase.functions.invoke('send-alert-email', {
        body: {
          ...alertData,
          adminEmail
        }
      });

      if (error) throw error;

      toast({
        title: 'Alerta enviado por email',
        description: `Alerta sobre ${alertData.item} foi enviado para ${adminEmail}`,
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao enviar alerta por email:', error);
      toast({
        title: 'Erro ao enviar email',
        description: 'Não foi possível enviar o alerta por email.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return { sendAlertEmail };
};
