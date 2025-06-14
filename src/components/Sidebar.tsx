
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  ShoppingCart, 
  AlertTriangle, 
  FlaskConical, 
  BarChart3, 
  Settings, 
  LogOut, 
  Calendar,
  Users
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      roles: ['admin', 'user', 'supervisor']
    },
    {
      title: 'Agendamentos',
      icon: Calendar,
      path: '/appointments',
      roles: ['admin', 'user', 'supervisor']
    },
    {
      title: 'Estoque',
      icon: Package,
      path: '/inventory',
      roles: ['admin', 'user', 'supervisor']
    },
    {
      title: 'Solicitações',
      icon: ClipboardList,
      path: '/requests',
      roles: ['admin', 'user', 'supervisor']
    },
    {
      title: 'Pedidos',
      icon: ShoppingCart,
      path: '/orders',
      roles: ['admin', 'supervisor']
    },
    {
      title: 'Alertas',
      icon: AlertTriangle,
      path: '/alerts',
      roles: ['admin', 'user', 'supervisor']
    },
    {
      title: 'Simulações',
      icon: FlaskConical,
      path: '/simulations',
      roles: ['admin', 'supervisor']
    },
    {
      title: 'Relatórios',
      icon: BarChart3,
      path: '/reports',
      roles: ['admin', 'supervisor']
    },
    {
      title: 'Configurações',
      icon: Settings,
      path: '/settings',
      roles: ['admin', 'supervisor']
    },
    {
      title: 'Usuários',
      icon: Users,
      path: '/users',
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-lab-blue dark:text-blue-400">
          DASA Labs
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Sistema de Gestão
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-lab-blue text-white dark:bg-blue-600'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-lab-blue text-white">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role || 'Usuário'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex-1"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
