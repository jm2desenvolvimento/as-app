import React from 'react';

export default function UsersPermissions() {
  return (
    <div>
      <h2 className="text-xl font-bold text-blue-700 mb-6">Permissões por Usuário</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Usuário</th>
              <th className="py-2 px-4 text-left">Perfil</th>
              <th className="py-2 px-4 text-left">Permissões Customizadas</th>
              <th className="py-2 px-4 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 text-gray-400" colSpan={4}>Nenhuma permissão customizada ainda.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
