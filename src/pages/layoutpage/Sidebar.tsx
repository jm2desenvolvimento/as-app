import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { useAuthStore } from '../../store/authStore';

export interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  group?: string;
  subItems?: SidebarItem[];
  permissions?: string[]; // Permissões necessárias para exibir o item
  roles?: string[]; // Roles necessários para exibir o item
}

interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onItemClick?: () => void;
}

export default function Sidebar({ items, collapsed, onItemClick }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedDropdowns, setExpandedDropdowns] = useState<string[]>([]);
  const { hasAnyPermission, hasRole, user } = usePermission();
  const { logout } = useAuthStore();
  const currentPath = location.pathname;

  // Log para debug
  console.log('[Sidebar] User:', user);
  console.log('[Sidebar] User permissions:', user?.permissions);
  console.log('[Sidebar] User role:', user?.role);
  console.log('[Sidebar] Items recebidos:', items);

  // Função para verificar se o usuário pode ver um item
  const canViewItem = (item: SidebarItem): boolean => {
    console.log(`[Sidebar] Verificando item: ${item.label}`, {
      permissions: item.permissions,
      roles: item.roles,
      userRole: user?.role,
      userPermissions: user?.permissions
    });

    // Se o item for o de permissões e o usuário for MASTER, sempre mostra
    if (item.label.toLowerCase().includes('permiss')) {
      if (hasRole('MASTER')) {
        console.log(`[Sidebar] Item ${item.label} permitido - é MASTER`);
        return true;
      }
    }
    
    // Se não há permissões ou roles definidas, exibe o item
    if (!item.permissions && !item.roles) {
      console.log(`[Sidebar] Item ${item.label} permitido - sem restrições`);
      return true;
    }
    
    // Verificar roles
    if (item.roles && !item.roles.some(role => hasRole(role))) {
      // Se for MASTER, sempre retorna true
      if (hasRole('MASTER')) {
        console.log(`[Sidebar] Item ${item.label} permitido - é MASTER`);
        return true;
      }
      console.log(`[Sidebar] Item ${item.label} negado - role não permitido`);
      return false;
    }
    
    // Verificar permissões
    if (item.permissions && !hasAnyPermission(item.permissions as any)) {
      console.log(`[Sidebar] Item ${item.label} negado - sem permissões necessárias`);
      return false;
    }
    
    console.log(`[Sidebar] Item ${item.label} permitido`);
    return true;
  };

  // Filtrar itens baseado em permissões
  const filterItemsByPermissions = (items: SidebarItem[]): SidebarItem[] => {
    return items.filter(item => {
      if (!canViewItem(item)) return false;
      
      // Filtrar subitens também
      if (item.subItems) {
        item.subItems = filterItemsByPermissions(item.subItems);
        // Se não há subitens visíveis, oculta o item pai
        return item.subItems.length > 0;
      }
      
      return true;
    });
  };

  // Agrupar e filtrar itens por grupo
  const mainItems = filterItemsByPermissions(items.filter(item => item.group !== 'system'));
  const systemItems = filterItemsByPermissions(items.filter(item => item.group === 'system'));

  // Dropdown logic
  const handleMenuClick = (path: string, isDropdown?: boolean) => {
    if (isDropdown) {
      setExpandedDropdowns(prev =>
        prev.includes(path)
          ? prev.filter(item => item !== path)
          : [...prev, path]
      );
    } else {
      navigate(path);
      // Fechar sidebar em mobile após navegação
      if (onItemClick) {
        onItemClick();
      }
    }
  };
  const isDropdownExpanded = (path: string) => expandedDropdowns.includes(path);

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-blue-700 to-blue-500 text-white transition-all duration-300 z-20 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo no topo */}
      <div className={`flex flex-col items-center justify-center py-6 ${collapsed ? 'px-0' : 'px-4'}`}>
        <img
          src="/logo 2.png"
          alt="Logo AgendaSaúde"
          className={`transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-24 h-24'} object-contain mb-2`}
        />
        {!collapsed && <span className="text-white text-lg font-bold tracking-wide"></span>}
      </div>
      {/* Divisão visual */}
      <div className="border-b border-white/20 mx-4 mb-2" />
      <div className="p-4 flex-grow">
        {/* Menu Principal */}
        <div className="space-y-1">
          {mainItems.map((item) => (
            <React.Fragment key={item.path}>
              {/* Item normal ou dropdown */}
              <div
                className={`relative flex items-center px-3 py-2 rounded-lg cursor-pointer
                  ${(currentPath === item.path || (item.subItems && item.subItems.some(sub => currentPath === sub.path))) ? 'bg-white/15 hover:bg-white/20' : 'hover:bg-white/10'}
                  ${collapsed ? 'justify-center' : 'justify-between'}
                `}
                onClick={() => handleMenuClick(item.path, !!item.subItems)}
                title={collapsed ? item.label : ''}
              >
                <div className="flex items-center">
                  {/* Indicador de item ativo */}
                  {(currentPath === item.path || (item.subItems && item.subItems.some(sub => currentPath === sub.path))) && (
                    <div className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 w-1 h-5 bg-white rounded-r"></div>
                  )}
                  {/* Ícone */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-white/15 ${!collapsed ? 'mr-3' : ''} transition-transform hover:scale-105`}>
                    {item.icon}
                  </div>
                  {/* Texto */}
                  {!collapsed && (
                    <span className={`text-sm whitespace-nowrap transition-opacity duration-200
                      ${(currentPath === item.path || (item.subItems && item.subItems.some(sub => currentPath === sub.path))) ? 'font-semibold text-white' : 'font-medium text-white/80'}`}>{item.label}</span>
                  )}
                </div>
                {/* Seta para dropdown */}
                {!collapsed && item.subItems && (
                  <div className="text-white/80">
                    {isDropdownExpanded(item.path) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                )}
              </div>
              {/* Subitens do dropdown */}
              {!collapsed && item.subItems && isDropdownExpanded(item.path) && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems.map(subItem => (
                    <div
                      key={subItem.path}
                      className={`relative flex items-center px-3 py-2 rounded-lg cursor-pointer
                        ${currentPath === subItem.path ? 'bg-white/15 hover:bg-white/20' : 'hover:bg-white/10'}`}
                      onClick={() => {
                        navigate(subItem.path);
                        if (onItemClick) {
                          onItemClick();
                        }
                      }}
                    >
                      {currentPath === subItem.path && (
                        <div className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 w-1 h-5 bg-white rounded-r"></div>
                      )}
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/10 mr-3">
                        {subItem.icon}
                      </div>
                      <span className={`text-sm whitespace-nowrap ${currentPath === subItem.path ? 'font-semibold text-white' : 'font-medium text-white/70'}`}>{subItem.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Divisor */}
        <div className="my-4 border-t border-white/10"></div>
        {/* Menu de Sistema */}
        <div className="space-y-1">
          {systemItems.map((item) => (
            <div
              key={item.path}
              className={`relative flex items-center px-3 py-2 rounded-lg cursor-pointer
                ${currentPath === item.path ? 'bg-white/15 hover:bg-white/20' : 'hover:bg-white/10'}
                ${collapsed ? 'justify-center' : 'justify-start'}`}
              onClick={() => {
                navigate(item.path);
                if (onItemClick) {
                  onItemClick();
                }
              }}
              title={collapsed ? item.label : ''}
            >
              {currentPath === item.path && (
                <div className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 w-1 h-5 bg-white rounded-r"></div>
              )}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-white/15 ${collapsed ? '' : 'mr-3'} transition-transform hover:scale-105`}>
                {item.icon}
              </div>
              {!collapsed && (
                <span className={`text-sm whitespace-nowrap transition-opacity duration-200 ${currentPath === item.path ? 'font-semibold text-white' : 'font-medium text-white/80'}`}>{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Botão de Logout */}
      <div className="mt-auto mb-4 px-5">
        <div
          className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-red-500/20"
          onClick={() => {
            navigate('/');
            logout();
          }}
          title={collapsed ? 'Sair' : ''}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/15 transition-transform hover:scale-105 mr-3">
            <LogOut className="h-5 w-5 text-red-300" />
          </div>
          {!collapsed && (
            <span className="text-sm font-medium text-red-300">Sair</span>
          )}
        </div>
      </div>
    </aside>
  );
}
