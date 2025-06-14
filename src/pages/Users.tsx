
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInviteCodes, InviteCode } from '@/hooks/useInviteCodes';
import { Loader2, Plus, Users as UsersIcon, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UsersPage = () => {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user' | 'supervisor'>('user');
  const [maxUses, setMaxUses] = useState(1);
  const [expiresHours, setExpiresHours] = useState(168); // 7 dias
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
    const code = await generateInviteCode(selectedRole, maxUses, expiresHours);
    if (code) {
      setIsDialogOpen(false);
      loadInviteCodes();
      toast({
        title: 'Código gerado com sucesso!',
        description: `Código: ${code}`,
      });
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie códigos de convite e permissões</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-lab-blue hover:bg-lab-blue/90">
              <Plus className="mr-2 h-4 w-4" />
              Novo Código
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar Código de Convite</DialogTitle>
              <DialogDescription>
                Crie um novo código de convite para permitir que usuários se registrem no sistema.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Função do Usuário</Label>
                <Select value={selectedRole} onValueChange={(value: 'admin' | 'user' | 'supervisor') => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
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
                  min="1"
                  max="100"
                  value={maxUses}
                  onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expires-hours">Validade (horas)</Label>
                <Input
                  id="expires-hours"
                  type="number"
                  min="1"
                  max="8760"
                  value={expiresHours}
                  onChange={(e) => setExpiresHours(parseInt(e.target.value) || 168)}
                />
                <p className="text-sm text-gray-500">
                  {Math.round(expiresHours / 24)} dias
                </p>
              </div>
              
              <Button
                onClick={handleGenerateCode}
                className="w-full bg-lab-blue hover:bg-lab-blue/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  'Gerar Código'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Códigos Ativos</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inviteCodes.filter(code => code.is_active && !isExpired(code.expires_at) && code.current_uses < code.max_uses).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Códigos</CardTitle>
            <UsersIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inviteCodes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Códigos Utilizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inviteCodes.filter(code => code.current_uses > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Códigos de Convite</CardTitle>
          <CardDescription>
            Lista de todos os códigos de convite criados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : inviteCodes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Nenhum código de convite encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Código</th>
                    <th className="text-left p-2">Função</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Usos</th>
                    <th className="text-left p-2">Criado em</th>
                    <th className="text-left p-2">Expira em</th>
                  </tr>
                </thead>
                <tbody>
                  {inviteCodes.map((code) => (
                    <tr key={code.id} className="border-b">
                      <td className="p-2">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                          {code.code}
                        </code>
                      </td>
                      <td className="p-2">
                        {getRoleBadge(code.role)}
                      </td>
                      <td className="p-2">
                        {getStatusBadge(code)}
                      </td>
                      <td className="p-2">
                        <span className="text-sm">
                          {code.current_uses} / {code.max_uses}
                        </span>
                      </td>
                      <td className="p-2 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(code.created_at)}
                      </td>
                      <td className="p-2 text-sm text-gray-600 dark:text-gray-400">
                        {code.expires_at ? formatDate(code.expires_at) : 'Nunca'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
