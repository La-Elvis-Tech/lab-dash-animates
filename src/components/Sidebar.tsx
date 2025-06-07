
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
          duration: 0.2,
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
      className="sidebar-content h-screen bg-white dark:bg-gray-900 flex flex-col transition-all overflow-hidden border-r border-gray-200 dark:border-gray-800"
      style={{ width: isCollapsed ? '80px' : '260px' }}
    >
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <img src={Logo} alt="Logo" className="w-5 h-5" />
          </div>
          <h1 className="font-michroma sidebar-logo-text text-sm font-semibold text-gray-900 dark:text-white ml-3">
            La Elvis Tech
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className={`nav-grid grid gap-2 ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveItem(item.id)}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                activeItem === item.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              style={{ aspectRatio: isCollapsed ? '1' : '1.2' }}
            >
              <div className={`flex items-center justify-center transition-all duration-200 ${
                isCollapsed ? 'mb-0' : 'mb-2'
              }`}>
                <item.icon size={20} strokeWidth={2} />
              </div>
              <span className={`item-text text-xs font-medium text-center ${
                isCollapsed ? 'hidden' : 'block'
              }`}>
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="px-3 pb-3">
        <button 
          onClick={toggleSidebar} 
          className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center"
        >
          {isCollapsed ? (
            <ChevronsRight size={18} className="text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronsLeft size={18} className="text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Profile Section */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center flex-1 min-w-0">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                {user ? getUserInitials(user.username) : 'LC'}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="item-text ml-3 min-w-0 flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {user?.username || 'Lab Central'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={signout}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-all duration-200"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
