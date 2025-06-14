
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useInviteCodes } from '@/hooks/useInviteCodes';
import { Copy, Plus, RefreshCw, Users as UsersIcon } from 'lucide-react';

const Users = () => {
  const [inviteCodes, setInviteCodes] = useState([]);
  const [newCodeRole, setNewCodeRole] = useState<'admin' | 'user' | 'supervisor'>('user');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(1);
  const [newCodeExpires, setNewCodeExpires] = useState(168); // 7 dias
  
  const { generateInviteCode, fetchInviteCodes, loading } = useInviteCodes();
  const { toast } = useToast();

  useEffect(() => {
    loadInviteCodes();
  }, []);

  const loadInviteCodes = async () => {
    const codes = await fetchInviteCodes();
    setInviteCodes(codes);
  };

  const handleGenerateCode = async () => {
    const code = await generateInviteCode(newCodeRole, newCodeMaxUses, newCodeExpires);
    if (code) {
      await loadInviteCodes();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Código copiado para a área de transferência.',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (code: any) => {
    if (!code.is_active) {
      return <Badge variant="secondary">Inativo</Badge>;
    }
    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    if (code.current_uses >= code.max_uses) {
      return <Badge variant="secondary">Esgotado</Badge>;
    }
    return <Badge variant="default">Ativo</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'destructive',
      supervisor: 'secondary',
      user: 'default'
    };
    return <Badge variant={colors[role] || 'default'}>{role}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gere códigos de convite para novos usuários
          </p>
        </div>
        <Button onClick={loadInviteCodes} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gerar Novo Código */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Gerar Código de Convite
            </CardTitle>
            <CardDescription>
              Crie um novo código para convidar usuários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Função do Usuário</Label>
              <Select value={newCodeRole} onValueChange={setNewCodeRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-uses">Máximo de Usos</Label>
              <Input
                id="max-uses"
                type="number"
                min={1}
                max={100}
                value={newCodeMaxUses}
                onChange={(e) => setNewCodeMaxUses(parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires">Validade (horas)</Label>
              <Input
                id="expires"
                type="number"
                min={1}
                max={8760}
                value={newCodeExpires}
                onChange={(e) => setNewCodeExpires(parseInt(e.target.value))}
              />
            </div>

            <Button 
              onClick={handleGenerateCode} 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Gerando...' : 'Gerar Código'}
            </Button>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total de Códigos</span>
                <span className="font-semibold">{inviteCodes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Códigos Ativos</span>
                <span className="font-semibold">
                  {inviteCodes.filter(code => 
                    code.is_active && 
                    code.current_uses < code.max_uses &&
                    (!code.expires_at || new Date(code.expires_at) > new Date())
                  ).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Códigos Usados</span>
                <span className="font-semibold">
                  {inviteCodes.filter(code => code.current_uses > 0).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Códigos */}
      <Card>
        <CardHeader>
          <CardTitle>Códigos de Convite</CardTitle>
          <CardDescription>
            Lista de todos os códigos gerados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inviteCodes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum código de convite encontrado
                </p>
              </div>
            ) : (
              inviteCodes.map((code) => (
                <div 
                  key={code.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-lg font-bold">{code.code}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Criado em: {formatDate(code.created_at)}</span>
                      {code.expires_at && (
                        <span>• Expira em: {formatDate(code.expires_at)}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Usos: {code.current_uses}/{code.max_uses}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(code.role)}
                    {getStatusBadge(code)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
