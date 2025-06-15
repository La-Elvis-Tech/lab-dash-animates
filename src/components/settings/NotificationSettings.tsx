
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  email_appointments: boolean;
  email_results: boolean;
  email_marketing: boolean;
  push_appointments: boolean;
  push_reminders: boolean;
  push_results: boolean;
  sms_reminders: boolean;
  in_app_notifications: boolean;
  digest_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_appointments: true,
    email_results: true,
    email_marketing: false,
    push_appointments: true,
    push_reminders: true,
    push_results: true,
    sms_reminders: false,
    in_app_notifications: true,
    digest_frequency: 'daily'
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Use raw SQL query since the table might not be in types yet
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading notification settings:', error);
        return;
      }

      if (data) {
        setSettings({
          email_appointments: data.email_appointments,
          email_results: data.email_results,
          email_marketing: data.email_marketing,
          push_appointments: data.push_appointments,
          push_reminders: data.push_reminders,
          push_results: data.push_results,
          sms_reminders: data.sms_reminders,
          in_app_notifications: data.in_app_notifications,
          digest_frequency: data.digest_frequency
        });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleToggle = (setting: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: typeof prev[setting] === 'boolean' ? !prev[setting] : prev[setting]
    }));
  };

  const handleDigestFrequencyChange = (value: 'immediate' | 'daily' | 'weekly' | 'never') => {
    setSettings(prev => ({
      ...prev,
      digest_frequency: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userData.user.id,
          ...settings
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas."
      });
    } catch (error: any) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notificações por Email
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-300">
            Configure quais eventos devem gerar notificações por email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailAppointments" className="text-neutral-900 dark:text-neutral-100">
                Agendamentos
              </Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Receba emails sobre novos agendamentos e alterações
              </p>
            </div>
            <Switch 
              id="emailAppointments"
              checked={settings.email_appointments}
              onCheckedChange={() => handleToggle('email_appointments')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailResults" className="text-neutral-900 dark:text-neutral-100">
                Resultados
              </Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Notificações quando resultados estiverem prontos
              </p>
            </div>
            <Switch 
              id="emailResults"
              checked={settings.email_results}
              onCheckedChange={() => handleToggle('email_results')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailMarketing" className="text-neutral-900 dark:text-neutral-100">
                Comunicações Promocionais
              </Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Ofertas, novidades e comunicações de marketing
              </p>
            </div>
            <Switch 
              id="emailMarketing"
              checked={settings.email_marketing}
              onCheckedChange={() => handleToggle('email_marketing')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-300">
            Configure notificações push no navegador e dispositivos móveis
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushAppointments" className="text-neutral-900 dark:text-neutral-100">
                Agendamentos
              </Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Alertas instantâneos sobre agendamentos
              </p>
            </div>
            <Switch 
              id="pushAppointments"
              checked={settings.push_appointments}
              onCheckedChange={() => handleToggle('push_appointments')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushReminders" className="text-neutral-900 dark:text-neutral-100">
                Lembretes
              </Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Lembretes de exames e procedimentos
              </p>
            </div>
            <Switch 
              id="pushReminders"
              checked={settings.push_reminders}
              onCheckedChange={() => handleToggle('push_reminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushResults" className="text-neutral-900 dark:text-neutral-100">
                Resultados
              </Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Quando resultados estiverem disponíveis
              </p>
            </div>
            <Switch 
              id="pushResults"
              checked={settings.push_results}
              onCheckedChange={() => handleToggle('push_results')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações Adicionais
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smsReminders" className="text-neutral-900 dark:text-neutral-100">
                SMS Lembretes
              </Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Receber lembretes via SMS
              </p>
            </div>
            <Switch 
              id="smsReminders"
              checked={settings.sms_reminders}
              onCheckedChange={() => handleToggle('sms_reminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inAppNotifications" className="text-neutral-900 dark:text-neutral-100">
                Notificações no App
              </Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Mostrar notificações dentro do aplicativo
              </p>
            </div>
            <Switch 
              id="inAppNotifications"
              checked={settings.in_app_notifications}
              onCheckedChange={() => handleToggle('in_app_notifications')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="digestFrequency" className="text-neutral-900 dark:text-neutral-100">
              Frequência do Resumo
            </Label>
            <Select value={settings.digest_frequency} onValueChange={handleDigestFrequencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Imediato</SelectItem>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="never">Nunca</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Com que frequência você quer receber resumos de atividades
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {loading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotificationSettings;
