import { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Search, CheckCircle2 } from 'lucide-react';
import { useIsMobile } from '../../../hooks/useIsMobile';

const API_BASE = import.meta.env.VITE_API_URL;
const ROLES = [
  { value: 'MASTER', label: 'Master', color: 'bg-purple-500' },
  { value: 'ADMIN', label: 'Administrador', color: 'bg-blue-500' },
  { value: 'DOCTOR', label: 'Médico', color: 'bg-green-500' },
  { value: 'PATIENT', label: 'Paciente', color: 'bg-gray-500' },
];

function groupByResource(perms: any[]) {
  const groups: Record<string, any[]> = {};
  perms.forEach(p => {
    const group = p.resource || 'Outros';
    if (!groups[group]) groups[group] = [];
    groups[group].push(p);
  });
  return groups;
}

export default function RolePermissions() {
  const isMobile = useIsMobile();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(ROLES[0].value);
  const [search, setSearch] = useState('');
  const [localPerms, setLocalPerms] = useState<string[]>([]);
  const [originalPerms, setOriginalPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Atualiza permissões locais ao trocar de perfil
    setLocalPerms(rolePermissions[activeRole] || []);
    setOriginalPerms(rolePermissions[activeRole] || []);
  }, [activeRole, rolePermissions]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Buscar todas as permissões
      const permsRes = await axios.get(`${API_BASE}/permissions`, { headers });
      setPermissions(permsRes.data);
      // Buscar permissões de cada role
      const rolePerms: Record<string, string[]> = {};
      for (const role of ROLES) {
        const res = await axios.get(`${API_BASE}/role-permissions?role=${role.value}`, { headers });
        rolePerms[role.value] = res.data.map((rp: any) => rp.permission_id || rp.permission?.id || rp.permission);
      }
      setRolePermissions(rolePerms);
    } catch (err) {
      setPermissions([]);
      setRolePermissions({});
    } finally {
      setLoading(false);
    }
  };

  const activeRoleLabel = ROLES.find(r => r.value === activeRole)?.label || activeRole;
  // Agrupamento por resource/categoria
  const filteredPerms = permissions.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );
  const grouped = groupByResource(filteredPerms);
  const totalCount = permissions.length;
  const checkedCount = localPerms.length;
  const progress = totalCount ? Math.round((checkedCount / totalCount) * 100) : 0;
  const hasChanges = JSON.stringify(localPerms.sort()) !== JSON.stringify(originalPerms.sort());

  const togglePermission = (permId: string) => {
    setLocalPerms(perms =>
      perms.includes(permId)
        ? perms.filter(id => id !== permId)
        : [...perms, permId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(`${API_BASE}/role-permissions`, {
        role: activeRole,
        permissions: localPerms,
      }, { headers });
      await fetchData();
    } catch (err) {
      // Trate erros conforme necessário
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-700 mb-6 text-center`}>Permissões por Perfil</h2>
      {/* Seleção de perfil */}
      <div className={`flex ${isMobile ? 'flex-wrap gap-2' : 'gap-4'} justify-center mb-8`}>
        {ROLES.map(role => (
          <button
            key={role.value}
            className={`flex flex-col items-center rounded-lg border-2 transition-all font-semibold shadow-sm focus:outline-none ${
              isMobile ? 'px-2 py-2 text-xs min-w-[80px]' : 'px-4 py-3 text-sm min-w-[110px]'
            } ${
              activeRole === role.value
                ? `${role.color} border-blue-700 text-white shadow-lg scale-105`
                : 'bg-white border-gray-200 text-blue-800 hover:border-blue-400'
            }`}
            onClick={() => setActiveRole(role.value)}
          >
            <Shield className={`${isMobile ? 'w-4 h-4 mb-1' : 'w-6 h-6 mb-1'}`} />
            <span>{isMobile ? role.label.split(' ')[0] : role.label}</span>
          </button>
        ))}
      </div>
      {/* Painel de permissões do perfil selecionado */}
      <div className={`w-full max-w-7xl mx-auto bg-white rounded-xl shadow ${
        isMobile ? 'p-4' : 'p-10'
      }`}>
        <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'gap-4'} mb-4`}>
          <div className={`flex items-center ${isMobile ? 'space-x-2' : 'gap-4'}`}>
            <Shield className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'} text-blue-400`} />
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold`}>{activeRoleLabel}</h3>
          </div>
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 flex items-center gap-1`}>
            <CheckCircle2 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-green-500`} />
            {checkedCount} de {totalCount} permissões
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded mb-4">
          <div className="h-2 bg-blue-500 rounded transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} mb-4`}>
          <Search className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
          <input
            className={`w-full border rounded ${
              isMobile ? 'px-2 py-1 text-sm' : 'px-3 py-2'
            }`}
            placeholder="Buscar permissão..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="text-gray-400">Carregando permissões...</div>
        ) : (
          Object.keys(grouped).length === 0 ? (
            <div className="text-gray-400">Nenhuma permissão encontrada.</div>
          ) : (
            Object.entries(grouped).map(([resource, perms]) => (
              <div key={resource} className="mb-6">
                <div className={`font-semibold text-blue-700 mb-2 border-b pb-1 ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>{resource}</div>
                <div className={`grid gap-2 ${
                  isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                }`}>
                  {perms.map(perm => (
                    <label key={perm.id} className={`flex items-center gap-2 py-1 cursor-pointer select-none ${
                      isMobile ? 'text-sm' : ''
                    }`}>
                      <span className={`relative inline-block ${isMobile ? 'w-8 mr-1' : 'w-10 mr-2'} align-middle select-none transition duration-200`}>
                        <input
                          type="checkbox"
                          checked={localPerms.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className={`absolute block rounded-full bg-white border-2 appearance-none cursor-pointer ${
                            isMobile ? 'w-4 h-4' : 'w-6 h-6'
                          }`}
                        />
                        <span className={`block rounded-full transition-colors ${
                          isMobile ? 'w-8 h-5' : 'w-10 h-6'
                        } ${localPerms.includes(perm.id) ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                        <span className={`dot absolute top-1 rounded-full bg-white shadow transition ${
                          isMobile 
                            ? 'left-0.5 w-3 h-3' 
                            : 'left-1 w-4 h-4'
                        } ${localPerms.includes(perm.id) ? `translate-x-${isMobile ? '3' : '4'} bg-blue-600` : ''}`}></span>
                      </span>
                      <span className={isMobile ? 'text-xs' : ''}>{perm.name}</span>
                      <span className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>{perm.description}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )
        )}
      </div>
      {/* Botão flutuante salvar */}
      {hasChanges && (
        <button
          className={`fixed bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg z-50 transition-all ${
            isMobile 
              ? 'bottom-4 right-4 px-4 py-3 text-sm' 
              : 'bottom-8 right-8 px-8 py-4 text-lg'
          }`}
          onClick={handleSave}
          disabled={saving}
        >
          Salvar
        </button>
      )}
    </div>
  );
}
