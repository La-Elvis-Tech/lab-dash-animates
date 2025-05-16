import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  LayoutDashboard, 
  Beaker, 
  ListChecks, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const contentRef = useRef(null);
  const [activeItem, setActiveItem] = React.useState('dashboard');
  const location = useLocation();

  useEffect(() => {
    // Set active item based on current path
    const path = location.pathname;
    if (path === '/') {
      setActiveItem('dashboard');
    } else {
      setActiveItem(path.substring(1));
    }
  }, [location]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (isCollapsed) {
        gsap.to(contentRef.current, {
          width: '80px',
          duration: 0.3,
          ease: 'power2.out'
        });
        gsap.to('.item-text', {
          opacity: 0,
          display: 'none',
          duration: 0.2
        });
        gsap.to('.sidebar-logo-text', {
          opacity: 0,
          display: 'none',
          duration: 0.2
        });
      } else {
        gsap.to(contentRef.current, {
          width: '260px',
          duration: 0.3,
          ease: 'power2.out'
        });
        gsap.to('.item-text', {
          opacity: 1,
          display: 'block',
          duration: 0.3,
          delay: 0.1
        });
        gsap.to('.sidebar-logo-text', {
          opacity: 1,
          display: 'block',
          duration: 0.3,
          delay: 0.1
        });
      }
    }, contentRef);

    return () => ctx.revert();
  }, [isCollapsed]);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'inventory', name: 'Inventário', icon: Beaker, path: '/inventory' },
    { id: 'requests', name: 'Solicitações', icon: ListChecks, path: '/requests' },
    { id: 'orders', name: 'Pedidos', icon: ShoppingCart, path: '/orders' },
    { id: 'reports', name: 'Relatórios', icon: BarChart3, path: '/reports' },
    { id: 'settings', name: 'Configurações', icon: Settings, path: '/settings' }
  ];

  return (
    <div 
      ref={contentRef} 
      className="sidebar-content h-screen bg-white border-r border-gray-200 flex flex-col transition-all"
      style={{ width: isCollapsed ? '80px' : '260px' }}
    >
      <div className="flex items-center p-4 border-b border-gray-200">
        <div className="bg-lab-blue rounded-md p-2 flex items-center justify-center">
          <Beaker className="text-white" size={24} />
        </div>
        <h1 className="sidebar-logo-text text-xl font-bold text-lab-blue ml-2">
          La Elvis Tech
        </h1>
       
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-2 px-2">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => setActiveItem(item.id)}
            className={`flex items-center px-3 py-4 rounded-lg transition-all ${
              activeItem === item.id 
                ? 'bg-lab-lightBlue text-lab-blue'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <item.icon size={22} />
            <span className="item-text ml-3">{item.name}</span>
          </Link>
        ))}
      </div>
      <div className="py-4 space-y-2 px-2">

        <button 
          onClick={toggleSidebar} 
          className="flex items-center mb-0 p-4  rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight size={24} />
          ) : (
            <ChevronLeft size={24} />
          )}
        </button>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center p-2">
          <div className="w-8 h-8 bg-lab-blue rounded-full flex items-center justify-center">
            <span className="text-white font-medium">LT</span>
          </div>
          <div className="item-text ml-3">
            <p className="font-medium text-sm">Laboratório Central</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
