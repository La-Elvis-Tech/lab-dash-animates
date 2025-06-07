
import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  LayoutDashboard, 
  Beaker, 
  ClipboardList, 
  Calendar, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  User
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import Logo from '/logolaelvis.svg'

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeItem, setActiveItem] = React.useState('dashboard');
  const location = useLocation();

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

  return (
    <div 
      ref={contentRef} 
      className="sidebar-content h-screen bg-white/95 dark:bg-neutral-950/80 backdrop-blur-sm flex flex-col transition-all overflow-hidden border-r border-gray-200/50 dark:border-gray-700/50"
      style={{ width: isCollapsed ? '80px' : '260px' }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center">
          <div className="rounded-lg p-2 flex items-center justify-center bg-gradient-to-br from-lab-blue/10 to-purple-500/10">
            <img src={Logo} alt="Logo" className="w-8 h-8" />
          </div>
          <h1 className="font-michroma sidebar-logo-text text-sm font-bold text-lab-blue ml-3 dark:text-white overflow-clip whitespace-nowrap">
            La Elvis Tech
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className={`nav-grid grid gap-2 ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveItem(item.id)}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border overflow-hidden ${
                activeItem === item.id 
                  ? 'bg-gradient-to-br from-lab-blue/10 to-purple-500/10 border-lab-blue/20 text-lab-blue dark:from-blue-500/20 dark:to-purple-500/20 dark:border-blue-400/30 dark:text-blue-400 shadow-lg shadow-lab-blue/10'
                  : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
              }`}
              style={{ aspectRatio: isCollapsed ? '1' : '1.2' }}
            >
              <div className={`flex items-center justify-center mb-1 transition-transform group-hover:scale-110 ${
                isCollapsed ? 'mb-0' : 'mb-1'
              }`}>
                <item.icon size={isCollapsed ? 20 : 18} />
              </div>
              <span className={`item-text text-xs font-medium text-center leading-tight ${
                isCollapsed ? 'hidden' : 'block'
              }`}>
                {item.name}
              </span>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 rounded-xl" />
            </Link>
          ))}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="px-3 pb-2">
        <button 
          onClick={toggleSidebar} 
          className="w-full py-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-colors dark:text-gray-300 flex items-center justify-center border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Profile Section */}
      <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-lab-blue to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <User className="text-white" size={16} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
            </div>
            {!isCollapsed && (
              <div className="item-text ml-3 min-w-0">
                <p className="font-medium text-sm text-gray-700 dark:text-white overflow-clip whitespace-nowrap">
                  Lab Central
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                  Online
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
