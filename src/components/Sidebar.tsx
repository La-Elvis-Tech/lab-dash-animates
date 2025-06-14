
import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
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
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLLIElement | null)[]>([]);

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

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: isCollapsed ? '80px' : '280px',
        duration: 0.4,
        ease: "power2.out"
      });
    }
  }, [isCollapsed]);

  useEffect(() => {
    // Animação de entrada dos itens do menu
    menuItemsRef.current.forEach((item, index) => {
      if (item) {
        gsap.fromTo(item, 
          { 
            opacity: 0, 
            x: -20 
          },
          { 
            opacity: 1, 
            x: 0, 
            duration: 0.3,
            delay: index * 0.05,
            ease: "power2.out"
          }
        );
      }
    });
  }, []);

  const handleMenuItemHover = (element: HTMLElement, isEntering: boolean) => {
    gsap.to(element, {
      scale: isEntering ? 1.02 : 1,
      x: isEntering ? 8 : 0,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  return (
    <div 
      ref={sidebarRef}
      className={`${
        theme === 'dark'
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-gray-700/50'
          : 'bg-gradient-to-b from-lab-blue via-blue-600 to-lab-blue border-blue-400/20'
      } text-white h-screen fixed left-0 top-0 z-50 flex flex-col border-r backdrop-blur-xl shadow-2xl`}
      style={{ width: isCollapsed ? '80px' : '280px' }}
    >
      {/* Header com logo */}
      <div className={`p-6 border-b ${
        theme === 'dark' ? 'border-gray-700/50' : 'border-white/10'
      }`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                  : 'bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm'
              }`}>
                <img 
                  src="/logolaelvis.svg" 
                  alt="La Elvis Tech" 
                  className="w-6 h-6"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold font-michroma">La Elvis Tech</h1>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-blue-100'
                }`}>Sistema de Gestão</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto shadow-lg ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                : 'bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm'
            }`}>
              <img 
                src="/logolaelvis.svg" 
                alt="La Elvis Tech" 
                className="w-6 h-6"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={`${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            } transition-all duration-200 rounded-lg`}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li 
                key={item.path}
                ref={el => menuItemsRef.current[index] = el}
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive 
                      ? theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-400/30 shadow-lg'
                        : 'bg-gradient-to-r from-white/25 to-white/15 text-white border border-white/20 shadow-lg backdrop-blur-sm'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50'
                        : 'text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5'
                  }`}
                  onMouseEnter={(e) => handleMenuItemHover(e.currentTarget, true)}
                  onMouseLeave={(e) => handleMenuItemHover(e.currentTarget, false)}
                >
                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div className={`p-2 rounded-lg ${
                    isActive 
                      ? theme === 'dark'
                        ? 'bg-blue-500/20'
                        : 'bg-white/20'
                      : 'group-hover:bg-white/10'
                  } transition-all duration-200`}>
                    <Icon size={20} />
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                  
                  {/* Indicador de ativo */}
                  {isActive && (
                    <div className={`absolute right-0 w-1 h-8 rounded-l-full ${
                      theme === 'dark' ? 'bg-blue-400' : 'bg-white'
                    }`} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info e logout */}
      <div className={`p-4 border-t ${
        theme === 'dark' ? 'border-gray-700/50' : 'border-white/10'
      }`}>
        {!isCollapsed && user && (
          <div className={`mb-4 p-3 rounded-xl ${
            theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-white/10 backdrop-blur-sm border border-white/10'
          }`}>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-white'
            }`}>
              {user.email}
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-blue-100'
            }`}>
              Usuário ativo
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className={`w-full justify-start gap-3 p-3 rounded-xl transition-all duration-200 ${
            theme === 'dark'
              ? 'text-gray-300 hover:text-red-400 hover:bg-red-500/10 border border-gray-700/50 hover:border-red-500/30'
              : 'text-blue-100 hover:text-red-200 hover:bg-red-500/20 border border-white/10 hover:border-red-300/30'
          }`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Sair</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
