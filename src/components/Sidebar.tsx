
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
          ? 'bg-gradient-to-b from-gray-900 via-gray-950 to-black border-gray-800/50'
          : 'bg-gradient-to-b from-white via-gray-50 to-gray-100 border-gray-200/50'
      } h-screen fixed left-0 top-0 z-50 flex flex-col border-r backdrop-blur-xl shadow-2xl ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}
      style={{ width: isCollapsed ? '80px' : '280px' }}
    >
      {/* Header com logo */}
      <div className={`p-6 border-b ${
        theme === 'dark' ? 'border-gray-800/50' : 'border-gray-200/50'
      }`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
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
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Sistema de Gestão</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto shadow-lg ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-700 to-gray-800'
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
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
                ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'
            } transition-all duration-200 rounded-lg`}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
      </div>

      {/* Navigation com ScrollArea customizada */}
      <ScrollArea className="flex-1 p-4">
        <style>
          {`
            .custom-scrollbar [data-radix-scroll-area-scrollbar] {
              left: 8px !important;
              right: auto !important;
              width: 6px !important;
            }
            .custom-scrollbar [data-radix-scroll-area-thumb] {
              background: ${theme === 'dark' ? 'rgba(156, 163, 175, 0.5)' : 'rgba(107, 114, 128, 0.3)'} !important;
              border-radius: 6px !important;
              transition: all 0.2s ease !important;
            }
            .custom-scrollbar [data-radix-scroll-area-thumb]:hover {
              background: ${theme === 'dark' ? 'rgba(156, 163, 175, 0.8)' : 'rgba(107, 114, 128, 0.6)'} !important;
            }
          `}
        </style>
        <nav className="custom-scrollbar">
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
                          ? 'bg-gradient-to-r from-gray-800/60 to-gray-700/60 text-white border border-gray-600/40 shadow-lg'
                          : 'bg-gradient-to-r from-gray-200/80 to-gray-100/80 text-gray-800 border border-gray-300/40 shadow-lg'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/40 hover:to-gray-700/40'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-gray-100/60 hover:to-gray-50/60'
                    }`}
                    onMouseEnter={(e) => handleMenuItemHover(e.currentTarget, true)}
                    onMouseLeave={(e) => handleMenuItemHover(e.currentTarget, false)}
                  >
                    {/* Efeito de brilho no hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${
                      theme === 'dark' ? 'via-gray-600/10' : 'via-gray-400/10'
                    } to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000`} />
                    
                    <div className={`p-2 rounded-lg ${
                      isActive 
                        ? theme === 'dark'
                          ? 'bg-gray-700/40'
                          : 'bg-gray-300/40'
                        : theme === 'dark'
                          ? 'group-hover:bg-gray-700/30'
                          : 'group-hover:bg-gray-200/40'
                    } transition-all duration-200`}>
                      <Icon size={20} />
                    </div>
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                    
                    {/* Indicador de ativo */}
                    {isActive && (
                      <div className={`absolute right-0 w-1 h-8 rounded-l-full ${
                        theme === 'dark' ? 'bg-gray-400' : 'bg-gray-600'
                      }`} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </ScrollArea>

      {/* User info e logout */}
      <div className={`p-4 border-t ${
        theme === 'dark' ? 'border-gray-800/50' : 'border-gray-200/50'
      }`}>
        {!isCollapsed && user && (
          <div className={`mb-4 p-3 rounded-xl ${
            theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-gray-100/50 border border-gray-200/50'
          }`}>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              {user.email}
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
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
              : 'text-gray-600 hover:text-red-600 hover:bg-red-500/10 border border-gray-200/50 hover:border-red-400/30'
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
