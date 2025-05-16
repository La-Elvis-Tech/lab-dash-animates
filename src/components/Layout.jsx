
import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { gsap } from 'gsap';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mainContentRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(mainContentRef.current, {
        paddingLeft: isMobileView ? '0px' : (isCollapsed ? '80px' : '260px'),
        duration: 0.3,
        ease: 'power2.out'
      });

      if (isMobileView) {
        if (isSidebarOpen) {
          gsap.to('.sidebar-mobile-overlay', {
            opacity: 0.5,
            display: 'block',
            duration: 0.3
          });
          gsap.to('.sidebar-content', {
            x: '0%',
            duration: 0.3,
            ease: 'power2.out'
          });
        } else {
          gsap.to('.sidebar-mobile-overlay', {
            opacity: 0,
            display: 'none',
            duration: 0.3
          });
          gsap.to('.sidebar-content', {
            x: '-100%',
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      } else {
        gsap.to('.sidebar-content', {
          x: '0%',
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });

    return () => ctx.revert();
  }, [isCollapsed, isMobileView, isSidebarOpen]);

  const toggleSidebar = () => {
    if (isMobileView) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isMobileView && (
        <div 
          className="sidebar-mobile-overlay fixed inset-0 bg-black opacity-0 hidden z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 z-30 h-full ${isMobileView ? 'transform -translate-x-full' : ''}`}>
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>
      
      {/* Main Content */}
      <div 
        ref={mainContentRef} 
        className="flex-1 overflow-auto"
        style={{ 
          paddingLeft: isMobileView ? '0px' : (isCollapsed ? '80px' : '260px')
        }}
      >
        {/* Mobile Header */}
        {isMobileView && (
          <div className="bg-white p-4 flex items-center shadow-sm">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-lab-blue ml-2">LabTrack</h1>
          </div>
        )}

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
