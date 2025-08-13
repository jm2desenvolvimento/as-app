import { useState } from 'react';
import Users from './Users';
import Permissions from './Permissions';
import RolePermissions from './RolePermissions';
import UsersPermissions from './UsersPermissions';
import { Shield } from 'lucide-react';
import { PageHeader } from '../../ui';

const TABS = [
  { label: 'Usuários', value: 'users' },
  { label: 'Permissões', value: 'permissions' },
  { label: 'Permissões por Perfil', value: 'role_permissions' },
  { label: 'Permissões por Usuário', value: 'users_permissions' },
];

export default function ProfileAndPermissions() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="flex flex-col h-full w-full min-h-0 min-w-0">
      {/* Cabeçalho com padrão do PageHeader (mesmo de Doctors/Reports) */}
      <PageHeader
        title="Perfis e Permissões"
        subtitle="Gerencie perfis, permissões e acessos do sistema"
        icon={Shield}
        className="mb-8 py-1 px-4 rounded-xl shadow bg-white border border-gray-100"
      />
      {/* Tabs centralizadas */}
      <div className="flex justify-center mb-8 border-b border-blue-200">
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button
              key={tab.value}
              className={`px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 focus:outline-none ${
                activeTab === tab.value
                  ? 'bg-white border-x border-t border-blue-400 text-blue-700 -mb-px'
                  : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 min-w-0 bg-white rounded-lg shadow p-6 overflow-auto">
        {activeTab === 'users' && <Users />}
        {activeTab === 'permissions' && <Permissions />}
        {activeTab === 'role_permissions' && <RolePermissions />}
        {activeTab === 'users_permissions' && <UsersPermissions />}
      </div>
    </div>
  );
}
