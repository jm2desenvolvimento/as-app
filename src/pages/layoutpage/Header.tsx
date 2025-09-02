import { useAuthStore } from '../../store/authStore';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LayoutHeaderProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isMobile?: boolean;
  showMobileMenuButton?: boolean;
}

export default function LayoutHeader({ sidebarCollapsed, onToggleSidebar, isMobile, showMobileMenuButton = true }: LayoutHeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  function handleClickOutside(e: MouseEvent) {
    if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
      setProfileOpen(false);
    }
  }
  // Adiciona/remover listener
  useEffect(() => {
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  return (
    <header className={`w-full h-20 bg-white flex items-center shadow-md transition-all duration-300 ${
      isMobile 
        ? 'justify-between px-4' 
        : `justify-end px-10 ${sidebarCollapsed ? 'pl-24' : 'pl-72'}`
    }`}>
      {/* Botão de menu mobile */}
      {isMobile && onToggleSidebar && showMobileMenuButton && (
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md text-gray-700 hover:bg-blue-50 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      
      <div className="flex items-center gap-8">
        <button className="relative text-gray-400 hover:text-blue-600">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
        <button className="relative text-gray-400 hover:text-blue-600">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4A8.5 8.5 0 0 1 3.6 17L2 21l4-1.6A8.38 8.38 0 0 0 12 19.5c4.7 0 8.5-3.8 8.5-8.5S16.7 2.5 12 2.5 3.5 6.3 3.5 11"/></svg>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
        {/* Card de perfil do usuário */}
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-3 bg-white rounded-full px-3 py-2 shadow hover:shadow-lg border border-gray-200 hover:border-blue-400 transition"
            onClick={() => setProfileOpen((open) => !open)}
          >
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow">
              {user?.profile?.name?.[0] || user?.email?.[0]}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-gray-900 font-semibold text-base leading-tight">{user?.profile?.name || user?.email}</span>
              <span className="text-gray-500 text-xs">{user?.email}</span>
            </div>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down ml-1"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {/* Dropdown de perfil */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-4 flex flex-col gap-2 animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow">
                  {user?.profile?.name?.[0] || user?.email?.[0]}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-gray-900 font-semibold text-base leading-tight">{user?.profile?.name || user?.email}</span>
                  <span className="text-gray-500 text-xs">{user?.email}</span>
                </div>
              </div>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium transition">Meu Perfil</button>
              <button
                onClick={() => {
                  navigate('/');
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-red-600 font-medium transition"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
