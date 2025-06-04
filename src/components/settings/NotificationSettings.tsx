
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
    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
          Notificações
        </CardTitle>
        <CardDescription>
          Configure como deseja receber notificações do sistema
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notificações por Email</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailAppointments">Novos Agendamentos</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <Label htmlFor="emailResults">Resultados Disponíveis</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <Label htmlFor="emailMarketing">Materiais Educativos</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
          <h3 className="text-lg font-medium">Notificações Push</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushNewAppointments">Novos Agendamentos</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <Label htmlFor="pushAppointmentReminders">Lembretes de Agendamentos</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <Label htmlFor="pushResultsAvailable">Resultados Disponíveis</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
          <h3 className="text-lg font-medium">Notificações SMS</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smsAppointmentReminders">Lembretes de Agendamentos</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
      
      <CardFooter className="flex justify-end border-t border-gray-100 dark:border-gray-700 pt-4">
        <Button 
          onClick={handleSave}
          className="bg-gradient-to-r from-gray-800 to-gray-600 hover:opacity-90 dark:from-white dark:to-gray-100 transition-colors duration-400 dark:hover:from-gray-200 dark:hover:to-gray-300"
        >
          Salvar Configurações
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;
