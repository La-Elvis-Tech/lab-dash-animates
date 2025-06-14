
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  FileText, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  AlertTriangle, 
  Play,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Inventário', path: '/inventory' },
    { icon: FileText, label: 'Solicitações', path: '/requests' },
    { icon: ShoppingCart, label: 'Pedidos', path: '/orders' },
    { icon: AlertTriangle, label: 'Alertas', path: '/alerts' },
    { icon: Play, label: 'Simulações', path: '/simulations' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: Users, label: 'Usuários', path: '/users' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-lab-blue text-white h-screen fixed left-0 top-0 z-50 transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-lab-blue/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white">DASA Labs</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-white hover:bg-lab-blue/20"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'text-lab-lightBlue hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-lab-blue/20">
        {!isCollapsed && user && (
          <div className="mb-3">
            <p className="text-sm text-lab-lightBlue">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full text-white hover:bg-red-500/20 hover:text-red-200 justify-start"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
