import { useIsMobile } from '../../../hooks/useIsMobile';

export default function UsersPermissions() {
  const isMobile = useIsMobile();

  return (
    <div>
      <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-700 mb-6`}>Permissões por Usuário</h2>
      {isMobile ? (
        // Layout de cards para mobile
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="text-gray-400 text-center py-8">
              Nenhuma permissão customizada ainda.
            </div>
          </div>
        </div>
      ) : (
        // Layout de tabela para desktop
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
      )}
    </div>
  );
}
