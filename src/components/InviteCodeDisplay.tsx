
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InviteCode {
  id: string;
  code: string;
  role: string;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const InviteCodeDisplay = () => {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCodes, setShowCodes] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar códigos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os códigos de convite.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Código copiado!',
      description: `Código ${code} copiado para a área de transferência.`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getStatusBadge = (code: InviteCode) => {
    if (!code.is_active) {
      return <Badge variant="secondary">Inativo</Badge>;
    }
    if (isExpired(code.expires_at)) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    if (code.current_uses >= code.max_uses) {
      return <Badge variant="outline">Esgotado</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-500',
      supervisor: 'bg-yellow-500',
      user: 'bg-blue-500'
    };
    return (
      <Badge className={colors[role as keyof typeof colors] || 'bg-gray-500'}>
        {role}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Carregando códigos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Códigos de Convite Disponíveis</CardTitle>
        <CardDescription>
          Use estes códigos para criar contas de administrador
        </CardDescription>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCodes(!showCodes)}
          >
            {showCodes ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showCodes ? 'Ocultar' : 'Mostrar'} Códigos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {codes.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            Nenhum código de convite encontrado
          </p>
        ) : (
          <div className="space-y-4">
            {codes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-lg font-mono">
                      {showCodes ? code.code : '••••••••'}
                    </code>
                    {getRoleBadge(code.role)}
                    {getStatusBadge(code)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Usos: {code.current_uses} / {code.max_uses}</p>
                    <p>Criado: {formatDate(code.created_at)}</p>
                    {code.expires_at && (
                      <p>Expira: {formatDate(code.expires_at)}</p>
                    )}
                  </div>
                </div>
                {showCodes && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(code.code)}
                    disabled={!code.is_active || isExpired(code.expires_at) || code.current_uses >= code.max_uses}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {codes.some(code => code.role === 'admin' && code.is_active && !isExpired(code.expires_at) && code.current_uses < code.max_uses) && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Para criar conta de administrador:
            </h4>
            <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>1. Clique em "Mostrar Códigos" acima</li>
              <li>2. Copie um código de admin ativo</li>
              <li>3. Vá para a página de registro (/auth)</li>
              <li>4. Use o código durante o cadastro</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteCodeDisplay;
