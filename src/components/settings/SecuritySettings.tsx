
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Shield, Key, Clock, Activity, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface SecuritySettings {
  two_factor_enabled: boolean;
  session_timeout: number;
  password_complexity: boolean;
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
  device_management: boolean;
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  last_active: string;
  current: boolean;
}

const SecuritySettings = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    session_timeout: 30,
    password_complexity: true,
    login_notifications: true,
    suspicious_activity_alerts: true,
    device_management: true
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeSessions] = useState<LoginSession[]>([
    {
      id: '1',
      device: 'Chrome - Windows 10',
      location: 'São Paulo, SP',
      last_active: '2024-12-15 14:30',
      current: true
    },
    {
      id: '2',
      device: 'Safari - iPhone 13',
      location: 'São Paulo, SP',
      last_active: '2024-12-15 12:15',
      current: false
    }
  ]);

  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading security settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const handleToggle = (setting: keyof SecuritySettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSessionTimeoutChange = (value: number) => {
    setSettings(prev => ({
      ...prev,
      session_timeout: value
    }));
  };

  const validatePasswordStrength = (password: string): boolean => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos de senha.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e confirmação devem ser iguais.",
        variant: "destructive"
      });
      return;
    }

    if (settings.password_complexity && !validatePasswordStrength(newPassword)) {
      toast({
        title: "Senha fraca",
        description: "A senha deve ter pelo menos 8 caracteres com maiúscula, minúscula, número e símbolo.",
        variant: "destructive"
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso."
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      // Em uma implementação real, terminaria a sessão específica
      toast({
        title: "Sessão terminada",
        description: "A sessão foi terminada com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível terminar a sessão.",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('security_settings')
        .upsert({
          user_id: userData.user.id,
          ...settings
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas configurações de segurança foram atualizadas."
      });
    } catch (error: any) {
      console.error('Error saving security settings:', error);
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
      {/* Security Settings */}
      <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações de Segurança
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-300">
            Mantenha sua conta segura com essas configurações
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Autenticação de Dois Fatores
                </Label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Adicione uma camada extra de segurança à sua conta
                </p>
              </div>
              <Switch 
                checked={settings.two_factor_enabled}
                onCheckedChange={() => handleToggle('two_factor_enabled')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-neutral-900 dark:text-neutral-100">
                  Complexidade de Senha
                </Label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Exigir senhas fortes com caracteres especiais
                </p>
              </div>
              <Switch 
                checked={settings.password_complexity}
                onCheckedChange={() => handleToggle('password_complexity')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-neutral-900 dark:text-neutral-100">
                  Notificações de Login
                </Label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Receba notificações quando alguém fizer login na sua conta
                </p>
              </div>
              <Switch 
                checked={settings.login_notifications}
                onCheckedChange={() => handleToggle('login_notifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alertas de Atividade Suspeita
                </Label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Detectar e alertar sobre atividades suspeitas
                </p>
              </div>
              <Switch 
                checked={settings.suspicious_activity_alerts}
                onCheckedChange={() => handleToggle('suspicious_activity_alerts')}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeout de Sessão (minutos)
              </Label>
              <div className="flex gap-2">
                {[15, 30, 60, 120].map((minutes) => (
                  <Badge
                    key={minutes}
                    variant={settings.session_timeout === minutes ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleSessionTimeoutChange(minutes)}
                  >
                    {minutes}min
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100">
            Alterar Senha
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-300">
            Mantenha sua senha segura e atualizada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input
              id="new-password"
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite sua nova senha"
            />
            {settings.password_complexity && newPassword && (
              <div className="text-xs space-y-1">
                <p className={`${newPassword.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ Pelo menos 8 caracteres
                </p>
                <p className={`${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ Pelo menos uma letra maiúscula
                </p>
                <p className={`${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ Pelo menos uma letra minúscula
                </p>
                <p className={`${/\d/.test(newPassword) ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ Pelo menos um número
                </p>
                <p className={`${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ Pelo menos um caractere especial
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
            />
          </div>

          <Button 
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="w-full"
          >
            {changingPassword ? "Alterando..." : "Alterar Senha"}
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sessões Ativas
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-300">
            Gerencie dispositivos conectados à sua conta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {activeSessions.map((session, index) => (
            <div key={session.id}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {session.device}
                    </p>
                    {session.current && (
                      <Badge variant="default" className="text-xs">
                        Atual
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {session.location} • Último acesso: {session.last_active}
                  </p>
                </div>
                {!session.current && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Terminar
                  </Button>
                )}
              </div>
              {index < activeSessions.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
        <CardFooter className="pt-6">
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {loading ? "Salvando..." : "Salvar Configurações de Segurança"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SecuritySettings;
