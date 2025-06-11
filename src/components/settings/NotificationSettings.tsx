
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailAppointments: true,
    emailResults: true,
    emailMarketing: false,
    pushNewAppointments: true,
    pushAppointmentReminders: true,
    pushResultsAvailable: true,
    smsAppointmentReminders: false
  });
  
  const { toast } = useToast();

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSave = () => {
    // Here you would typically send data to an API
    toast({
      title: "Configurações salvas",
      description: "Suas preferências de notificação foram atualizadas."
    });
  };

  return (
    <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100">
          Notificações
        </CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-300">
          Configure como deseja receber notificações do sistema
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Notificações por Email</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailAppointments" className="text-neutral-900 dark:text-neutral-100">Novos Agendamentos</Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Receba emails quando novos agendamentos forem criados
              </p>
            </div>
            <Switch 
              id="emailAppointments"
              checked={settings.emailAppointments}
              onCheckedChange={() => handleToggle('emailAppointments')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailResults" className="text-neutral-900 dark:text-neutral-100">Resultados Disponíveis</Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Receba emails quando novos resultados estiverem disponíveis
              </p>
            </div>
            <Switch 
              id="emailResults"
              checked={settings.emailResults}
              onCheckedChange={() => handleToggle('emailResults')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailMarketing" className="text-neutral-900 dark:text-neutral-100">Materiais Educativos</Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Receba emails com conteúdo educativo e promoções
              </p>
            </div>
            <Switch 
              id="emailMarketing"
              checked={settings.emailMarketing}
              onCheckedChange={() => handleToggle('emailMarketing')}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Notificações Push</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushNewAppointments" className="text-neutral-900 dark:text-neutral-100">Novos Agendamentos</Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Receba notificações quando novos agendamentos forem criados
              </p>
            </div>
            <Switch 
              id="pushNewAppointments"
              checked={settings.pushNewAppointments}
              onCheckedChange={() => handleToggle('pushNewAppointments')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushAppointmentReminders" className="text-neutral-900 dark:text-neutral-100">Lembretes de Agendamentos</Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Receba lembretes de agendamentos próximos
              </p>
            </div>
            <Switch 
              id="pushAppointmentReminders"
              checked={settings.pushAppointmentReminders}
              onCheckedChange={() => handleToggle('pushAppointmentReminders')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushResultsAvailable" className="text-neutral-900 dark:text-neutral-100">Resultados Disponíveis</Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Receba notificações quando novos resultados estiverem disponíveis
              </p>
            </div>
            <Switch 
              id="pushResultsAvailable"
              checked={settings.pushResultsAvailable}
              onCheckedChange={() => handleToggle('pushResultsAvailable')}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Notificações SMS</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smsAppointmentReminders" className="text-neutral-900 dark:text-neutral-100">Lembretes de Agendamentos</Label>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Receba lembretes de agendamentos por SMS
              </p>
            </div>
            <Switch 
              id="smsAppointmentReminders"
              checked={settings.smsAppointmentReminders}
              onCheckedChange={() => handleToggle('smsAppointmentReminders')}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <Button 
          onClick={handleSave}
          className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Salvar Configurações
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;
