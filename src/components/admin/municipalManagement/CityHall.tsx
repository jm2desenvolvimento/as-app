import React, { useState } from 'react';
import { Landmark, Users, Building2, GraduationCap, Plus, Eye, Edit2, Trash2, Filter, Search } from 'lucide-react';
import { PageHeader } from '../../ui';
import { usePermission } from '../../../hooks/usePermission';
import Modal from '../../common/Modal';
import { validateCNPJ } from '../../../utils/validation';
import axios from 'axios';
import { useEffect } from 'react';

// Remover o array indicators e cards mockados

// colorMap removido por não estar em uso

const CityHall = () => {
  // Hooks devem estar aqui dentro
  const { hasPermission } = usePermission();
  const canCreate = hasPermission('city_hall_create');
  const canEdit = hasPermission('city_hall_update');
  const canDelete = hasPermission('city_hall_delete');
  const canView = hasPermission('city_hall_view');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    active: true,
  });
  const [errors, setErrors] = useState<any>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [viewCityHall, setViewCityHall] = useState<CityHall | null>(null);

  type CityHall = {
    id: number;
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    active: boolean;
    created_at: string;
    updated_at: string;
  };

  const [cityHalls, setCityHalls] = useState<CityHall[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar prefeituras do backend
  const fetchCityHalls = () => {
    setLoading(true);
    axios.get('/cityhall')
      .then(res => {
        if (Array.isArray(res.data)) {
          setCityHalls(res.data);
        } else if (Array.isArray(res.data.data)) {
          setCityHalls(res.data.data);
        } else {
          setCityHalls([]);
        }
      })
      .catch(() => setError('Erro ao buscar prefeituras'))
      .finally(() => setLoading(false));
  };

  // Buscar prefeituras ao carregar
  useEffect(() => {
    fetchCityHalls();
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm({
      name: '', cnpj: '', email: '', phone: '', address: '', city: '', state: '', zip_code: '', active: true
    });
    setErrors({});
    setEditId(null);
  };

  const handleEdit = (cityHall: CityHall) => {
    setEditId(cityHall.id);
    setForm({
      name: cityHall.name,
      cnpj: cityHall.cnpj,
      email: cityHall.email,
      phone: cityHall.phone,
      address: cityHall.address,
      city: cityHall.city,
      state: cityHall.state,
      zip_code: cityHall.zip_code,
      active: cityHall.active,
    });
    setIsModalOpen(true);
  };

  const handleView = (cityHall: CityHall) => {
    setViewCityHall(cityHall);
  };

  const closeViewModal = () => {
    setViewCityHall(null);
  };

  const validate = () => {
    const newErrors: any = {};
    if (!form.name || form.name.length < 3) newErrors.name = 'Nome obrigatório (mín. 3 letras)';
    if (!form.cnpj || !validateCNPJ(form.cnpj)) newErrors.cnpj = 'CNPJ inválido';
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'E-mail inválido';
    if (!form.phone || !/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(form.phone)) newErrors.phone = 'Telefone inválido';
    if (!form.address) newErrors.address = 'Endereço obrigatório';
    if (!form.city) newErrors.city = 'Cidade obrigatória';
    if (!form.state || form.state.length !== 2) newErrors.state = 'UF deve ter 2 letras';
    if (!form.zip_code || !/^\d{5}-?\d{3}$/.test(form.zip_code)) newErrors.zip_code = 'CEP inválido';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      setLoading(true);
      if (editId) {
        axios.put(`/cityhall/${editId}`, form)
          .then(() => {
            handleCloseModal();
            fetchCityHalls();
            setEditId(null);
          })
          .catch(() => setError('Erro ao editar prefeitura'))
          .finally(() => setLoading(false));
      } else {
        axios.post('/cityhall', form)
          .then(() => {
            handleCloseModal();
            fetchCityHalls();
          })
          .catch(() => setError('Erro ao salvar prefeitura'))
          .finally(() => setLoading(false));
      }
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId == null) return;
    setDeleteLoading(true);
    axios.delete(`/cityhall/${deleteId}`)
      .then(() => {
        setDeleteId(null);
        fetchCityHalls();
      })
      .catch(() => setError('Erro ao excluir prefeitura'))
      .finally(() => setDeleteLoading(false));
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  // Substituir cityHalls.filter por cityHalls do backend
  const filteredCityHalls = Array.isArray(cityHalls)
    ? cityHalls.filter(row =>
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        row.city.toLowerCase().includes(search.toLowerCase()) ||
        row.email.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-16">
      {/* Header visual padrão */}
      <PageHeader
        title="Gestão de Prefeituras"
        subtitle="Gerencie as prefeituras cadastradas"
        icon={Landmark}
        className="mb-2 py-1 px-4 rounded-xl shadow bg-white border border-gray-100"
      />

      {/* Indicadores modernos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {/* Card dinâmico de prefeituras */}
        <div
          className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-blue-500`}
          style={{ borderLeftWidth: 6 }}
        >
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 mr-4`}>
            <Landmark className={`h-7 w-7 text-blue-500`} />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Prefeituras Cadastradas</div>
            <div className="text-2xl font-bold text-gray-900">{cityHalls.length}</div>
          </div>
        </div>
        {/* Card Profissionais Ativos */}
        <div className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-green-500`} style={{ borderLeftWidth: 6 }}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-green-50 mr-4`}>
            <Users className={`h-7 w-7 text-green-500`} />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Profissionais Ativos</div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </div>
        </div>
        {/* Card Unidades de Saúde */}
        <div className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-purple-500`} style={{ borderLeftWidth: 6 }}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-purple-50 mr-4`}>
            <Building2 className={`h-7 w-7 text-purple-500`} />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Unidades de Saúde</div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </div>
        </div>
        {/* Card Especialidades */}
        <div className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-yellow-400`} style={{ borderLeftWidth: 6 }}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-50 mr-4`}>
            <GraduationCap className={`h-7 w-7 text-yellow-500`} />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Especialidades</div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </div>
        </div>
      </div>

      {/* Barra de busca e botão */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-10 mb-6 gap-4 animate-fade-in">
        <div className="flex items-center w-full md:w-auto max-w-xl flex-1">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Buscar prefeituras..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm bg-white shadow-sm placeholder-gray-400"
            />
          </div>
          <button className="px-3 py-2 bg-blue-50 border border-l-0 border-blue-200 rounded-r-xl hover:bg-blue-100 transition flex items-center shadow-sm">
            <Filter className="h-4 w-4 text-blue-500" />
          </button>
        </div>
        {canCreate && (
          <button className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold text-base animate-glow" onClick={handleOpenModal}>
            <Plus className="h-5 w-5 mr-2" />
            Nova Prefeitura
          </button>
        )}
      </div>

      {/* Tabela moderna */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto animate-fade-in">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="px-6 py-4 text-left font-bold tracking-wide">NOME</th>
              <th className="px-6 py-4 text-left font-bold tracking-wide">CIDADE/UF</th>
              <th className="px-6 py-4 text-left font-bold tracking-wide">CONTATO</th>
              <th className="px-6 py-4 text-center font-bold tracking-wide">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400 text-lg">Carregando...</td></tr>
            ) : filteredCityHalls.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400 text-lg">Nenhuma prefeitura encontrada.</td></tr>
            ) : (
              filteredCityHalls.map((row, idx) => (
                <tr key={row.id} className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-all`}>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                  <td className="px-6 py-4 text-gray-700">{row.city}</td>
                  <td className="px-6 py-4 text-gray-700">{row.email}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {canView && (
                        <button
                          className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
                          title="Visualizar"
                          onClick={() => handleView(row)}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          className="p-2 rounded-lg hover:bg-yellow-100 text-yellow-600 transition"
                          title="Editar"
                          onClick={() => handleEdit(row)}
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

      {error && <div className="text-red-500 text-center mt-2">{error}</div>}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editId ? "Editar Prefeitura" : "Nova Prefeitura"} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome - linha inteira */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input name="name" value={form.name} onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400"
                placeholder="Digite o nome da prefeitura" />
              {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
            </div>
            {/* CNPJ e E-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-700">CNPJ</label>
              <input name="cnpj" value={form.cnpj} onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400"
                placeholder="00.000.000/0000-00" />
              {errors.cnpj && <span className="text-red-500 text-xs">{errors.cnpj}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input name="email" value={form.email} onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400"
                placeholder="contato@prefeitura.gov.br" />
              {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
            </div>
            {/* Telefone, UF, Cidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400"
                placeholder="(99) 99999-9999" />
              {errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">UF</label>
              <input name="state" value={form.state} onChange={handleChange} maxLength={2}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400 uppercase"
                placeholder="SP" />
              {errors.state && <span className="text-red-500 text-xs">{errors.state}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cidade</label>
              <input name="city" value={form.city} onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400"
                placeholder="Digite a cidade" />
              {errors.city && <span className="text-red-500 text-xs">{errors.city}</span>}
            </div>
            {/* Endereço - linha inteira */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Endereço</label>
              <input name="address" value={form.address} onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400"
                placeholder="Rua, número, bairro" />
              {errors.address && <span className="text-red-500 text-xs">{errors.address}</span>}
            </div>
            {/* CEP e Ativo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">CEP</label>
              <input name="zip_code" value={form.zip_code} onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400"
                placeholder="00000-000" />
              {errors.zip_code && <span className="text-red-500 text-xs">{errors.zip_code}</span>}
            </div>
            <div className="flex items-center gap-2 mt-7">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="rounded border-gray-300 focus:ring-blue-500" />
              <label className="text-sm font-medium text-gray-700">Ativo</label>
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
              {editId ? 'Salvar Alterações' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal isOpen={deleteId !== null} onClose={cancelDelete} title="Excluir Prefeitura" size="sm">
        <div className="text-gray-800 text-base mb-4">Deseja realmente excluir esta prefeitura?</div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={cancelDelete} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
          <button onClick={confirmDelete} disabled={deleteLoading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-60">
            {deleteLoading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </Modal>

      {/* Modal de visualização */}
      <Modal isOpen={!!viewCityHall} onClose={closeViewModal} title="Detalhes da Prefeitura" size="xl">
        {viewCityHall && (
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input value={viewCityHall.name} disabled className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-100 text-base px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                <input value={viewCityHall.cnpj} disabled className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-100 text-base px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input value={viewCityHall.email} disabled className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-100 text-base px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input value={viewCityHall.phone} disabled className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-100 text-base px-4 py-2" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                <input value={viewCityHall.address} disabled className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-100 text-base px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cidade</label>
                <input value={viewCityHall.city} disabled className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-100 text-base px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">UF</label>
                <input value={viewCityHall.state} disabled className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-100 text-base px-4 py-2" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">CEP</label>
                <input value={viewCityHall.zip_code} disabled className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-100 text-base px-4 py-2" />
              </div>
              <div className="flex items-center gap-2 mt-6 col-span-1 md:col-span-2">
                <input type="checkbox" checked={viewCityHall.active} disabled className="rounded border-gray-300" />
                <label className="text-sm font-medium text-gray-700">Ativo</label>
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button type="button" onClick={closeViewModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Fechar</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Animações utilitárias */}
      <style>{`
        .animate-fade-in {
          animation: fadeInUp 0.7s cubic-bezier(.39,.575,.565,1.000) both;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: none; }
        }
        .animate-glow {
          box-shadow: 0 0 0 0 rgba(59,130,246,0.5);
          animation: glowPulse 2s infinite alternate;
        }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.15); }
          100% { box-shadow: 0 0 16px 4px rgba(59,130,246,0.25); }
        }
      `}</style>
    </div>
  );
};

export default CityHall;
