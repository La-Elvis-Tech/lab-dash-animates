
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Clock, AlertTriangle, Smartphone } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface SecuritySettings {
  two_factor_enabled: boolean;
  session_timeout_minutes: number;
  login_alerts: boolean;
  password_changed_at?: string;
  last_password_check?: string;
  failed_login_attempts: number;
}

const SecuritySettings = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    session_timeout_minutes: 480,
    login_alerts: true,
    failed_login_attempts: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Using raw SQL query since the table is not in the generated types yet
      const { data, error } = await supabase
        .rpc('exec_sql', { 
          sql: `SELECT * FROM security_settings WHERE user_id = '${userData.user.id}'`
        });

      if (error && error.message !== 'No rows returned') {
        console.error('Error loading security settings:', error);
        return;
      }

      if (data && data.length > 0) {
        const securityData = data[0];
        setSettings({
          two_factor_enabled: securityData.two_factor_enabled,
          session_timeout_minutes: securityData.session_timeout_minutes,
          login_alerts: securityData.login_alerts,
          password_changed_at: securityData.password_changed_at,
          last_password_check: securityData.last_password_check,
          failed_login_attempts: securityData.failed_login_attempts
        });
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const handleToggle = (setting: keyof SecuritySettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: typeof prev[setting] === 'boolean' ? !prev[setting] : prev[setting]
    }));
  };

  const handleSessionTimeoutChange = (value: string) => {
    const timeout = parseInt(value);
    if (!isNaN(timeout) && timeout > 0) {
      setSettings(prev => ({
        ...prev,
        session_timeout_minutes: timeout
      }));
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
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

      // Update password changed timestamp
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase
          .rpc('exec_sql', { 
            sql: `
              INSERT INTO security_settings (user_id, password_changed_at) 
              VALUES ('${userData.user.id}', now())
              ON CONFLICT (user_id) DO UPDATE SET 
                password_changed_at = now(),
                updated_at = now()
            `
          });
      }

      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const settingsData = {
        user_id: userData.user.id,
        ...settings
      };

      const { error } = await supabase
        .rpc('exec_sql', { 
          sql: `
            INSERT INTO security_settings (
              user_id, two_factor_enabled, session_timeout_minutes, login_alerts
            ) VALUES (
              '${settingsData.user_id}', 
              ${settingsData.two_factor_enabled}, 
              ${settingsData.session_timeout_minutes}, 
              ${settingsData.login_alerts}
            )
            ON CONFLICT (user_id) DO UPDATE SET
              two_factor_enabled = EXCLUDED.two_factor_enabled,
              session_timeout_minutes = EXCLUDED.session_timeout_minutes,
              login_alerts = EXCLUDED.login_alerts,
              updated_at = now()
          `
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

  const getSecurityScore = () => {
    let score = 0;
    if (settings.two_factor_enabled) score += 30;
    if (settings.login_alerts) score += 20;
    if (settings.session_timeout_minutes <= 240) score += 25;
    if (settings.password_changed_at) {
      const lastChange = new Date(settings.password_changed_at);
      const monthsAgo = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsAgo < 3) score += 25;
    }
    return Math.min(score, 100);
  };

  const securityScore = getSecurityScore();

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pontuação de Segurança
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-300">
            Avaliação da segurança da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Nível de Segurança</span>
                <span className="text-sm font-medium">{securityScore}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    securityScore >= 80 ? 'bg-green-500' : 
                    securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${securityScore}%` }}
                ></div>
              </div>
            </div>
            <Badge 
              variant={securityScore >= 80 ? "default" : securityScore >= 60 ? "secondary" : "destructive"}
            >
              {securityScore >= 80 ? 'Excelente' : securityScore >= 60 ? 'Bom' : 'Precisa melhorar'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configurações de Segurança
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-300">
            Configure as opções de segurança da sua conta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Two Factor Authentication */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Autenticação de Dois Fatores
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="twoFactor" className="text-neutral-900 dark:text-neutral-100">
                  Ativar 2FA
                </Label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Adicione uma camada extra de segurança à sua conta
                </p>
              </div>
              <Switch 
                id="twoFactor"
                checked={settings.two_factor_enabled}
                onCheckedChange={() => handleToggle('two_factor_enabled')}
              />
            </div>
          </div>

          {/* Session Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Gerenciamento de Sessão
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="loginAlerts" className="text-neutral-900 dark:text-neutral-100">
                    Alertas de Login
                  </Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Receba notificações quando sua conta for acessada
                  </p>
                </div>
                <Switch 
                  id="loginAlerts"
                  checked={settings.login_alerts}
                  onCheckedChange={() => handleToggle('login_alerts')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout" className="text-neutral-900 dark:text-neutral-100">
                  Timeout de Sessão (minutos)
                </Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="30"
                  max="1440"
                  value={settings.session_timeout_minutes}
                  onChange={(e) => handleSessionTimeoutChange(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Sua sessão expirará após este período de inatividade
                </p>
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Alteração de Senha
            </h3>
            
            <div className="space-y-3 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                />
              </div>
              
              <Button 
                onClick={handleChangePassword}
                disabled={changingPassword || !newPassword || !confirmPassword}
                variant="outline"
              >
                {changingPassword ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          </div>

          {/* Security Status */}
          {settings.failed_login_attempts > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Status de Segurança
              </h3>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Atenção:</strong> Foram detectadas {settings.failed_login_attempts} tentativas de login falhadas em sua conta.
                </p>
              </div>
            </div>
          )}
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

export default SecuritySettings;
