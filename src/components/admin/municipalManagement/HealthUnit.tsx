import React, { useState, useEffect } from 'react';
import { Building2, Plus, Eye, Edit2, Trash2, Filter, Search, LayoutGrid, Table, MapPin, Phone, Landmark } from 'lucide-react';
import Modal from '../../common/Modal';
import { PageHeader } from '../../ui';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../../../hooks/usePermission';
import axios from 'axios';

// Interface para unidade de saúde
interface HealthUnit {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
  email?: string;
  city_hall_id: string;
  city_hall?: { id: string; name: string };
  created_at: string;
  updated_at: string;
}
type SortableField = keyof Pick<HealthUnit, 'name' | 'city' | 'state' | 'zip_code' | 'created_at' | 'updated_at'>;

const HealthUnit = () => {
  // Estado das unidades de saúde (inicia vazio)
  const [units, setUnits] = useState<HealthUnit[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [cidade, setCidade] = useState('');
  const [status, setStatus] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'map'>('table');
  const [density, setDensity] = useState<'normal'>('normal');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortableField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado do formulário
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    city_hall_id: '',
  });
  const [cityHalls, setCityHalls] = useState([]);
  const [errors, setErrors] = useState<any>({});

  // Buscar prefeituras para o select
  useEffect(() => {
    // Substitua por chamada real à API se necessário
    axios.get('/cityhall')
      .then(res => setCityHalls(Array.isArray(res.data) ? res.data : res.data.data || []));
  }, []);

  // Buscar unidades de saúde da API ao carregar
  useEffect(() => {
    axios.get('/healthunit')
      .then(res => setUnits(Array.isArray(res.data) ? res.data : res.data.data || []));
  }, []);

  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const canView = hasPermission('health_unit_view');
  const canEdit = hasPermission('health_unit_update');
  const canDelete = hasPermission('health_unit_delete');

  // Helpers
  const refreshUnits = async () => {
    const res = await axios.get('/healthunit');
    setUnits(Array.isArray(res.data) ? res.data : res.data.data || []);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', address: '', city: '', state: '', zip_code: '', phone: '', email: '', city_hall_id: '' });
    setIsModalOpen(true);
  };

  const openEdit = (u: HealthUnit) => {
    setEditingId(u.id);
    setForm({
      name: u.name,
      address: u.address,
      city: u.city,
      state: u.state,
      zip_code: u.zip_code,
      phone: u.phone || '',
      email: u.email || '',
      city_hall_id: u.city_hall_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta unidade?')) return;
    await axios.delete(`/healthunit/${id}`);
    await refreshUnits();
  };

  // Função para filtrar, ordenar e paginar unidades
  const getFilteredUnits = () => {
    let result = [...units];
    // Busca
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter(u => {
        const haystack = [
          u.name,
          u.address,
          u.city,
          u.state,
          u.zip_code,
          u.phone || '',
          u.email || '',
          u.city_hall?.name || '',
        ].join(' ').toLowerCase();
        return haystack.includes(term);
      });
    }
    // Filtro cidade
    if (cidade) {
      result = result.filter(u => u.city.toLowerCase().includes(cidade.toLowerCase()));
    }
    // Filtro status (mock: todos ativos)
    if (status) {
      result = result.filter(u => status === 'ativo'); // todos ativos no mock
    }
    // Ordenação
    result.sort((a, b) => {
      const aValue = String(a[sortField] ?? '').toLowerCase();
      const bValue = String(b[sortField] ?? '').toLowerCase();
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    // Paginação
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return result.slice(start, end);
  };
  const filteredUnits = getFilteredUnits();
  const totalFiltered = (() => {
    let result = [...units];
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter(u => {
        const haystack = [
          u.name,
          u.address,
          u.city,
          u.state,
          u.zip_code,
          u.phone || '',
          u.email || '',
          u.city_hall?.name || '',
        ].join(' ').toLowerCase();
        return haystack.includes(term);
      });
    }
    if (cidade) result = result.filter(u => u.city.toLowerCase().includes(cidade.toLowerCase()));
    if (status) result = result.filter(u => status === 'ativo');
    return result.length;
  })();

  // Handler de submit do formulário do modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // city_hall_id já é string (UUID), não converter
      const payload = { ...form };
      if (editingId) {
        await axios.put(`/healthunit/${editingId}`, payload);
      } else {
        await axios.post('/healthunit', payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setForm({
        name: '', address: '', city: '', state: '', zip_code: '', phone: '', email: '', city_hall_id: ''
      });
      // Recarregar lista
      await refreshUnits();
    } catch (err) {
      alert('Erro ao salvar unidade de saúde.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-16">
      {/* Header visual */}
      <PageHeader
        title="Gestão de Unidades de Saúde"
        subtitle="Gerencie as unidades de saúde cadastradas"
        icon={Building2}
        className="mb-2 py-1 px-4 rounded-xl shadow bg-white border border-gray-100"
      />
      {canView && (
        <>
      {/* Cards de indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-blue-500" style={{ borderLeftWidth: 6 }}>
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 mr-4">
            <Building2 className="h-7 w-7 text-blue-500" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Unidades Cadastradas</div>
            <div className="text-2xl font-bold text-gray-900">{units.length}</div>
          </div>
        </div>
        {/* Outros cards podem ser adicionados aqui */}
      </div>

      {/* Barra de busca, filtros e visualização */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-10 mb-6 gap-4 animate-fade-in">
        <div className="flex items-center w-full md:w-auto max-w-xl flex-1 gap-2">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Buscar unidades de saúde..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm bg-white shadow-sm placeholder-gray-400"
            />
          </div>
          <button className="px-3 py-2 bg-blue-50 border border-l-0 border-blue-200 rounded-r-xl hover:bg-blue-100 transition flex items-center shadow-sm" onClick={() => setShowFilters(v => !v)}>
            <Filter className="h-4 w-4 text-blue-500" />
          </button>
          {/* Toggle de visualização cards/tabela */}
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-blue-50 text-blue-600 shadow' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Visualizar em cards"
            >
              <LayoutGrid className="h-6 w-6" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-blue-50 text-blue-600 shadow' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Visualizar em tabela"
            >
              <Table className="h-6 w-6" />
            </button>
          </div>
        </div>
        <button
          className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold text-base animate-glow"
          onClick={openCreate}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Unidade de Saúde
        </button>
      </div>
      {/* Filtros avançados (painel dropdown) */}
      {showFilters && (
        <div className="bg-white border border-blue-100 rounded-xl shadow-md p-4 mb-4 flex flex-wrap gap-4 items-center animate-fade-in">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cidade</label>
            <input value={cidade} onChange={e => setCidade(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm" placeholder="Filtrar por cidade" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm">
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          {/* Outros filtros podem ser adicionados aqui */}
        </div>
      )}
      {/* Paginação (sem densidade) */}
      <div className="flex items-center justify-end mt-4">
        <div className="flex gap-2 items-center">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-blue-100 disabled:opacity-50">Anterior</button>
          <span className="text-xs text-gray-500">Página {currentPage}</span>
          <button onClick={() => setCurrentPage(p => (currentPage * itemsPerPage < totalFiltered ? p + 1 : p))} disabled={currentPage * itemsPerPage >= totalFiltered} className="px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-blue-100 disabled:opacity-50">Próxima</button>
        </div>
      </div>
      {/* Visualização cards/tabela/mapa */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto animate-fade-in">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="px-6 py-4 text-left font-bold tracking-wide cursor-pointer" onClick={() => { setSortField('name'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}>NOME</th>
                <th className="px-6 py-4 text-left font-bold tracking-wide cursor-pointer" onClick={() => { setSortField('city'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}>CIDADE/UF</th>
                <th className="px-6 py-4 text-left font-bold tracking-wide">CONTATO</th>
                <th className="px-6 py-4 text-center font-bold tracking-wide">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 text-lg">
                    Nenhuma unidade encontrada.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((row, idx) => (
                  <tr key={row.id} className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-all ${density === 'compact' ? 'text-xs py-2' : density === 'comfortable' ? 'text-base py-6' : 'text-sm py-4'}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 text-gray-700">{row.city}/{row.state}</td>
                    <td className="px-6 py-4 text-gray-700">{[row.phone, row.email].filter(Boolean).join(" / ") || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                            {canView && (
                              <button
                                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
                                title="Visualizar"
                                onClick={() => navigate(`/admin/municipal-management/health-unit/${row.id}`)}
                              >
                          <Eye className="h-5 w-5" />
                        </button>
                            )}
                            {canEdit && (
                              <button
                                className="p-2 rounded-lg hover:bg-yellow-100 text-yellow-600 transition"
                                title="Editar"
                                onClick={() => openEdit(row)}
                              >
                          <Edit2 className="h-5 w-5" />
                        </button>
                            )}
                            {canDelete && (
                              <button
                                className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
                                title="Excluir"
                                onClick={() => handleDelete(row.id)}
                              >
                          <Trash2 className="h-5 w-5" />
                        </button>
                            )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {filteredUnits.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 text-lg py-12">Nenhuma unidade encontrada.</div>
          ) : (
            filteredUnits.map(unit => (
              <div key={unit.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 min-w-[300px] relative overflow-hidden" style={{ borderTop: '6px solid #22c55e' }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-xl text-gray-900">{unit.name}</span>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Ativo</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  {unit.address}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Phone className="h-4 w-4 text-blue-400" />
                  {unit.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                  <Landmark className="h-4 w-4 text-blue-400" />
                  Prefeitura de {unit.city_hall?.name || '-'}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">Médicos</div>
                    <div className="text-lg font-bold text-blue-600">—</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">Pacientes</div>
                    <div className="text-lg font-bold text-purple-600">—</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">Escalas</div>
                    <div className="text-lg font-bold text-yellow-600">—</div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium flex items-center gap-1 hover:bg-blue-100"
                    onClick={() => navigate(`/admin/municipal-management/health-unit/${unit.id}`)}
                  >
                    <Eye className="h-4 w-4" />Detalhes
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-yellow-50 text-yellow-700 font-medium flex items-center gap-1 hover:bg-yellow-100"><Edit2 className="h-4 w-4" />Editar</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {viewMode === 'map' && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center text-gray-400 text-lg mt-4">
          Mapa das unidades (em breve)
        </div>
          )}
        </>
      )}
      {!canView && (
        <div className="text-center text-gray-400 text-lg py-12">Você não tem permissão para visualizar as unidades de saúde.</div>
      )}

      {/* Modais (cadastro/edição, visualização, exclusão) podem ser adicionados aqui */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingId(null); }} title={editingId ? 'Editar Unidade de Saúde' : 'Nova Unidade de Saúde'} size="xl">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome *</label>
              <input name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400" placeholder="Digite o nome da unidade" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Endereço *</label>
              <input name="address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400" placeholder="Rua, número, bairro" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cidade *</label>
              <input name="city" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400" placeholder="Cidade" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">UF *</label>
              <input name="state" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} maxLength={2} required className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400 uppercase" placeholder="UF" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CEP *</label>
              <input name="zip_code" value={form.zip_code} onChange={e => setForm(f => ({ ...f, zip_code: e.target.value }))} required className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400" placeholder="00000-000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input name="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400" placeholder="(99) 99999-9999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input name="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400" placeholder="contato@unidade.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prefeitura *</label>
              <select name="city_hall_id" value={form.city_hall_id} onChange={e => setForm(f => ({ ...f, city_hall_id: e.target.value }))} required className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2">
                <option value="">Selecione a prefeitura</option>
                {cityHalls.map((ch: any) => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">{editingId ? 'Atualizar' : 'Salvar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HealthUnit;
