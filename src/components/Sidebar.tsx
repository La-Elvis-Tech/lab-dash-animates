
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
      const pathPart = path.split('/')[1]; // Pega apenas a primeira parte do path
      setActiveItem(pathPart || 'dashboard');
    }
  }, [location]);

  useEffect(() => {
    if (!contentRef.current) return;
    
    const ctx = gsap.context(() => {
      // Primeiro definimos a largura diretamente
      contentRef.current!.style.width = isCollapsed ? '80px' : '260px';
      
      if (isCollapsed) {
        // Esconde textos quando colapsa
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
      } else {
        // Mostra textos quando expande
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
      className="sidebar-content h-screen bg-white dark:bg-neutral-950/60 flex flex-col transition-all overflow-hidden"
      style={{ width: isCollapsed ? '80px' : '260px' }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className=" rounded-md p-2 flex items-center justify-center">
            <img src={Logo} alt="Logo" className="w-10 h-10"  />
          </div>
          <h1 className="font-michroma sidebar-logo-text text-lg font-bold text-lab-blue ml-2 dark:text-white overflow-clip whitespace-nowrap">
            La Elvis Tech
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-2 px-2">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => setActiveItem(item.id)}
            className={`flex items-center px-3 py-4 rounded-lg overflow-clip whitespace-nowrap transition-all ${
              activeItem === item.id 
                ? 'bg-lab-lightBlue text-lab-blue dark:bg-gray-700 dark:text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center px-2">
              <item.icon size={22} />
            </div>
            <span className="item-text ml-3">{item.name}</span>
          </Link>
        ))}
      </div>
        <button 
          onClick={toggleSidebar} 
          className="py-2 m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-gray-300 flex items-center justify-center"
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>

      <div className="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-lab-blue rounded-full flex items-center justify-center flex-shrink-0">
            <User className="text-white" size={18} />
          </div>
          <div className="item-text ml-3">
            <p className="font-medium text-sm text-gray-700 dark:text-white overflow-clip whitespace-nowrap">Laboratório Central</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
