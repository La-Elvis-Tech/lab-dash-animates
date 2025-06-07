
import React, { useEffect, useRef, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  LayoutDashboard, 
  Beaker, 
  ClipboardList, 
  Calendar, 
  BarChart3, 
  Settings, 
  ChevronsLeft,
  ChevronsRight,
  LogOut
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Avatar, AvatarFallback } from './ui/avatar';
import Logo from '/logolaelvis.svg'

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeItem, setActiveItem] = React.useState('dashboard');
  const location = useLocation();
  const { user, signout } = useContext(AuthContext);

  useEffect(() => {
    // Set active item based on current path
    const path = location.pathname;
    if (path === '/') {
      setActiveItem('dashboard');
    } else {
      const pathPart = path.split('/')[1];
      setActiveItem(pathPart || 'dashboard');
    }
  }, [location]);

  useEffect(() => {
    if (!contentRef.current) return;
    
    const ctx = gsap.context(() => {
      contentRef.current!.style.width = isCollapsed ? '80px' : '260px';
      
      if (isCollapsed) {
        gsap.to('.item-text', {
          opacity: 0,
          display: 'none',
          duration: 0.2,
          ease: 'power2.out'
        });
        gsap.to('.sidebar-logo-text', {
          opacity: 0,
          display: 'none',
          duration: 0.5,
          ease: 'power2.out'
        });
        gsap.to('.nav-grid', {
          gridTemplateColumns: 'repeat(1, 1fr)',
          duration: 0.2,
          ease: 'power2.out'
        });
      } else {
        gsap.to('.item-text', {
          opacity: 1,
          display: 'block',
          duration: 0.3,
          delay: 0.1,
          ease: 'power2.out'
        });
        gsap.to('.sidebar-logo-text', {
          opacity: 1,
          display: 'block',
          duration: 0.3,
          delay: 0.1,
          ease: 'power2.out'
        });
        gsap.to('.nav-grid', {
          gridTemplateColumns: 'repeat(2, 1fr)',
          duration: 0.2,
          ease: 'power2.out'
        });
      }
    }, contentRef);

    return () => ctx.revert();
  }, [isCollapsed]);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'inventory', name: 'Inventário', icon: Beaker, path: '/inventory' },
    { id: 'requests', name: 'Exames', icon: ClipboardList, path: '/requests' },
    { id: 'orders', name: 'Agendamentos', icon: Calendar, path: '/orders' },
    { id: 'reports', name: 'Relatórios', icon: BarChart3, path: '/reports' },
    { id: 'settings', name: 'Configurações', icon: Settings, path: '/settings' }
  ];

  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div 
      ref={contentRef} 
      className="sidebar-content h-screen bg-white/95 dark:bg-neutral-950/80 backdrop-blur-sm flex flex-col transition-all overflow-hidden border-r border-gray-200/50 dark:border-gray-700/50"
      style={{ width: isCollapsed ? '80px' : '260px' }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center">
          <div className="rounded-xl p-2.5 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/30 dark:border-blue-700/30">
            <img src={Logo} alt="Logo" className="w-7 h-7" />
          </div>
          <h1 className="font-michroma sidebar-logo-text text-sm font-bold text-lab-blue ml-3 dark:text-white overflow-clip whitespace-nowrap">
            La Elvis Tech
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className={`nav-grid grid gap-3 ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveItem(item.id)}
              className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 border-2 overflow-hidden transform hover:scale-105 ${
                activeItem === item.id 
                  ? 'bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-blue-400/40 text-blue-600 dark:from-blue-500/20 dark:to-purple-500/20 dark:border-blue-400/50 dark:text-blue-400 shadow-lg shadow-blue-500/20'
                  : 'border-gray-200/60 dark:border-gray-700/60 hover:border-blue-300/50 dark:hover:border-blue-600/50 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              style={{ aspectRatio: isCollapsed ? '1' : '1.1' }}
            >
              <div className={`flex items-center justify-center mb-2 transition-all duration-300 ${
                activeItem === item.id ? 'transform scale-110' : 'group-hover:scale-110'
              } ${isCollapsed ? 'mb-0' : 'mb-2'}`}>
                <item.icon size={isCollapsed ? 22 : 20} strokeWidth={2.5} />
              </div>
              <span className={`item-text text-xs font-semibold text-center leading-tight tracking-wide ${
                isCollapsed ? 'hidden' : 'block'
              }`}>
                {item.name}
              </span>
              
              {/* Efeito de brilho mais sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl" />
              
              {/* Indicador ativo */}
              {activeItem === item.id && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-sm" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="px-3 pb-3">
        <button 
          onClick={toggleSidebar} 
          className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300 border border-gray-300/50 dark:border-gray-600/50 hover:border-blue-300/60 dark:hover:border-blue-600/60 flex items-center justify-center group shadow-sm hover:shadow-md"
        >
          {isCollapsed ? (
            <ChevronsRight size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
          ) : (
            <ChevronsLeft size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
          )}
        </button>
      </div>

      {/* Profile Section */}
      <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/20">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center flex-1 min-w-0">
            <Avatar className="w-11 h-11 ring-2 ring-blue-200/50 dark:ring-blue-600/30 shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                {user ? getUserInitials(user.username) : 'LC'}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="item-text ml-3 min-w-0 flex-1">
                <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">
                  {user?.username || 'Lab Central'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                  {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={signout}
              className="p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-all duration-200 group"
              title="Sair"
            >
              <LogOut size={16} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
