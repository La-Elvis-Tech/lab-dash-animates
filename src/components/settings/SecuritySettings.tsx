
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";

const SecuritySettings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: true,
    accessLogs: true
  });
  
  const { toast } = useToast();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 8 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would typically send data to an API
    toast({
      title: "Senha atualizada",
      description: "Sua senha foi alterada com sucesso."
    });
    
    // Clear form
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSaveSettings = () => {
    // Here you would typically send data to an API
    toast({
      title: "Configurações salvas",
      description: "Suas configurações de segurança foram atualizadas."
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Atualize sua senha de acesso ao sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <div className="relative">
              <Input 
                id="currentPassword"
                name="currentPassword"
                type={showPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Digite sua senha atual"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 px-2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input 
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Digite a nova senha"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirme a Nova Senha</Label>
            <Input 
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirme a nova senha"
            />
          </div>
        </CardContent>
        
        <CardFooter className="justify-end">
          <Button 
            onClick={handleChangePassword}
            className="bg-gradient-to-r from-gray-800 to-gray-600 hover:opacity-90 dark:from-white dark:to-gray-100 transition-colors duration-400 dark:hover:from-gray-200 dark:hover:to-gray-300"
          >
            Alterar Senha
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            Segurança da Conta
          </CardTitle>
          <CardDescription>
            Configure opções de segurança adicionais
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="twoFactorAuth">Autenticação em Dois Fatores</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ative a verificação em duas etapas para mais segurança
              </p>
            </div>
            <Switch 
              id="twoFactorAuth"
              checked={settings.twoFactorAuth}
              onCheckedChange={() => handleToggle('twoFactorAuth')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sessionTimeout">Timeout de Sessão</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Encerre automaticamente sessões inativas após 30 minutos
              </p>
            </div>
            <Switch 
              id="sessionTimeout"
              checked={settings.sessionTimeout}
              onCheckedChange={() => handleToggle('sessionTimeout')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="accessLogs">Registro de Acessos</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Mantenha um registro de todos os acessos à sua conta
              </p>
            </div>
            <Switch 
              id="accessLogs"
              checked={settings.accessLogs}
              onCheckedChange={() => handleToggle('accessLogs')}
            />
          </div>
        </CardContent>
        
        <CardFooter className="justify-end border-t border-gray-100 dark:border-gray-700 pt-4">
          <Button 
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-gray-800 to-gray-600 hover:opacity-90 dark:from-white dark:to-gray-100 transition-colors duration-400 dark:hover:from-gray-200 dark:hover:to-gray-300"
          >
            Salvar Configurações
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SecuritySettings;
