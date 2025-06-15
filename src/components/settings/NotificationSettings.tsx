
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface NotificationPreferences {
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
  const [settings, setSettings] = useState<NotificationPreferences>({
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
  const [testingNotification, setTestingNotification] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Using raw SQL query since the table is not in the generated types yet
      const { data, error } = await supabase
        .rpc('exec_sql', { 
          sql: `SELECT * FROM notification_preferences WHERE user_id = '${userData.user.id}'`
        });

      if (error && error.message !== 'No rows returned') {
        console.error('Error loading notification settings:', error);
        return;
      }

      if (data && data.length > 0) {
        const preferences = data[0];
        setSettings({
          email_appointments: preferences.email_appointments,
          email_results: preferences.email_results,
          email_marketing: preferences.email_marketing,
          push_appointments: preferences.push_appointments,
          push_reminders: preferences.push_reminders,
          push_results: preferences.push_results,
          sms_reminders: preferences.sms_reminders,
          in_app_notifications: preferences.in_app_notifications,
          digest_frequency: preferences.digest_frequency
        });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleToggle = (setting: keyof NotificationPreferences) => {
    setSettings(prev => ({
      ...prev,
      [setting]: typeof prev[setting] === 'boolean' ? !prev[setting] : prev[setting]
    }));
  };

  const handleDigestFrequencyChange = (frequency: 'immediate' | 'daily' | 'weekly' | 'never') => {
    setSettings(prev => ({
      ...prev,
      digest_frequency: frequency
    }));
  };

  const testNotification = async () => {
    setTestingNotification(true);
    try {
      // Simular envio de notificação de teste
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Notificação de teste enviada!",
        description: "Verifique seus canais de notificação configurados."
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Não foi possível enviar a notificação de teste.",
        variant: "destructive"
      });
    } finally {
      setTestingNotification(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Using raw SQL query to insert/update since the table is not in generated types yet
      const settingsData = {
        user_id: userData.user.id,
        ...settings
      };

      const { error } = await supabase
        .rpc('exec_sql', { 
          sql: `
            INSERT INTO notification_preferences (
              user_id, email_appointments, email_results, email_marketing, 
              push_appointments, push_reminders, push_results, sms_reminders, 
              in_app_notifications, digest_frequency
            ) VALUES (
              '${settingsData.user_id}', 
              ${settingsData.email_appointments}, 
              ${settingsData.email_results}, 
              ${settingsData.email_marketing},
              ${settingsData.push_appointments}, 
              ${settingsData.push_reminders}, 
              ${settingsData.push_results}, 
              ${settingsData.sms_reminders},
              ${settingsData.in_app_notifications}, 
              '${settingsData.digest_frequency}'
            )
            ON CONFLICT (user_id) DO UPDATE SET
              email_appointments = EXCLUDED.email_appointments,
              email_results = EXCLUDED.email_results,
              email_marketing = EXCLUDED.email_marketing,
              push_appointments = EXCLUDED.push_appointments,
              push_reminders = EXCLUDED.push_reminders,
              push_results = EXCLUDED.push_results,
              sms_reminders = EXCLUDED.sms_reminders,
              in_app_notifications = EXCLUDED.in_app_notifications,
              digest_frequency = EXCLUDED.digest_frequency,
              updated_at = now()
          `
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
      <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-300">
            Configure como deseja receber notificações do sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Notificações por Email
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailAppointments" className="text-neutral-900 dark:text-neutral-100">
                    Novos Agendamentos
                  </Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Receba emails quando novos agendamentos forem criados
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
                    Resultados Disponíveis
                  </Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Receba emails quando novos resultados estiverem disponíveis
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
                    Materiais Educativos
                  </Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Receba emails com conteúdo educativo e promoções
                  </p>
                </div>
                <Switch 
                  id="emailMarketing"
                  checked={settings.email_marketing}
                  onCheckedChange={() => handleToggle('email_marketing')}
                />
              </div>
            </div>
          </div>
          
          {/* Push Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Notificações Push
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pushAppointments" className="text-neutral-900 dark:text-neutral-100">
                    Novos Agendamentos
                  </Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Receba notificações quando novos agendamentos forem criados
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
                    Lembretes de Agendamentos
                  </Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Receba lembretes de agendamentos próximos
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
                    Resultados Disponíveis
                  </Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Receba notificações quando novos resultados estiverem disponíveis
                  </p>
                </div>
                <Switch 
                  id="pushResults"
                  checked={settings.push_results}
                  onCheckedChange={() => handleToggle('push_results')}
                />
              </div>
            </div>
          </div>
          
          {/* SMS and Other */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Outras Notificações
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smsReminders" className="text-neutral-900 dark:text-neutral-100">
                    SMS - Lembretes
                  </Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Receba lembretes de agendamentos por SMS
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
                    Receba notificações dentro do aplicativo
                  </p>
                </div>
                <Switch 
                  id="inAppNotifications"
                  checked={settings.in_app_notifications}
                  onCheckedChange={() => handleToggle('in_app_notifications')}
                />
              </div>
            </div>
          </div>

          {/* Digest Frequency */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Frequência do Resumo
            </h3>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'immediate', label: 'Imediato' },
                { value: 'daily', label: 'Diário' },
                { value: 'weekly', label: 'Semanal' },
                { value: 'never', label: 'Nunca' }
              ].map((option) => (
                <Badge
                  key={option.value}
                  variant={settings.digest_frequency === option.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleDigestFrequencyChange(option.value as any)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <Button 
            variant="outline"
            onClick={testNotification}
            disabled={testingNotification}
            className="border-neutral-300 dark:border-neutral-600"
          >
            {testingNotification ? "Enviando..." : "Testar Notificação"}
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {loading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotificationSettings;
