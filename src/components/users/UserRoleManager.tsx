
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserMinus } from 'lucide-react';

interface UserRoleManagerProps {
  userId: string;
  userEmail: string;
  currentRole: string;
  onRoleChange: (userId: string, newRole: 'admin' | 'user' | 'supervisor') => void;
  onDeactivateUser: (userId: string, userEmail: string) => void;
}

const UserRoleManager: React.FC<UserRoleManagerProps> = ({
  userId,
  userEmail,
  currentRole,
  onRoleChange,
  onDeactivateUser
}) => {
  return (
    <div className="flex gap-2">
      <Select
        value={currentRole}
        onValueChange={(value: 'admin' | 'user' | 'supervisor') => 
          onRoleChange(userId, value)
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
        onClick={() => onDeactivateUser(userId, userEmail)}
      >
        <UserMinus className="h-4 w-4 mr-1" />
        Desativar
      </Button>
    </div>
  );
};

export default UserRoleManager;
