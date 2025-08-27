import React, { useState, useEffect } from 'react';
import { Search, User, Crown, Shield, Stethoscope, Users as UsersIcon, AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { PERMISSION_GROUPS, PERMISSION_LABELS } from '../../../constants/permissionCategories';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  role: string;
  profile?: {
    name: string;
  };
  permissions: string[];
  specificPermissions: Record<string, boolean>;
}

interface PermissionBundle {
  specificPermissions: Record<string, boolean>;
  effectivePermissions: string[];
}

interface UserPermissionsDetails {
  user: User;
  rolePermissions: string[];
  permissions: PermissionBundle;
}

interface UserManagementProps {
  className?: string;
}

const ROLE_CONFIGS = {
  MASTER: { icon: Crown, color: 'purple', label: 'Master' },
  ADMIN: { icon: Shield, color: 'blue', label: 'Admin' },
  DOCTOR: { icon: Stethoscope, color: 'emerald', label: 'Médico' },
  PATIENT: { icon: UsersIcon, color: 'orange', label: 'Paciente' }
} as const;

const API_BASE = import.meta.env.VITE_API_URL;

export const UserManagement: React.FC<UserManagementProps> = ({ className = "" }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserPermissionsDetails | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Estados para permissões específicas do usuário
  const [userSpecificPermissions, setUserSpecificPermissions] = useState<Record<string, boolean>>({});
  const [originalSpecificPermissions, setOriginalSpecificPermissions] = useState<Record<string, boolean>>({});

  // Carregar lista de usuários
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_BASE}/rbac/users`, { headers });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar usuários' });
    } finally {
      setLoading(false);
    }
  };

  // Carregar detalhes e permissões do usuário
  const loadUserPermissions = async (userId: string) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_BASE}/permissionsandprofile/users/${userId}/permissions`, { headers });
      setUserDetails(response.data);
      setUserSpecificPermissions(response.data.permissions?.specificPermissions || {});
      setOriginalSpecificPermissions(response.data.permissions?.specificPermissions || {});
    } catch (error) {
      console.error('Erro ao carregar permissões do usuário:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar permissões do usuário' });
    }
  };

  // Salvar permissões específicas do usuário
  const saveUserPermissions = async () => {
    if (!selectedUser) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.put(`${API_BASE}/permissionsandprofile/users/${selectedUser.id}/permissions`, {
        permissions: userSpecificPermissions
      }, { headers });
      
      setOriginalSpecificPermissions({ ...userSpecificPermissions });
      setMessage({ type: 'success', text: 'Permissões do usuário salvas com sucesso!' });
      
      // Auto-hide success message
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar permissões do usuário' });
    } finally {
      setSaving(false);
    }
  };

  // Verificar se há mudanças não salvas
  const hasUnsavedChanges = (): boolean => {
    return JSON.stringify(userSpecificPermissions) !== JSON.stringify(originalSpecificPermissions);
  };

  // Alternar permissão específica do usuário
  const toggleUserPermission = (permission: string) => {
    const rolePermissions = userDetails?.rolePermissions || [];
    const isEnabledByRole = rolePermissions.includes(permission);
    const hasSpecificPermission = permission in userSpecificPermissions;
    const currentEnabled = hasSpecificPermission ? userSpecificPermissions[permission] : isEnabledByRole;

    const updatedPermissions = { ...userSpecificPermissions };
    
    if (hasSpecificPermission && ((isEnabledByRole && userSpecificPermissions[permission]) || (!isEnabledByRole && !userSpecificPermissions[permission]))) {
      delete updatedPermissions[permission];
    } else {
      updatedPermissions[permission] = !currentEnabled;
    }
    
    setUserSpecificPermissions(updatedPermissions);
  };

  // Obter estado efetivo da permissão
  const getPermissionState = (permission: string): 'role' | 'granted' | 'denied' | 'inactive' => {
    const rolePermissions = userDetails?.rolePermissions || [];
    const isEnabledByRole = rolePermissions.includes(permission);
    const hasSpecificPermission = permission in userSpecificPermissions;
    
    if (hasSpecificPermission) {
      return userSpecificPermissions[permission] ? 'granted' : 'denied';
    }
    
    return isEnabledByRole ? 'role' : 'inactive';
  };

  // Filtrar usuários por busca
  const filteredUsers = users.filter(user => {
    const searchTerm = userSearch.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchTerm) ||
      (user.profile?.name || '').toLowerCase().includes(searchTerm)
    );
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions(selectedUser.id);
    }
  }, [selectedUser]);

  // Auto-hide error messages
  useEffect(() => {
    if (message?.type === 'error') {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mensagens de feedback */}
      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Lista de Usuários */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-fit">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Usuários do Sistema</h3>
            
            {/* Busca */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar usuário..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Lista */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum usuário encontrado</p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const roleConfig = ROLE_CONFIGS[user.role as keyof typeof ROLE_CONFIGS];
                  const IconComponent = roleConfig?.icon || User;
                  
                  return (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                        selectedUser?.id === user.id
                          ? 'border-blue-300 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          selectedUser?.id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">
                            {user.profile?.name || user.email.split('@')[0]}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              selectedUser?.id === user.id 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {roleConfig?.label || user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Permissões do Usuário */}
        <div className="xl:col-span-3">
          {!selectedUser ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Selecione um usuário</h3>
              <p className="text-gray-500">
                Escolha um usuário da lista para gerenciar suas permissões específicas
              </p>
            </div>
          ) : !userDetails ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando permissões do usuário...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header do usuário */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                      <User className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {userDetails.user.profile?.name || userDetails.user.email.split('@')[0]}
                      </h2>
                      <p className="text-gray-600">{userDetails.user.email}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          Role: {ROLE_CONFIGS[userDetails.user.role as keyof typeof ROLE_CONFIGS]?.label || userDetails.user.role}
                        </span>
                        <span className="text-sm text-gray-500">
                          {userDetails.permissions.effectivePermissions.length} permissões ativas
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  {hasUnsavedChanges() && (
                    <button
                      onClick={saveUserPermissions}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Legenda */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Legenda:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Role (herdada)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Concedida especificamente</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Negada especificamente</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span>Inativa</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grupos de permissões */}
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.key} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className={`bg-gradient-to-r ${group.gradient} p-6`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <group.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{group.name}</h3>
                        <p className="text-white/80">{group.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {group.categories.map((category) => {
                      // Calcular estado das permissões desta categoria
                      const categoryPermissions = category.permissions.map(permission => ({
                        permission,
                        state: getPermissionState(permission)
                      }));

                      return (
                        <div key={category.key} className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${category.color}-100`}>
                              <category.icon className={`h-5 w-5 text-${category.color}-600`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{category.name}</h4>
                              <p className="text-sm text-gray-500">{category.description}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoryPermissions.map(({ permission, state }) => {
                              const label = PERMISSION_LABELS[permission] || permission;
                              
                              const stateConfig = {
                                role: { bg: 'bg-green-50 border-green-200', icon: 'bg-green-500', text: 'text-green-700' },
                                granted: { bg: 'bg-green-50 border-green-200', icon: 'bg-green-500', text: 'text-green-700' },
                                denied: { bg: 'bg-red-50 border-red-200', icon: 'bg-red-500', text: 'text-red-700' },
                                inactive: { bg: 'bg-gray-50 border-gray-200', icon: 'bg-gray-300', text: 'text-gray-500' }
                              };

                              const config = stateConfig[state];

                              return (
                                <button
                                  key={permission}
                                  onClick={() => toggleUserPermission(permission)}
                                  disabled={saving}
                                  className={`
                                    p-3 rounded-lg border-2 transition-all duration-200 text-left
                                    ${config.bg} hover:shadow-md transform hover:scale-105
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                  `}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h5 className={`font-medium text-sm ${config.text}`}>
                                        {label}
                                      </h5>
                                      <p className="text-xs text-gray-500 mt-1 font-mono">
                                        {permission}
                                      </p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full ${config.icon} flex items-center justify-center`}>
                                      {state === 'role' && <span className="text-white text-xs font-bold">R</span>}
                                      {state === 'granted' && <CheckCircle2 className="h-3 w-3 text-white" />}
                                      {state === 'denied' && <span className="text-white text-xs font-bold">×</span>}
                                      {state === 'inactive' && <span className="text-white text-xs font-bold">-</span>}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 