
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserMinus, Settings, Crown, UserCheck, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ActiveUser {
  id: string;
  full_name: string;
  email: string;
  status: string;
  position?: string;
  department?: string;
  created_at: string;
  role?: 'admin' | 'user' | 'supervisor';
}

const ActiveUsersTable = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  const fetchActiveUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar roles dos usuários
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combinar dados dos perfis com roles
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        role: roles?.find(role => role.user_id === profile.id)?.role || 'user'
      })) || [];

      setActiveUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Erro ao buscar usuários ativos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários ativos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user' | 'supervisor') => {
    try {
      // Remover role existente
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Adicionar nova role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;

      toast({
        title: 'Role atualizada!',
        description: `Usuário agora tem o papel de ${getRoleLabel(newRole)}.`,
      });

      fetchActiveUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a role do usuário.',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivateUser = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Usuário desativado',
        description: `${userEmail} foi desativado e não poderá mais acessar o sistema.`,
      });

      fetchActiveUsers();
    } catch (error: any) {
      console.error('Erro ao desativar usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar o usuário.',
        variant: 'destructive',
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'supervisor':
        return 'Supervisor';
      case 'user':
        return 'Funcionário';
      default:
        return 'Funcionário';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3" />;
      case 'supervisor':
        return <Settings className="h-3 w-3" />;
      case 'user':
        return <UserCheck className="h-3 w-3" />;
      default:
        return <UserCheck className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Carregando usuários...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-500" />
          Usuários Ativos ({activeUsers.length})
        </CardTitle>
        <CardDescription>
          Usuários com acesso ao sistema e gerenciamento de funções
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeUsers.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum usuário ativo encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo/Departamento</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.position && <div className="font-medium">{user.position}</div>}
                        {user.department && <div className="text-gray-500">{user.department}</div>}
                        {!user.position && !user.department && (
                          <span className="text-gray-400">Não informado</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getRoleBadgeColor(user.role || 'user')}>
                        <span className="flex items-center gap-1">
                          {getRoleIcon(user.role || 'user')}
                          {getRoleLabel(user.role || 'user')}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={user.role || 'user'}
                          onValueChange={(value: 'admin' | 'user' | 'supervisor') => 
                            handleRoleChange(user.id, value)
                          }
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Funcionário</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeactivateUser(user.id, user.email)}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Desativar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveUsersTable;
