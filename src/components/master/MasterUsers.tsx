import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { User, Plus, Search, Eye, EyeOff, Pencil, Trash2, Shield } from 'lucide-react';
import { usePermission, PERMISSIONS } from '../../hooks/usePermission';
import { useIsMobile } from '../../hooks/useIsMobile';
import { PageHeader } from '../ui';
import Modal from '../common/Modal';

// Tipagem mínima para exibição (poderá ser expandida)
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string; // esperamos 'ADMIN'
  is_active?: boolean;
  city_id?: string | null;
  health_unit_id?: string | null;
  cpf?: string | null;
}

interface CityHall {
  id: string;
  name: string;
}

interface HealthUnit {
  id: string;
  name: string;
  city_hall_id: string;
}

export default function MasterUsers() {
  const { hasPermission } = usePermission();
  const isMobile = useIsMobile();

  const canView = hasPermission(PERMISSIONS.USER_VIEW);
  const canList = hasPermission(PERMISSIONS.USER_LIST);
  const canCreate = hasPermission(PERMISSIONS.USER_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.USER_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.USER_DELETE);
  const canManagePerm = hasPermission(PERMISSIONS.USER_PERMISSION_MANAGE);

  const [loading, setLoading] = useState<boolean>(true);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  // dicionários de nomes
  const [cityhalls, setCityhalls] = useState<CityHall[]>([]);
  const [units, setUnits] = useState<HealthUnit[]>([]);
  const [listsLoading, setListsLoading] = useState<boolean>(true);
  const [listsError, setListsError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Mensagem de ausência de permissão
  const noPermissionMsg = useMemo(() => !canView || !canList, [canView, canList]);

  const reloadAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/users');
      const data = Array.isArray(res.data) ? res.data : (res.data?.users ?? []);
      const onlyAdmins = (data as AdminUser[]).filter(u => u.role === 'ADMIN');
      setAdmins(onlyAdmins);
    } catch (err: any) {
      console.error('[MasterUsers] Erro ao carregar usuários:', err);
      setError('Não foi possível carregar a lista de usuários ADMIN.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (noPermissionMsg) return;
    reloadAdmins();
  }, [noPermissionMsg]);

  // Carrega prefeituras e unidades para mapear id -> nome
  useEffect(() => {
    let active = true;
    const loadLists = async () => {
      try {
        setListsLoading(true);
        setListsError(null);
        const [chRes, unRes] = await Promise.all([
          axios.get('/cityhall'),
          axios.get('/healthunit'),
        ]);
        if (!active) return;
        const ch = Array.isArray(chRes.data) ? chRes.data : (chRes.data?.items ?? []);
        const un = Array.isArray(unRes.data) ? unRes.data : (unRes.data?.items ?? []);
        setCityhalls(ch);
        setUnits(un);
      } catch (e) {
        if (!active) return;
        console.error('[MasterUsers] Erro ao carregar prefeituras/unidades:', e);
        setListsError('Não foi possível carregar nomes de Prefeituras/Unidades.');
      } finally {
        if (active) setListsLoading(false);
      }
    };
    loadLists();
    return () => { active = false; };
  }, []);

  const cityMap = useMemo(() => {
    const m: Record<string, string> = {};
    cityhalls.forEach(c => { if (c?.id) m[c.id] = c.name; });
    return m;
  }, [cityhalls]);

  const unitMap = useMemo(() => {
    const m: Record<string, string> = {};
    units.forEach(u => { if (u?.id) m[u.id] = u.name; });
    return m;
  }, [units]);

  // Lista filtrada conforme busca (nome ou e-mail)
  const filteredAdmins = useMemo(() => {
    const term = (search || '').trim().toLowerCase();
    if (!term) return admins;
    return admins.filter((u) =>
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term)
    );
  }, [admins, search]);

  // Handlers básicos (substituir por modais/fluxos reais quando necessário)
  const handleView = (user: AdminUser) => {
    console.log('[MasterUsers] visualizar', user.id);
    // TODO: abrir modal de visualização
  };
  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setShowEdit(true);
  };
  const handleManagePerm = (user: AdminUser) => {
    console.log('[MasterUsers] permissões', user.id);
    // TODO: abrir drawer/modal de permissões
  };
  const handleDelete = async (user: AdminUser) => {
    const ok = window.confirm('Confirma excluir este usuário?');
    if (!ok) return;
    try {
      await axios.delete(`/users/${user.id}`);
      await reloadAdmins();
    } catch (err: any) {
      console.error('[MasterUsers] erro ao excluir usuário', err);
      const msg = err?.response?.data?.message || 'Erro ao excluir usuário';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    }
  };

  if (noPermissionMsg) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          Você não tem permissão para visualizar esta página (user_view, user_list).
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-16">
      <PageHeader
        title="Usuários"
        subtitle="Gestão de usuários ADMIN vinculados a Prefeituras e, opcionalmente, a uma Unidade de Saúde"
        icon={User}
        className="mb-2 py-1 px-4 rounded-xl shadow bg-white border border-gray-100"
      />

      {/* Barra de ações: busca + novo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-10 mb-6 gap-4 animate-fade-in px-4">
        <div className="flex items-center w-full md:w-auto max-w-xl flex-1">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm bg-white shadow-sm placeholder-gray-400"
            />
          </div>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className={`flex items-center bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold animate-glow ${
              isMobile ? 'px-3 py-2 text-sm' : 'px-6 py-2 text-base'
            }`}
          >
            <Plus className={`${isMobile ? 'h-4 w-4 mr-1' : 'h-5 w-5 mr-2'}`} />
            Novo Usuário
          </button>
        )}
      </div>

      {/* Estado de erro */}
      {error && (
        <div className="mx-4 mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3">
          {error}
        </div>
      )}
      {listsError && (
        <div className="mx-4 mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3">
          {listsError}
        </div>
      )}
      {listsLoading && (
        <div className="mx-4 mb-4 text-gray-500 text-sm">Carregando prefeituras e unidades...</div>
      )}

      {/* Tabela */}
      <div className="mx-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto animate-fade-in">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="px-6 py-4 text-left font-bold tracking-wide">NOME</th>
              <th className="px-6 py-4 text-left font-bold tracking-wide">E-MAIL</th>
              <th className="px-6 py-4 text-left font-bold tracking-wide">PAPEL</th>
              <th className="px-6 py-4 text-left font-bold tracking-wide">PREFEITURA</th>
              <th className="px-6 py-4 text-left font-bold tracking-wide">UNIDADE DE SAÚDE</th>
              <th className="px-6 py-4 text-left font-bold tracking-wide">STATUS</th>
              <th className="px-6 py-4 text-center font-bold tracking-wide">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-12 text-center text-gray-400 text-lg" colSpan={7}>Carregando usuários...</td>
              </tr>
            ) : filteredAdmins.length === 0 ? (
              <tr>
                <td className="py-12 text-center text-gray-400 text-lg" colSpan={7}>
                  Nenhum ADMIN encontrado.
                </td>
              </tr>
            ) : (
              filteredAdmins.map((u, idx) => (
                <tr key={u.id} className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-all`}>
                  <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 text-gray-700">{u.email}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold uppercase">{u.role}</span></td>
                  <td className="px-6 py-4 text-gray-700">{u.city_id ? (cityMap[u.city_id] ?? '-') : '-'}</td>
                  <td className="px-6 py-4 text-gray-700">{u.health_unit_id ? (unitMap[u.health_unit_id] ?? '-') : '-'}</td>
                  <td className="px-6 py-4">
                    {u.is_active ? (
                      <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Ativo</span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-gray-200 text-gray-500 text-xs font-semibold">Inativo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {canView && (
                        <button
                          type="button"
                          onClick={() => handleView(u)}
                          className="p-1 text-blue-600 hover:text-blue-700 hover:scale-105 transition"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleEdit(u)}
                          className="p-1 text-blue-600 hover:text-blue-700 hover:scale-105 transition"
                          title="Editar"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      )}
                      {canManagePerm && (
                        <button
                          type="button"
                          onClick={() => handleManagePerm(u)}
                          className="p-1 text-slate-500 hover:text-slate-700 hover:scale-105 transition"
                          title="Permissões"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          className="p-1 text-red-600 hover:text-red-700 hover:scale-105 transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      {!canUpdate && !canManagePerm && !canDelete && (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Placeholder para criação (modal/drawer futuro) */}
      {showCreate && (
        <CreateAdminModal
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            await reloadAdmins();
            setShowCreate(false);
          }}
        />
      )}
      {showEdit && editingUser && (
        <EditAdminModal
          user={editingUser}
          onClose={() => setShowEdit(false)}
          onSaved={async () => {
            await reloadAdmins();
            setShowEdit(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

function CreateAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void | Promise<void>; }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cityId, setCityId] = useState('');
  const [healthUnitId, setHealthUnitId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityhalls, setCityhalls] = useState<CityHall[]>([]);
  const [units, setUnits] = useState<HealthUnit[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [chRes, unRes] = await Promise.all([
          axios.get('/cityhall'),
          axios.get('/healthunit'),
        ]);
        if (!active) return;
        setCityhalls(chRes.data || []);
        setUnits(unRes.data || []);
      } catch (e) {
        console.error('[CreateAdminModal] erro ao buscar listas', e);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const filteredUnits = useMemo(() => {
    if (!cityId) return [] as HealthUnit[];
    return units.filter(u => u.city_hall_id === cityId);
  }, [units, cityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Validações simples
    if (!name.trim()) return setError('Nome é obrigatório');
    if (!email.trim()) return setError('E-mail é obrigatório');
    if (!cpf.trim()) return setError('CPF é obrigatório');
    if (!password.trim() || password.length < 6) return setError('Senha deve ter ao menos 6 caracteres');
    if (confirmPassword !== password) return setError('As senhas não conferem');
    if (!cityId) return setError('Prefeitura é obrigatória para criar ADMIN');
    if (healthUnitId) {
      const unit = units.find(u => u.id === healthUnitId);
      if (unit && unit.city_hall_id !== cityId) {
        return setError('A unidade de saúde selecionada não pertence à Prefeitura escolhida');
      }
    }

    try {
      setSubmitting(true);
      await axios.post('/users', {
        name,
        email,
        cpf,
        password,
        role: 'ADMIN',
        city_id: cityId,
        health_unit_id: healthUnitId || undefined,
      });
      await onCreated();
    } catch (err: any) {
      console.error('[CreateAdminModal] erro ao criar usuário', err);
      const msg = err?.response?.data?.message || 'Erro ao criar usuário';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Novo Usuário ADMIN" size="full" className="max-w-3xl md:max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded p-2 text-sm">{error}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nome</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Nome completo" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">E-mail</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="email@exemplo.com" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">CPF</label>
            <input value={cpf} onChange={e=>setCpf(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Somente números" />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 pr-10"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Confirmar Senha</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e=>setConfirmPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 pr-10"
                  placeholder="Repita a senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Prefeitura (obrigatória)</label>
            <select value={cityId} onChange={e=>{ setCityId(e.target.value); setHealthUnitId(''); }} className="w-full border rounded-lg px-3 py-2">
              <option value="">Selecione...</option>
              {cityhalls.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Unidade de Saúde (opcional)</label>
            <select value={healthUnitId} onChange={e=>setHealthUnitId(e.target.value)} className="w-full border rounded-lg px-3 py-2" disabled={!cityId}>
              <option value="">Nenhuma</option>
              {filteredUnits.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancelar</button>
          <button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60">
            {submitting ? 'Salvando...' : 'Criar Usuário'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditAdminModal({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: () => void | Promise<void>; }) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [cpf, setCpf] = useState(user.cpf || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cityId, setCityId] = useState(user.city_id || '');
  const [healthUnitId, setHealthUnitId] = useState(user.health_unit_id || '');
  const [isActive, setIsActive] = useState<boolean>(user.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityhalls, setCityhalls] = useState<CityHall[]>([]);
  const [units, setUnits] = useState<HealthUnit[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [chRes, unRes] = await Promise.all([
          axios.get('/cityhall'),
          axios.get('/healthunit'),
        ]);
        if (!active) return;
        setCityhalls(chRes.data || []);
        setUnits(unRes.data || []);
      } catch (e) {
        console.error('[EditAdminModal] erro ao buscar listas', e);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const filteredUnits = useMemo(() => {
    if (!cityId) return [] as HealthUnit[];
    return units.filter(u => u.city_hall_id === cityId);
  }, [units, cityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Nome é obrigatório');
    if (!email.trim()) return setError('E-mail é obrigatório');
    if (!cpf.trim()) return setError('CPF é obrigatório');
    if (password && password.length < 6) return setError('Senha deve ter ao menos 6 caracteres');
    if (password && confirmPassword !== password) return setError('As senhas não conferem');
    if (!cityId) return setError('Prefeitura é obrigatória para ADMIN');
    if (healthUnitId) {
      const unit = units.find(u => u.id === healthUnitId);
      if (unit && unit.city_hall_id !== cityId) {
        return setError('A unidade de saúde selecionada não pertence à Prefeitura escolhida');
      }
    }

    try {
      setSubmitting(true);
      const payload: any = { name, email, cpf, city_id: cityId, is_active: isActive };
      if (healthUnitId) payload.health_unit_id = healthUnitId;
      if (password) payload.password = password;
      await axios.patch(`/users/${user.id}` , payload);
      await onSaved();
    } catch (err: any) {
      console.error('[EditAdminModal] erro ao atualizar usuário', err);
      const msg = err?.response?.data?.message || 'Erro ao atualizar usuário';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Editar Usuário ADMIN" size="full" className="max-w-3xl md:max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded p-2 text-sm">{error}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nome</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Nome completo" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">E-mail</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="email@exemplo.com" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">CPF</label>
            <input value={cpf} onChange={e=>setCpf(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Somente números" />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Senha (opcional)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 pr-10"
                  placeholder="Preencha para alterar"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Confirmar Senha</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e=>setConfirmPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 pr-10"
                  placeholder="Repita a senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Status</label>
            <div className="flex items-center gap-2">
              <input id="isActive" type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} />
              <label htmlFor="isActive" className="text-sm text-gray-700">Ativo</label>
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Prefeitura (obrigatória)</label>
            <select value={cityId} onChange={e=>{ setCityId(e.target.value); setHealthUnitId(''); }} className="w-full border rounded-lg px-3 py-2">
              <option value="">Selecione...</option>
              {cityhalls.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Unidade de Saúde (opcional)</label>
            <select value={healthUnitId} onChange={e=>setHealthUnitId(e.target.value)} className="w-full border rounded-lg px-3 py-2" disabled={!cityId}>
              <option value="">Nenhuma</option>
              {filteredUnits.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancelar</button>
          <button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60">
            {submitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
