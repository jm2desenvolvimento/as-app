import LayoutHeader from './Header';
import Sidebar from './Sidebar';
import type { SidebarItem } from './Sidebar';
import { useState } from 'react';

interface LayoutPageProps {
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
}

export default function LayoutPage({ sidebarItems, children }: LayoutPageProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar fixa à esquerda */}
      <div className={`flex flex-col h-full transition-all duration-300 bg-blue-700 shadow-lg ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Topo da Sidebar: Logo e nome */}
        <div className="flex items-center justify-between px-4 py-4 h-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">AS</div>
            {!sidebarCollapsed && <span className="text-white text-lg font-bold tracking-wide">AgendaSaúde</span>}
          </div>
        </div>
        {/* Menus */}
        <Sidebar items={sidebarItems} collapsed={sidebarCollapsed} />
      </div>
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-h-0">
        <LayoutHeader sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((c) => !c)} />
        <main className="flex-1 p-8 overflow-y-auto min-h-0 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
