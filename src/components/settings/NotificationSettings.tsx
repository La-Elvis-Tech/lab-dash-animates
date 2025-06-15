
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';

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
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_appointments: true,
    email_results: true,
    email_marketing: false,
    push_appointments: true,
    push_reminders: true,
    push_results: false,
    sms_reminders: false,
    in_app_notifications: true,
    digest_frequency: 'daily',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useUserProfile();

  useEffect(() => {
    // Carregar preferências do localStorage por enquanto
    const saved = localStorage.getItem('notification_preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Salvar no localStorage por enquanto
      localStorage.setItem('notification_preferences', JSON.stringify(preferences));
      
      toast({
        title: 'Preferências salvas',
        description: 'Suas configurações de notificação foram atualizadas.',
      });
    } catch (error: any) {
      console.error('Erro ao salvar preferências:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as preferências.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações de Notificação</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure como você deseja receber notificações do sistema
          {profile?.unit?.name && ` para a unidade ${profile.unit.name}`}
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações por Email</CardTitle>
          <CardDescription>Configure quais emails você deseja receber</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-appointments">Confirmações de Agendamento</Label>
            <Switch
              id="email-appointments"
              checked={preferences.email_appointments}
              onCheckedChange={(checked) => updatePreference('email_appointments', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="email-results">Resultados de Exames</Label>
            <Switch
              id="email-results"
              checked={preferences.email_results}
              onCheckedChange={(checked) => updatePreference('email_results', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="email-marketing">Novidades e Promoções</Label>
            <Switch
              id="email-marketing"
              checked={preferences.email_marketing}
              onCheckedChange={(checked) => updatePreference('email_marketing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações Push</CardTitle>
          <CardDescription>Configure as notificações do navegador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-appointments">Lembretes de Agendamento</Label>
            <Switch
              id="push-appointments"
              checked={preferences.push_appointments}
              onCheckedChange={(checked) => updatePreference('push_appointments', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="push-reminders">Lembretes de Preparação</Label>
            <Switch
              id="push-reminders"
              checked={preferences.push_reminders}
              onCheckedChange={(checked) => updatePreference('push_reminders', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="push-results">Resultados Disponíveis</Label>
            <Switch
              id="push-results"
              checked={preferences.push_results}
              onCheckedChange={(checked) => updatePreference('push_results', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS and Other */}
      <Card>
        <CardHeader>
          <CardTitle>Outras Notificações</CardTitle>
          <CardDescription>Configure SMS e notificações no app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-reminders">SMS de Lembretes</Label>
            <Switch
              id="sms-reminders"
              checked={preferences.sms_reminders}
              onCheckedChange={(checked) => updatePreference('sms_reminders', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="in-app">Notificações no App</Label>
            <Switch
              id="in-app"
              checked={preferences.in_app_notifications}
              onCheckedChange={(checked) => updatePreference('in_app_notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="digest-frequency">Frequência do Resumo</Label>
            <Select
              value={preferences.digest_frequency}
              onValueChange={(value) => updatePreference('digest_frequency', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Imediato</SelectItem>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="never">Nunca</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
