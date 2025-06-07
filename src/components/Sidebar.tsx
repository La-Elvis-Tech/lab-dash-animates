
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
  LogOut,
  User
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
        gsap.to('.profile-details', {
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
        gsap.to('.profile-details', {
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
      className="sidebar-content h-screen bg-white/90 backdrop-blur-sm flex flex-col transition-all overflow-hidden border-r border-gray-100"
      style={{ width: isCollapsed ? '80px' : '260px' }}
    >
      {/* Header com Logo */}
      <div className="flex items-center p-4 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <img src={Logo} alt="Logo" className="w-5 h-5" />
          </div>
          <h1 className="font-michroma sidebar-logo-text text-sm font-semibold text-gray-800 ml-3">
            La Elvis Tech
          </h1>
        </div>
      </div>

      {/* Profile Section - Movido para o topo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center">
          <Avatar className="w-12 h-12 ring-2 ring-blue-100">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
              {user ? getUserInitials(user.username) : 'LC'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="profile-details ml-3 min-w-0 flex-1">
              <p className="font-semibold text-sm text-gray-800 truncate">
                {user?.username || 'Lab Central'}
              </p>
              <p className="text-xs text-gray-500 mb-1">
                {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
              </p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">Online</span>
              </div>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={signout}
            className="profile-details w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={14} />
            <span>Sair da Conta</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className={`nav-grid grid gap-2 ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveItem(item.id)}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                activeItem === item.id 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm border border-blue-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
              style={{ aspectRatio: isCollapsed ? '1' : '1.2' }}
            >
              <div className={`flex items-center justify-center transition-all duration-200 ${
                isCollapsed ? 'mb-0' : 'mb-2'
              }`}>
                <item.icon size={20} strokeWidth={1.5} />
              </div>
              <span className={`item-text text-xs font-medium text-center leading-tight ${
                isCollapsed ? 'hidden' : 'block'
              }`}>
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="p-3">
        <button 
          onClick={toggleSidebar} 
          className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 flex items-center justify-center group"
        >
          {isCollapsed ? (
            <ChevronsRight size={18} className="text-gray-500 group-hover:text-gray-700" />
          ) : (
            <ChevronsLeft size={18} className="text-gray-500 group-hover:text-gray-700" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
