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
  
  // Referências para animação
  const logoTextRef = useRef<HTMLDivElement>(null);
  const profileDetailsRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const itemTextsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const itemIconsRef = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

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

    timelineRef.current = gsap.timeline({
      defaults: { duration: 0.4, ease: "power2.inOut" }
    });

    const ctx = gsap.context(() => {
      contentRef.current!.style.width = isCollapsed ? '80px' : '260px';
      
      if (isCollapsed) {
        // Animação de recolhimento
        timelineRef.current!
          .to('.nav-grid', { 
            gridTemplateColumns: 'repeat(1, 1fr)',
            duration: 0.3 //esse tempo tem q ser igual ao do to abaixo
          }, 0)
          .to(itemTextsRef.current, {
            opacity: 0,
            height: 0,
            stagger: { 
              each: 0.3, //esse tempo tem q ser igual ao do de cima
              from: "end",
              ease: "power2.in"
            },
            onComplete: () => {
              itemTextsRef.current.forEach(el => {
                if (el) el.style.display = 'none';
              });
            }
          }, 0.1)
          .to(itemIconsRef.current, {
            scale: 0.9,
            stagger: 0.03,
          }, 0)
          .to(profileDetailsRef.current, {
            opacity: 0,
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            marginTop: 0,
            marginBottom: 0,
            onComplete: () => {
              if (profileDetailsRef.current) profileDetailsRef.current.style.display = 'none';
            }
          }, 0.15)
          .to(logoTextRef.current, {
            width: 0,
            opacity: 0,
            onComplete: () => {
              if (logoTextRef.current) logoTextRef.current.style.display = 'none';
            }
          }, 0.2);
        
      } else {
        // Pré-configurar elementos antes da animação
        if (logoTextRef.current) {
          logoTextRef.current.style.display = 'block';
          gsap.set(logoTextRef.current, { width: 0, opacity: 0 });
        }
        
        if (profileDetailsRef.current) {
          profileDetailsRef.current.style.display = 'block';
          gsap.set(profileDetailsRef.current, { opacity: 0, height: 0 });
        }
        
        itemTextsRef.current.forEach(el => {
          if (el) {
            el.style.display = 'block';
            gsap.set(el, { opacity: 0, height: 0 });
          }
        });

        gsap.set(itemIconsRef.current, { scale: 0.9 });
        
        // Animação de expansão (processo reverso)
        timelineRef.current!
          .to(logoTextRef.current, {
            width: 'auto',
            opacity: 1
          }, 0)
          .to(profileDetailsRef.current, {
            opacity: 1,
            height: 'auto',
            paddingTop: '1rem',
            paddingBottom: '1rem',
            marginTop: '0',
            marginBottom: '0'
          }, 0.1)
          .to(itemIconsRef.current, {
            scale: 1,
            stagger: 0.04,
            ease: "elastic.out(1, 0.5)"
          }, 0.15)
          .to(itemTextsRef.current, {
            opacity: 1,
            height: 'auto',
            stagger: {
              each: 0.06,
              from: "start",
              ease: "power2.out"
            }
          }, 0.2)
          .to('.nav-grid', {
            gridTemplateColumns: 'repeat(2, 1fr)',
            duration: 0.3
          }, 0.1);
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
      className="sidebar-content h-screen bg-white/90 backdrop-blur-sm flex flex-col transition-all overflow-hidden dark:bg-neutral-900"
      style={{ width: isCollapsed ? '80px' : '260px' }}
    >
      {/* Header com Logo */}
      <div className="flex items-center p-5 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex items-center w-full">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500/50 to-purple-600/20 rounded-lg flex items-center justify-center shadow-sm">
            <img src={Logo} alt="Logo" className="w-5 h-5" />
          </div>
          
          <div 
            ref={logoTextRef}
            className="overflow-hidden ml-3"
            style={{ display: isCollapsed ? 'none' : 'block' }}
          >
            <h1 className="font-michroma text-base font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
              La Elvis Tech
            </h1>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div 
        ref={profileDetailsRef}
        className="p-4 border-b border-gray-100 dark:border-neutral-800"
        style={{ display: isCollapsed ? 'none' : 'block' }}
      >
        <div className="flex items-center">
          <Avatar className="w-12 h-12 ring-2 ring-blue-100 dark:ring-blue-900/30">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
              {user ? getUserInitials(user.username) : 'LC'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
              {user?.username || 'Lab Central'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
            </p>
          </div>
        </div>
        <button
          onClick={signout}
          className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-xs bg-red-300/40 dark:bg-red-900/50 text-gray-700 hover:text-red-600 hover:bg-red-600/50 dark:text-gray-200 dark:hover:text-red-400 dark:hover:bg-red-600/40 transition-colors duration-200"
        >
          <LogOut size={14} />
          <span>Sair da Conta</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className={`nav-grid grid gap-2 ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {navItems.map((item, index) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveItem(item.id)}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-xl transition-colors duration-200 ${
                activeItem === item.id 
                  ? 'bg-gradient-to-br from-indigo-100 to-purple-50 text-blue-600 shadow-sm border-2 border-blue-200/60 dark:from-indigo-900/40 dark:to-purple-900/20 dark:text-blue-400 dark:border-indigo-800/50'
                  : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-gray-200'
              }`}
              style={{ aspectRatio: isCollapsed ? '1' : '1.2' }}
            >
              <div 
                ref={el => itemIconsRef.current[index] = el}
                className={`flex items-center justify-center transition-all duration-200 ${
                  isCollapsed ? 'mb-0' : 'mb-2'
                }`}
              >
                <item.icon size={20} strokeWidth={1.5} />
              </div>
              <span 
                ref={el => itemTextsRef.current[index] = el}
                className={`text-xs font-medium text-center leading-tight ${
                  isCollapsed ? 'hidden' : 'block'
                }`}
                style={{ display: isCollapsed ? 'none' : 'block' }}
              >
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
          className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors duration-200 flex items-center justify-center group"
        >
          {isCollapsed ? (
            <ChevronsRight size={18} className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
          ) : (
            <ChevronsLeft size={18} className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;