import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useInviteCodes } from '@/hooks/useInviteCodes';
import { useOTP } from '@/hooks/useOTP';
import { InviteCodeStep } from '@/components/auth/InviteCodeStep';
import { OTPStep } from '@/components/auth/OTPStep';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Loader2, LogIn, UserPlus, Lock, Mail, Sparkles } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [step, setStep] = useState<'invite' | 'form' | 'otp'>('invite');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [userRole, setUserRole] = useState('');
  
  // Reset password form
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const { login, register, isAuthenticated } = useAuth();
  const { signOut, resetPassword } = useSupabaseAuth();
  const { useInviteCode } = useInviteCodes();
  const { generateOTP } = useOTP();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await login(loginEmail, loginPassword);
      
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao Sistema DASA Labs.',
      });
      
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Erro no login. Verifique suas credenciais.';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Por favor, confirme seu email antes de fazer login.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
      }
      
      toast({
        title: 'Erro no login',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteValidation = (code: string, role: string) => {
    setInviteCode(code);
    setUserRole(role);
    setStep('form');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (registerPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Gerar OTP primeiro
      await generateOTP(registerEmail, 'signup');
      setStep('otp');
    } catch (error: any) {
      console.error('Error generating OTP:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o código de verificação.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = async () => {
    try {
      setLoading(true);
      
      // Criar conta
      await register(registerEmail, registerPassword, registerName);
      
      // Usar código de convite
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await useInviteCode(inviteCode, userData.user.id);
      }
      
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Sua conta foi criada e verificada.',
      });
      
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Register error:', error);
      
      let errorMessage = 'Erro no cadastro. Tente novamente.';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado.';
      }
      
      toast({
        title: 'Erro no cadastro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await resetPassword(resetEmail);
      
      toast({
        title: 'Email enviado!',
        description: 'Verifique seu email para redefinir a senha. O link será válido por 1 hora.',
      });
      
      setShowResetForm(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Não foi possível enviar o email de recuperação.';
      
      if (error.message?.includes('For security purposes')) {
        errorMessage = 'Por segurança, aguarde alguns minutos antes de solicitar um novo email.';
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-4">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recuperar Senha
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                  Digite seu email para receber instruções de recuperação
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Email'
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setShowResetForm(false)}
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="w-full max-w-md">
        {/* Header - altura fixa */}
        <div className="text-center mb-8 h-32">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            DASA Labs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Gestão laboratorial inteligente</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setStep(value === 'register' ? 'invite' : 'form');
        }}>
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger 
              value="login" 
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="register" 
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              Cadastro
            </TabsTrigger>
          </TabsList>

          {/* Container com altura mínima fixa para evitar mudanças de layout */}
          <div className="min-h-[500px]">
            <TabsContent value="login">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
                <CardContent className="pt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-700 dark:text-gray-300">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10 h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-700 dark:text-gray-300">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => setShowResetForm(true)}
                      >
                        Esqueceu a senha?
                      </Button>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          Entrar
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              {step === 'invite' && (
                <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl rounded-lg">
                  <InviteCodeStep 
                    onValidCode={handleInviteValidation}
                    loading={loading}
                  />
                </div>
              )}

              {step === 'form' && (
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">Criar Conta</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Preencha seus dados para criar sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name" className="text-gray-700 dark:text-gray-300">Nome Completo</Label>
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Seu nome completo"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-gray-700 dark:text-gray-300">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            className="pl-10 h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-gray-700 dark:text-gray-300">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="••••••••"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="pl-10 h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-300">Confirmar Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Continuar
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => setStep('invite')}
                        >
                          Voltar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {step === 'otp' && (
                <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl rounded-lg">
                  <OTPStep
                    email={registerEmail}
                    type="signup"
                    onVerified={handleOTPVerified}
                    onResend={() => generateOTP(registerEmail, 'signup')}
                    loading={loading}
                  />
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
