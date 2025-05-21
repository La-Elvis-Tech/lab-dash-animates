
import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { gsap } from 'gsap';
import Sidebar from './Sidebar.tsx';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useIsMobile } from '../hooks/use-mobile';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mobileHeaderRef = useRef<HTMLDivElement>(null);
  const animationInProgress = useRef(false);

  // Close sidebar when switching to mobile view
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!mainContentRef.current || !sidebarRef.current || animationInProgress.current) return;
    
    animationInProgress.current = true;
    
    const ctx = gsap.context(() => {
      // Set main content padding only in desktop mode
      if (!isMobile) {
        gsap.to(mainContentRef.current, {
          paddingLeft: isCollapsed ? '80px' : '260px',
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        gsap.set(mainContentRef.current, { paddingLeft: 0 });
      }

      // Mobile animation
      if (isMobile) {
        // Overlay animation
        gsap.to(overlayRef.current, {
          opacity: isSidebarOpen ? 0.5 : 0,
          visibility: isSidebarOpen ? 'visible' : 'hidden',
          duration: 0.3
        });
        
        // Sidebar animation for mobile (slide from the left)
        gsap.to(sidebarRef.current, {
          x: isSidebarOpen ? '0%' : '-100%',
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            animationInProgress.current = false;
          }
        });
      } else {
        // Desktop sidebar animation (width change)
        gsap.set(sidebarRef.current, { x: '0%' });
        gsap.set(overlayRef.current, { visibility: 'hidden', opacity: 0 });
        animationInProgress.current = false;
      }
    }, mainContentRef);

    return () => {
      ctx.revert();
    };
  }, [isCollapsed, isMobile, isSidebarOpen]);

  const toggleSidebar = () => {
    if (animationInProgress.current) return;
    
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="flex h-screen w-full transition-colors duration-300 relative bg-gradient-to-br from-white via-violet-500/30 to-fuchsia-500/30 dark:bg-gradient-to-br dark:via-indigo-100/25">
      {/* Fixed mobile header */}
      {isMobile && (
        <div 
          ref={mobileHeaderRef}
          className="fixed top-0 left-0 right-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={24} className="text-gray-700 dark:text-gray-300" />
              </button>
              <h1 className="text-lg font-semibold text-lab-blue dark:text-white ml-2">La Elvis Tech</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black opacity-0 invisible z-40"
        onClick={() => setIsSidebarOpen(false)}
      />
      
      {/* Mobile Sidebar (as overlay) */}
      {isMobile ? (
        <div 
          ref={sidebarRef}
          className="fixed left-0 top-0 h-full z-50 w-[270px] transform -translate-x-full transition-transform duration-300 ease-in-out"
        >
          <div className="relative h-full">
            <Sidebar isCollapsed={false} toggleSidebar={toggleSidebar} />
            <button
              className="absolute top-4 right-4 p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        /* Desktop Sidebar */
        <div 
          ref={sidebarRef}
          className="fixed left-0 top-0 z-30 h-full"
          style={{ 
            transform: 'translateX(0)'
          }}
        >
          <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        </div>
      )}
      
      {/* Main Content */}
      <div 
        ref={mainContentRef} 
        className="flex-1 overflow-auto transition-all duration-300"
        style={{ 
          paddingLeft: isMobile ? '0px' : (isCollapsed ? '80px' : '260px'),
          paddingTop: isMobile ? '56px' : '0px'
        }}
      >
        {/* Page Content */}
        <div className="p-4 sm:p-6 min-h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
