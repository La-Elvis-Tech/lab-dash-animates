
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Users as UsersIcon } from 'lucide-react';
import PendingUsersTable from '@/components/users/PendingUsersTable';

const UsersPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciamento de Usuários</h1>
        <p className="text-gray-600 dark:text-gray-400">Gerencie aprovações de usuários e perfis</p>
      </div>

      {/* Tabs para separar usuários pendentes e ativos */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Usuários Pendentes
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Usuários Ativos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <PendingUsersTable />
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Lista de usuários ativos será implementada em breve</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersPage;
