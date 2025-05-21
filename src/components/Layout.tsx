
import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { gsap } from 'gsap';
import Sidebar from './Sidebar.tsx';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const animationInProgress = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768;
      
      // Only update state if there's a change to avoid unnecessary re-renders
      if (isMobileView !== isNowMobile) {
        setIsMobileView(isNowMobile);
        
        if (isNowMobile) {
          setIsSidebarOpen(false);
        } else {
          setIsSidebarOpen(true);
          
          // Reset X position when switching to desktop
          if (sidebarRef.current) {
            gsap.set(sidebarRef.current, { x: '0%' });
          }
        }
      }
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileView]);

  useEffect(() => {
    if (!mainContentRef.current || !sidebarRef.current || animationInProgress.current) return;
    
    animationInProgress.current = true;
    
    const ctx = gsap.context(() => {
      // Set main content padding
      gsap.to(mainContentRef.current, {
        paddingLeft: isMobileView ? '0px' : (isCollapsed ? '80px' : '260px'),
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          animationInProgress.current = false;
        }
      });

      // Mobile animation
      if (isMobileView) {
        // Overlay (dark background)
        gsap.to('.sidebar-mobile-overlay', {
          opacity: isSidebarOpen ? 0.5 : 0,
          display: isSidebarOpen ? 'block' : 'none',
          duration: 0.3
        });
        
        // Sidebar animation
        gsap.to(sidebarRef.current, {
          x: isSidebarOpen ? '0%' : '-100%',
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        // Ensure correct position in desktop mode
        gsap.set(sidebarRef.current, { x: '0%' });
        gsap.set('.sidebar-mobile-overlay', { display: 'none', opacity: 0 });
      }
    }, mainContentRef);

    return () => {
      ctx.revert();
      animationInProgress.current = false;
    };
  }, [isCollapsed, isMobileView, isSidebarOpen]);

  const toggleSidebar = () => {
    if (animationInProgress.current) return;
    
    if (isMobileView) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="flex h-screen transition-colors duration-300">
      {/* Mobile overlay with improved touch handling */}
      <div 
        className="sidebar-mobile-overlay fixed inset-0 bg-black opacity-0 hidden z-20"
        onClick={() => setIsSidebarOpen(false)}
        style={{ touchAction: 'none' }}
      />
      
      {/* Sidebar with fixed positioning to prevent layout shifting */}
      <div 
        ref={sidebarRef}
        className="fixed left-0 top-0 z-30 h-full"
        style={{ 
          transform: isMobileView && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: animationInProgress.current ? 'none' : 'transform 0.3s ease-in-out'
        }}
      >
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>
      
      {/* Main Content with smooth transitions */}
      <div 
        ref={mainContentRef} 
        className="flex-1 overflow-auto bg-gradient-to-br from-white via-violet-500/30 to-fuchsia-500/30 dark:bg-gradient-to-br dark:via-indigo-100/25 transition-all duration-300"
        style={{ 
          paddingLeft: isMobileView ? '0px' : (isCollapsed ? '80px' : '260px')
        }}
      >
        {/* Mobile Header */}
        {isMobileView && (
          <div className="bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/30 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Open sidebar"
              >
                <Menu size={24} className="dark:text-gray-300" />
              </button>
              <h1 className="text-lg font-semibold text-lab-blue dark:text-white ml-2">La Elvis Tech</h1>
            </div>
            <ThemeToggle />
          </div>
        )}

        {/* Page Content with responsive padding */}
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
