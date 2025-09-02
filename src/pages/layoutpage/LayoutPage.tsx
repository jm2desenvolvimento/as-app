import LayoutHeader from './Header';
import Sidebar from './Sidebar';
import type { SidebarItem } from './Sidebar';
import { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

interface LayoutPageProps {
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
}

export default function LayoutPage({ sidebarItems, children }: LayoutPageProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 relative">
      {/* Overlay para mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}
      
      {/* Botão hambúrguer flutuante para mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 z-50 p-2 rounded-md text-gray-700 bg-white shadow-lg border border-gray-200 hover:bg-gray-50 focus:outline-none transition-all duration-300 ${
            sidebarOpen ? 'left-4' : 'left-4'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div className={`
        flex flex-col h-full transition-all duration-300 bg-blue-700 shadow-lg
        ${isMobile 
          ? `fixed top-0 left-0 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64`
          : `${sidebarCollapsed ? 'w-20' : 'w-64'}`
        }
      `}>
        {/* Topo da Sidebar: Logo e nome */}
        <div className="flex items-center justify-between px-4 py-4 h-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">AS</div>
            {(!sidebarCollapsed || isMobile) && <span className="text-white text-lg font-bold tracking-wide">AgendaSaúde</span>}
          </div>
          {isMobile && sidebarOpen && (
            <button
              onClick={closeSidebar}
              className="text-white hover:text-gray-300 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {/* Menus */}
        <Sidebar 
          items={sidebarItems} 
          collapsed={isMobile ? false : sidebarCollapsed}
          onItemClick={isMobile ? closeSidebar : undefined}
        />
      </div>
      
      {/* Conteúdo principal */}
      <div className={`flex-1 flex flex-col min-h-0 ${isMobile ? 'w-full' : ''}`}>
        <LayoutHeader 
          sidebarCollapsed={isMobile ? false : sidebarCollapsed} 
          onToggleSidebar={toggleSidebar}
          isMobile={isMobile}
          showMobileMenuButton={false}
        />
        <main className={`flex-1 overflow-y-auto min-h-0 bg-gray-50 ${isMobile ? 'p-4' : 'p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
