import { useEffect, useState } from 'react';
import { User as UserIcon, Plus } from 'lucide-react';
import axios from 'axios';
import { useIsMobile } from '../../../hooks/useIsMobile';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL;

export default function Users() {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_BASE}/users`, { headers });
        setUsers(res.data);
      } catch (err) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <div className={`flex items-center ${isMobile ? 'flex-col space-y-3' : 'justify-between'} mb-6`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-700 flex items-center gap-2`}>
          <UserIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-blue-400`} /> Usuários do Sistema
        </h2>
        <button className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow flex items-center ${
          isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'
        }`}>
          <Plus className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
          Novo Usuário
        </button>
      </div>
      {isMobile ? (
        // Layout de cards para mobile
        <div className="space-y-4">
          {loading ? (
            <div className="text-gray-400 text-center py-8">Carregando usuários...</div>
          ) : users.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              Nenhum usuário cadastrado ainda.<br />
              <span className="text-blue-500">Clique em "Novo Usuário" para começar.</span>
            </div>
          ) : (
            users.map(user => (
              <div key={user.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{user.name}</h3>
                    <p className="text-gray-600 text-xs">{user.email}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold uppercase">
                      {user.role}
                    </span>
                    {user.is_active ? (
                      <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Ativo</span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-gray-200 text-gray-500 text-xs font-semibold">Inativo</span>
                    )}
                  </div>
                </div>
                <div className="text-gray-400 text-xs">Ações</div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Layout de tabela para desktop
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left">Nome</th>
                <th className="py-2 px-4 text-left">E-mail</th>
                <th className="py-2 px-4 text-left">Perfil</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-4 px-4 text-gray-400 text-center" colSpan={5}>Carregando usuários...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="py-4 px-4 text-gray-400 text-center" colSpan={5}>
                    Nenhum usuário cadastrado ainda.<br />
                    <span className="text-blue-500">Clique em "Novo Usuário" para começar.</span>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="py-2 px-4">{user.name}</td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold uppercase">{user.role}</span>
                    </td>
                    <td className="py-2 px-4">
                      {user.is_active ? (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Ativo</span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-gray-200 text-gray-500 text-xs font-semibold">Inativo</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {/* Botões de ação (editar, excluir, etc) serão implementados depois */}
                      <span className="text-gray-400">Ações</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
