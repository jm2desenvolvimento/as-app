import React from 'react';
import { RoleTab, PermissionCategory } from './';
import { PERMISSION_GROUPS, type PermissionGroup } from '../../../constants/permissionCategories';
import { CheckSquare, Square, Zap, RotateCcw } from 'lucide-react';

interface Role {
  key: string;
  label: string;
  description: string;
  permissions: string[];
}

interface RoleManagementProps {
  activeRole: string;
  onRoleChange: (role: string) => void;
  rolePermissions: Record<string, string[]>;
  onPermissionChange: (role: string, permission: string) => void;
  hasUnsavedChanges: (role: string) => boolean;
  saving: boolean;
  searchTerm: string;
  expandedGroups: string[];
  availableRoles: Role[];
}

export const RoleManagement: React.FC<RoleManagementProps> = ({
  activeRole,
  onRoleChange,
  rolePermissions,
  onPermissionChange,
  hasUnsavedChanges,
  saving,
  searchTerm,
  expandedGroups,
  availableRoles
}) => {
  // Obter todas as permissões disponíveis
  const getAllPermissions = (): string[] => {
    return PERMISSION_GROUPS.flatMap(group => 
      group.categories.flatMap(category => category.permissions)
    );
  };

  // Filtrar grupos por busca
  const getFilteredGroups = (): PermissionGroup[] => {
    if (!searchTerm) return PERMISSION_GROUPS;
    
    return PERMISSION_GROUPS.map(group => ({
      ...group,
      categories: group.categories.map(category => ({
        ...category,
        permissions: category.permissions.filter(permission =>
          permission.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.permissions.length > 0)
    })).filter(group => group.categories.length > 0);
  };

  // Estatísticas do role ativo
  const getActiveRoleStats = () => {
    const allPermissions = getAllPermissions();
    const rolePerms = rolePermissions[activeRole] || [];
    return {
      total: allPermissions.length,
      active: rolePerms.length,
      percentage: allPermissions.length > 0 ? Math.round((rolePerms.length / allPermissions.length) * 100) : 0
    };
  };

  // Verificar se todas as permissões estão selecionadas
  const allPermissions = getAllPermissions();
  const currentRolePermissions = rolePermissions[activeRole] || [];
  const allSelected = allPermissions.length > 0 && currentRolePermissions.length === allPermissions.length;
  const noneSelected = currentRolePermissions.length === 0;

  // Função para selecionar todas as permissões
  const selectAllPermissions = () => {
    allPermissions.forEach(permission => {
      if (!currentRolePermissions.includes(permission)) {
        onPermissionChange(activeRole, permission);
      }
    });
  };

  // Função para desmarcar todas as permissões
  const deselectAllPermissions = () => {
    currentRolePermissions.forEach(permission => {
      onPermissionChange(activeRole, permission);
    });
  };

  const stats = getActiveRoleStats();
  const filteredGroups = getFilteredGroups();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar com roles */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Roles do Sistema</h2>
          <div className="space-y-3">
            {availableRoles.map((role) => {
              const roleStats = {
                total: getAllPermissions().length,
                active: (rolePermissions[role.key] || []).length
              };
              
              return (
                <RoleTab
                  key={role.key}
                  role={role.key}
                  label={role.label}
                  description={role.description}
                  isActive={activeRole === role.key}
                  permissionCount={roleStats.active}
                  totalPermissions={roleStats.total}
                  hasChanges={hasUnsavedChanges(role.key)}
                  onClick={() => onRoleChange(role.key)}
                />
              );
            })}
          </div>
        </div>

        {/* Estatísticas do role ativo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Estatísticas</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
              <div className="text-sm text-gray-500">de {stats.total} permissões</div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            
            <div className="text-center text-sm text-gray-600">
              {stats.percentage}% configurado
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal - Permissões */}
      <div className="lg:col-span-3">
        {/* Botões Master de Seleção */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ações em Massa</h3>
                <p className="text-sm text-gray-500">Gerenciar todas as {allPermissions.length} permissões do role</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={selectAllPermissions}
                disabled={saving || allSelected}
                className={`
                  inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
                  ${allSelected 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Selecionar Todas ({allPermissions.length})</span>
                <span className="sm:hidden">Todas ({allPermissions.length})</span>
              </button>
              
              <button
                onClick={deselectAllPermissions}
                disabled={saving || noneSelected}
                className={`
                  inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
                  ${noneSelected 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-md'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Desmarcar Todas</span>
                <span className="sm:hidden">Limpar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.key} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header do grupo */}
              <div className={`bg-gradient-to-r ${group.gradient} p-6`}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <group.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{group.name}</h3>
                    <p className="text-white/80">{group.description}</p>
                  </div>
                  <div className="text-white/80 text-sm">
                    {group.categories.reduce((acc, cat) => acc + cat.permissions.length, 0)} permissões
                  </div>
                </div>
              </div>

              {/* Categorias do grupo */}
              <div className="p-6 space-y-6">
                {group.categories.map((category) => (
                  <PermissionCategory
                    key={category.key}
                    category={category}
                    activePermissions={rolePermissions[activeRole] || []}
                    onPermissionChange={(permission) => onPermissionChange(activeRole, permission)}
                    disabled={saving}
                    defaultExpanded={expandedGroups.includes(group.key)}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">Nenhuma permissão encontrada</div>
              <div className="text-gray-500 text-sm mt-2">Tente ajustar o termo de busca</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 