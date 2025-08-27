import React, { useState, useEffect } from 'react';
import { User, Plus, Eye, Edit2, Trash2, Search, EyeOff, MapPin, Building2, UserCheck, Phone, Mail, Settings } from 'lucide-react';
import Modal from './Modal';
import { PageHeader } from '../ui';
import { usePermission } from '../../hooks/usePermission';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

interface Patient {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    name: string;
    birth_date: string;
    gender: string;
    cpf?: string;
    sus_card?: string;
    profile_phones?: Array<{
      id: string;
      phone: string;
      phone_type: string;
      is_primary: boolean;
    }>;
    profile_emails?: Array<{
      id: string;
      email: string;
      is_primary: boolean;
    }>;
    profile_addresses?: Array<{
      id: string;
      address: string;
      number: string;
      complement?: string;
      district: string;
      city: string;
      state: string;
      zip_code: string;
      address_type: string;
      is_primary: boolean;
    }>;
  };
}

const Patients = () => {
  const { hasPermission } = usePermission();
  const { user } = useAuthStore();
  const canCreate = hasPermission('patient_create');
  const canEdit = hasPermission('patient_update');
  const canDelete = hasPermission('patient_delete');
  const canView = hasPermission('patient_view');

  // ✅ DEBUG: Log das permissões
  console.log('🔐 [Patients] Permissões do usuário:', {
    user: user?.email,
    role: user?.role,
    permissions: user?.permissions,
    canCreate,
    canEdit,
    canDelete,
    canView
  });

  // ✅ DEBUG: Verificar se o usuário está logado
  console.log('🔐 [Patients] Estado de autenticação:', {
    isLoggedIn: !!user,
    token: !!localStorage.getItem('token'),
    userPermissions: user?.permissions?.length || 0
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // const [form, setForm] = useState({
  //   name: '',
  //   email: '',
  //   phone: '',
  //   birth_date: '',
  // }); // Removido pois não está sendo usado
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);

  // ✅ NOVOS ESTADOS PARA VINCULAÇÃO TERRITORIAL
  const [cityHalls, setCityHalls] = useState<any[]>([]);
  const [healthUnits, setHealthUnits] = useState<any[]>([]);
  const [selectedCityHall, setSelectedCityHall] = useState('');
  const [selectedHealthUnit, setSelectedHealthUnit] = useState('');

  // Novo estado para etapa do modal
  const [modalStep, setModalStep] = useState<number>(1);
  // Helper para evitar TS2367 dentro de ramos onde modalStep é estreitado
  const isStep = (s: number) => modalStep === s;
  
  // Type assertion para resolver problemas de tipo - forçar number
  const currentModalStep = modalStep as number;
  
  // Helper functions para cada etapa para evitar problemas de tipo
  const isStep1 = () => currentModalStep === 1;
  const isStep2 = () => currentModalStep === 2;
  const isStep3 = () => currentModalStep === 3;
  const isStep4 = () => currentModalStep === 4;
  

  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
  });
  const [userErrors, setUserErrors] = useState<any>({});

  // Estado para etapa 2
  const [profileForm, setProfileForm] = useState({
    name: '',
    birth_date: '',
    gender: '',
    sus_card: '',
  });
  const [profileErrors, setProfileErrors] = useState<any>({});

  // Estado para etapa 3
  const [phones, setPhones] = useState([
    { phone: '', phone_type: 'Celular', is_primary: true }
  ]);
  // Ajustar o estado de emails para não ter mais o campo is_primary
  const [emails, setEmails] = useState([
    { email: '' }
  ]);
  const [contactErrors, setContactErrors] = useState<any>({});

  // Estado para etapa 4
  const [addresses, setAddresses] = useState([
    {
      address: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: '',
      zip_code: '',
      address_type: 'Residencial',
      is_primary: true
    }
  ]);
  const [addressErrors, setAddressErrors] = useState<any>({});

  // Estados para visibilidade das senhas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchPatients();
    // ✅ CARREGAR DADOS TERRITORIAIS
    loadTerritorialData();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/patients');
      
      console.log('Resposta da API:', response.data);
      setPatients(response.data);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      setPatients([]);
    }
  };

  // ✅ NOVO MÉTODO: CARREGAR DADOS TERRITORIAIS
  const loadTerritorialData = async () => {
    try {
      if (user?.role === 'ADMIN') {
        // ADMIN só vê sua própria prefeitura
        setSelectedCityHall(user.city_id || '');
        if (user.city_id) {
          await loadHealthUnitsByCityHall(user.city_id);
        }
      } else if (user?.role === 'MASTER') {
        // MASTER vê todas as prefeituras
        const cityHallsResponse = await axios.get('/cityhall');
        setCityHalls(cityHallsResponse.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados territoriais:', error);
    }
  };

  // ✅ NOVO MÉTODO: CARREGAR UBS POR PREFEITURA
  const loadHealthUnitsByCityHall = async (cityHallId: string) => {
    try {
      const response = await axios.get(`/healthunit?city_hall_id=${cityHallId}`);
      setHealthUnits(response.data);
    } catch (error) {
      console.error('Erro ao carregar UBS:', error);
      setHealthUnits([]);
    }
  };

  // ✅ NOVO MÉTODO: HANDLER PARA MUDANÇA DE PREFEITURA
  const handleCityHallChange = async (cityHallId: string) => {
    setSelectedCityHall(cityHallId);
    setSelectedHealthUnit(''); // Reset UBS selecionada
    if (cityHallId) {
      await loadHealthUnitsByCityHall(cityHallId);
    } else {
      setHealthUnits([]);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    // setForm({ name: '', email: '', phone: '', birth_date: '' }); // Removido pois form não existe mais
    setEditId(null);
  };

  const handleEdit = (patient: Patient) => {
    setEditId(patient.id);
    // setForm({
    //   name: patient.profile?.name || '',
    //   email: patient.email || '',
    //   phone: patient.profile?.profile_phones?.[0]?.phone || '',
    //   birth_date: patient.profile?.birth_date ? new Date(patient.profile.birth_date).toISOString().split('T')[0] : '',
    // }); // Removido pois form não existe mais
    setIsModalOpen(true);
  };

  const handleView = (patient: Patient) => {
    console.log('🔐 [Patients] handleView chamado com paciente:', patient);
    setViewPatient(patient);
  };

  const handleDelete = (id: string) => {
    console.log('🔐 [Patients] handleDelete chamado com ID:', id);
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    console.log('🔐 [Patients] confirmDelete chamado com deleteId:', deleteId);
    if (!deleteId) return;
    try {
      console.log('🔐 [Patients] Fazendo requisição DELETE para:', `/patients/${deleteId}`);
      await axios.delete(`/patients/${deleteId}`);
      console.log('🔐 [Patients] Paciente excluído com sucesso');
      setDeleteId(null);
      fetchPatients();
    } catch (error) {
      console.error('❌ [Patients] Erro ao excluir paciente:', error);
      alert('Erro ao excluir paciente. Tente novamente.');
    }
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Validação simples
  //   const newErrors: any = {};
  //   if (!form.name) newErrors.name = 'Nome obrigatório';
  //   if (!form.email) newErrors.email = 'E-mail obrigatório';
  //   if (!form.phone) newErrors.phone = 'Telefone obrigatório';
  //   if (!form.birth_date) newErrors.birth_date = 'Data de nascimento obrigatória';
  //   if (Object.keys(newErrors).length > 0) return;
  //   if (editId) {
  //     axios.put(`/patients/${editId}`, form)
  //       .then(() => {
  //         setIsModalOpen(false);
  //         fetchPatients();
  //       });
  //     } else {
  //       axios.post('/patients', form)
  //         .then(() => {
  //         setIsModalOpen(false);
  //         fetchPatients();
  //       });
  //     }
  //   };

  // Função para validar etapa 1
  const validateUserStep = () => {
    const errors: any = {};
    if (!userForm.email) errors.email = 'E-mail obrigatório';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userForm.email)) errors.email = 'E-mail inválido';
    if (!userForm.password) errors.password = 'Senha obrigatória';
    else if (userForm.password.length < 6) errors.password = 'Mínimo 6 caracteres';
    if (!userForm.confirmPassword) errors.confirmPassword = 'Confirme a senha';
    else if (userForm.password !== userForm.confirmPassword) errors.confirmPassword = 'As senhas não coincidem';
    if (!userForm.cpf) errors.cpf = 'CPF obrigatório';
    else if (!/^\d{11}$/.test(userForm.cpf.replace(/\D/g, ''))) errors.cpf = 'CPF deve ter 11 dígitos';
    setUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handler do botão Próximo
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUserStep()) {
      setModalStep(2); // Avança para próxima etapa (ainda não implementada)
    }
  };

  const validateProfileStep = () => {
    const errors: any = {};
    if (!profileForm.name) errors.name = 'Nome obrigatório';
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateProfileStep()) {
      setModalStep(3);
    }
  };
  const handleProfileBack = () => setModalStep(1);

  const handleAddPhone = () => setPhones([...phones, { phone: '', phone_type: 'Celular', is_primary: false }]);
  const handleRemovePhone = (idx: number) => setPhones(phones.filter((_, i) => i !== idx));
  const handlePhoneChange = (idx: number, field: string, value: any) => {
    setPhones(phones.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };
  const handleSetPrimaryPhone = (idx: number) => {
    setPhones(phones.map((p, i) => ({ ...p, is_primary: i === idx })));
  };

  const handleAddEmail = () => setEmails([...emails, { email: '' }]);
  const handleRemoveEmail = (idx: number) => setEmails(emails.filter((_, i) => i !== idx));
  const handleEmailChange = (idx: number, value: string) => {
    setEmails(emails.map((e, i) => i === idx ? { ...e, email: value } : e));
  };
  // const handleSetPrimaryEmail = (idx: number) => {
  //   setEmails(emails.map((e, i) => ({ ...e, is_primary: i === idx })));
  // };

  const validateContactStep = () => {
    const errors: any = {};
    if (!phones.some(p => p.phone)) errors.phones = 'Informe pelo menos um telefone';
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContactNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateContactStep()) {
      setModalStep(4);
    }
  };
  const handleContactBack = () => setModalStep(2);

  const handleAddAddress = () => setAddresses([...addresses, {
    address: '', number: '', complement: '', district: '', city: '', state: '', zip_code: '', address_type: 'Residencial', is_primary: false
  }]);
  const handleRemoveAddress = (idx: number) => setAddresses(addresses.filter((_, i) => i !== idx));
  const handleAddressChange = (idx: number, field: string, value: any) => {
    setAddresses(addresses.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };
  const handleSetPrimaryAddress = (idx: number) => {
    setAddresses(addresses.map((a, i) => ({ ...a, is_primary: i === idx })));
  };

  const validateAddressStep = () => {
    const errors: any = {};
    if (!addresses.some(a => a.address && a.city && a.state && a.zip_code)) errors.addresses = 'Informe pelo menos um endereço completo';
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddressStep()) {
      // ✅ VALIDAÇÃO DOS CAMPOS TERRITORIAIS
      if (!selectedCityHall) {
        alert('Selecione uma prefeitura');
        return;
      }
      if (!selectedHealthUnit) {
        alert('Selecione uma UBS');
        return;
      }

      try {
        const patientData = {
          email: userForm.email,
          password: userForm.password,
          cpf: userForm.cpf,
          name: profileForm.name,
          birth_date: profileForm.birth_date,
          gender: profileForm.gender,
          sus_card: profileForm.sus_card,
          // ✅ NOVOS CAMPOS TERRITORIAIS
          city_id: selectedCityHall,
          health_unit_id: selectedHealthUnit,
          phones: phones,
          emails: emails,
          addresses: addresses,
        };

        if (editId) {
          await axios.put(`/patients/${editId}`, patientData);
        } else {
          await axios.post('/patients', patientData);
        }

        setIsModalOpen(false);
        setModalStep(1);
        fetchPatients();
        
        // Reset forms
        setUserForm({ email: '', password: '', confirmPassword: '', cpf: '' });
        setProfileForm({ name: '', birth_date: '', gender: '', sus_card: '' });
        setPhones([{ phone: '', phone_type: 'Celular', is_primary: true }]);
        setEmails([{ email: '' }]);
        setAddresses([{
          address: '', number: '', complement: '', district: '', city: '', state: '', zip_code: '', address_type: 'Residencial', is_primary: true
        }]);
        // ✅ Reset campos territoriais
        setSelectedCityHall('');
        setSelectedHealthUnit('');
      } catch (error: any) {
        console.error('Erro ao salvar paciente:', error);
        
        // Verificar se é erro de CPF duplicado (409 Conflict)
        if (error.response && error.response.status === 409) {
          alert(`Erro: ${error.response.data.message}`);
        } else {
          alert('Erro ao salvar paciente. Tente novamente.');
        }
      }
    }
  };
  const handleAddressBack = () => setModalStep(3);

  const filteredPatients = patients.filter(p =>
    (p.profile?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.profile?.profile_phones?.[0]?.phone?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-16">
      <PageHeader
        title="Gestão de Pacientes"
        subtitle="Gerencie todos os pacientes cadastrados"
        icon={User}
        className="mb-2 py-1 px-4 rounded-xl shadow bg-white border border-gray-100"
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-10 mb-6 gap-4 animate-fade-in">
        <div className="flex items-center w-full md:w-auto max-w-xl flex-1">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Buscar pacientes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm bg-white shadow-sm placeholder-gray-400"
            />
          </div>
        </div>
        {canCreate && (
          <button className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold text-base animate-glow" onClick={handleOpenModal}>
            <Plus className="h-5 w-5 mr-2" />
            Novo Paciente
          </button>
        )}
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto animate-fade-in">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="px-6 py-4 text-left font-bold tracking-wide">NOME</th>
              <th className="px-6 py-4 text-left font-bold tracking-wide">E-MAIL</th>
              <th className="px-6 py-4 text-left font-bold tracking-wide">TELEFONE</th>
              <th className="px-6 py-4 text-left font-bold tracking-wide">DATA DE NASC.</th>
              <th className="px-6 py-4 text-center font-bold tracking-wide">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400 text-lg">Nenhum paciente encontrado.</td></tr>
            ) :
              filteredPatients.map((row, idx) => (
                <tr key={row.id} className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-all`}>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.profile?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-700">{row.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-700">{row.profile?.profile_phones?.[0]?.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-700">{row.profile?.birth_date ? new Date(row.profile.birth_date).toLocaleDateString('pt-BR') : 'N/A'}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {canView && (
                        <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition" title="Visualizar" onClick={() => handleView(row)}>
                          <Eye className="h-5 w-5" />
                        </button>
                      )}
                      {canEdit && (
                        <button className="p-2 rounded-lg hover:bg-yellow-100 text-yellow-600 transition" title="Editar" onClick={() => handleEdit(row)}>
                          <Edit2 className="h-5 w-5" />
                        </button>
                      )}
                      {canDelete && (
                        <button className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition" title="Excluir" onClick={() => handleDelete(row.id)}>
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {/* Modal de cadastro/edição */}
                                <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setModalStep(1); }} title={editId ? 'Editar Paciente' : 'Novo Paciente'} size="full" className="max-w-4xl max-h-[90vh]">
               <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                 {isStep1() && (
                   <>
                     <div className="flex items-center justify-center mb-6">
              <div className="flex gap-2 items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${modalStep === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>1</div>
                <span className="font-medium text-blue-700">Dados de Usuário</span>
                <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${modalStep === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}>2</div>
                <span className="text-gray-500">Perfil</span>
                <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${modalStep === 3 ? 'bg-blue-600' : 'bg-gray-300'}`}>3</div>
                <span className="text-gray-500">Contato</span>
                <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${modalStep === 4 ? 'bg-blue-600' : 'bg-gray-300'}`}>4</div>
                <span className="text-gray-500">Endereço</span>
              </div>
            </div>
            <form onSubmit={handleNextStep} className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Dados de Usuário</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-mail</label>
                  <input name="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400" placeholder="E-mail" />
                  {userErrors.email && <span className="text-red-500 text-xs">{userErrors.email}</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Senha</label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={userForm.password}
                        onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400 pr-10"
                        placeholder="Senha"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        onClick={() => setShowPassword(v => !v)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {userErrors.password && <span className="text-red-500 text-xs">{userErrors.password}</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={userForm.confirmPassword}
                        onChange={e => setUserForm(f => ({ ...f, confirmPassword: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400 pr-10"
                        placeholder="Confirme a senha"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        onClick={() => setShowConfirmPassword(v => !v)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {userErrors.confirmPassword && <span className="text-red-500 text-xs">{userErrors.confirmPassword}</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CPF</label>
                  <input name="cpf" value={userForm.cpf} onChange={e => setUserForm(f => ({ ...f, cpf: e.target.value }))} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400" placeholder="CPF (somente números)" />
                  {userErrors.cpf && <span className="text-red-500 text-xs">{userErrors.cpf}</span>}
                </div>

                {/* ✅ CAMPOS DE VINCULAÇÃO TERRITORIAL */}
                {user?.role === 'MASTER' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <Building2 className="inline w-4 h-4 mr-2" />
                      Prefeitura
                    </label>
                    <select
                      value={selectedCityHall}
                      onChange={(e) => handleCityHallChange(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2"
                      required
                    >
                      <option value="">Selecione uma prefeitura</option>
                      {cityHalls.map((cityHall) => (
                        <option key={cityHall.id} value={cityHall.id}>
                          {cityHall.name} - {cityHall.city}/{cityHall.state}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <MapPin className="inline w-4 h-4 mr-2" />
                    Unidade de Saúde (UBS)
                  </label>
                  <select
                    value={selectedHealthUnit}
                    onChange={(e) => setSelectedHealthUnit(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2"
                    required
                    disabled={!selectedCityHall}
                  >
                    <option value="">
                      {!selectedCityHall 
                        ? 'Selecione uma prefeitura primeiro' 
                        : 'Selecione uma UBS'
                      }
                    </option>
                    {healthUnits.map((healthUnit) => (
                      <option key={healthUnit.id} value={healthUnit.id}>
                        {healthUnit.name} - {healthUnit.address}
                      </option>
                    ))}
                  </select>
                  {!selectedCityHall && (
                    <p className="mt-1 text-sm text-gray-500">
                      {user?.role === 'ADMIN' 
                        ? 'UBS será carregada automaticamente da sua prefeitura'
                        : 'Selecione uma prefeitura para ver as UBS disponíveis'
                      }
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setModalStep(1); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Próximo</button>
              </div>
            </form>
          </>
        )}
                         {isStep2() && (
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="flex gap-2 items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${isStep(1) ? 'bg-blue-600' : 'bg-gray-300'}`}>1</div>
                <span className="font-medium text-blue-700">Dados de Usuário</span>
                <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${isStep(2) ? 'bg-blue-600' : 'bg-gray-300'}`}>2</div>
                <span className="text-gray-500">Perfil</span>
                <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${isStep(3) ? 'bg-blue-600' : 'bg-gray-300'}`}>3</div>
                <span className="text-gray-500">Contato</span>
                <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${isStep(4) ? 'bg-blue-600' : 'bg-gray-300'}`}>4</div>
                <span className="text-gray-500">Endereço</span>
              </div>
            </div>
            <form onSubmit={handleProfileNext} className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Dados do Perfil</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Nome completo</label>
                  <input name="name" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400" placeholder="Nome completo" />
                  {profileErrors.name && <span className="text-red-500 text-xs">{profileErrors.name}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de nascimento</label>
                  <input name="birth_date" type="date" value={profileForm.birth_date} onChange={e => setProfileForm(f => ({ ...f, birth_date: e.target.value }))} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gênero</label>
                  <select name="gender" value={profileForm.gender} onChange={e => setProfileForm(f => ({ ...f, gender: e.target.value }))} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2">
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cartão SUS</label>
                  <input name="sus_card" value={profileForm.sus_card} onChange={e => setProfileForm(f => ({ ...f, sus_card: e.target.value }))} className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2 placeholder-gray-400" placeholder="Número do cartão SUS" />
                </div>
              </div>
              <div className="flex justify-between mt-4 gap-2">
                <button type="button" onClick={handleProfileBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Voltar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Próximo</button>
              </div>
            </form>
          </>
        )}
                         {isStep3() && (
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="flex gap-2 items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${modalStep === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>1</div>
                <span className="font-medium text-blue-700">Dados de Usuário</span>
                <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${modalStep === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}>2</div>
                <span className="text-gray-500">Perfil</span>
                <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${modalStep === 3 ? 'bg-blue-600' : 'bg-gray-300'}`}>3</div>
                <span className="text-gray-500">Contato</span>
                <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${modalStep === 4 ? 'bg-blue-600' : 'bg-gray-300'}`}>4</div>
                <span className="text-gray-500">Endereço</span>
              </div>
            </div>
            <form onSubmit={handleContactNext} className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Contato</h2>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Telefones <span className="text-red-500">*</span></label>
                {phones.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-2 w-full">
                    <input
                      type="text"
                      value={p.phone}
                      onChange={e => handlePhoneChange(idx, 'phone', e.target.value)}
                      className="rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-3 py-2 placeholder-gray-400 w-full"
                      placeholder="Número"
                    />
                    <select
                      value={p.phone_type}
                      onChange={e => handlePhoneChange(idx, 'phone_type', e.target.value)}
                      className="rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-3 py-2 w-full"
                    >
                      <option value="Celular">Celular</option>
                      <option value="Fixo">Fixo</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Outro">Outro</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={p.is_primary}
                        onChange={() => handleSetPrimaryPhone(idx)}
                      /> <span className="text-xs">Principal</span>
                      {phones.length > 1 && (
                        <button type="button" onClick={() => handleRemovePhone(idx)} className="ml-2 text-red-500 hover:text-red-700 text-xs">Remover</button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddPhone} className="text-blue-600 hover:underline text-xs">+ Adicionar telefone</button>
                {contactErrors.phones && <span className="text-red-500 text-xs block mt-1">{contactErrors.phones}</span>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">E-mails alternativos</label>
                {emails.map((e, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-2 w-full">
                    <input
                      type="email"
                      value={e.email}
                      onChange={ev => handleEmailChange(idx, ev.target.value)}
                      className="rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-3 py-2 placeholder-gray-400 w-full"
                      placeholder="E-mail alternativo"
                    />
                    {emails.length > 1 && (
                      <button type="button" onClick={() => handleRemoveEmail(idx)} className="text-red-500 hover:text-red-700 text-xs">Remover</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddEmail} className="text-blue-600 hover:underline text-xs">+ Adicionar e-mail</button>
              </div>
              <div className="flex justify-between mt-4 gap-2">
                <button type="button" onClick={handleContactBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Voltar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Próximo</button>
              </div>
            </form>
          </>
        )}
                         {isStep4() && (
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="flex gap-2 items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${modalStep === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>1</div>
                <span className="font-medium text-blue-700">Dados de Usuário</span>
                <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${modalStep === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}>2</div>
                <span className="text-gray-500">Perfil</span>
                <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${modalStep === 3 ? 'bg-blue-600' : 'bg-gray-300'}`}>3</div>
                <span className="text-gray-500">Contato</span>
                <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${modalStep === 4 ? 'bg-blue-600' : 'bg-gray-300'}`}>4</div>
                <span className="text-gray-500">Endereço</span>
              </div>
            </div>
            <form onSubmit={handleAddressFinish} className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Endereço</h2>
              {addresses.map((a, idx) => (
                <div key={idx} className="border rounded-xl p-4 mb-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Logradouro</label>
                      <input type="text" value={a.address} onChange={e => handleAddressChange(idx, 'address', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-3 py-2 placeholder-gray-400" placeholder="Rua/Avenida" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Número</label>
                      <input type="text" value={a.number} onChange={e => handleAddressChange(idx, 'number', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-3 py-2 placeholder-gray-400" placeholder="Número" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Complemento</label>
                      <input type="text" value={a.complement} onChange={e => handleAddressChange(idx, 'complement', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-3 py-2 placeholder-gray-400" placeholder="Complemento" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bairro</label>
                      <input type="text" value={a.district} onChange={e => handleAddressChange(idx, 'district', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-3 py-2 placeholder-gray-400" placeholder="Bairro" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cidade</label>
                      <input type="text" value={a.city} onChange={e => handleAddressChange(idx, 'city', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-3 py-2 placeholder-gray-400" placeholder="Cidade" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <input type="text" value={a.state} onChange={e => handleAddressChange(idx, 'state', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-3 py-2 placeholder-gray-400" placeholder="Estado" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CEP</label>
                      <input type="text" value={a.zip_code} onChange={e => handleAddressChange(idx, 'zip_code', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-3 py-2 placeholder-gray-400" placeholder="CEP" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo</label>
                      <select value={a.address_type} onChange={e => handleAddressChange(idx, 'address_type', e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base px-3 py-2">
                        <option value="Residencial">Residencial</option>
                        <option value="Comercial">Comercial</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input type="radio" checked={a.is_primary} onChange={() => handleSetPrimaryAddress(idx)} /> <span className="text-xs">Principal</span>
                      {addresses.length > 1 && (
                        <button type="button" onClick={() => handleRemoveAddress(idx)} className="ml-2 text-red-500 hover:text-red-700 text-xs">Remover</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleAddAddress} className="text-blue-600 hover:underline text-xs">+ Adicionar endereço</button>
              {addressErrors.addresses && <span className="text-red-500 text-xs block mt-1">{addressErrors.addresses}</span>}
              <div className="flex justify-between mt-4 gap-2">
                <button type="button" onClick={handleAddressBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Voltar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Salvar</button>
              </div>
            </form>
          </>
        )}
      </div>
</Modal>

    {/* ✅ Modal de confirmação de exclusão */}
    {deleteId && (
      <Modal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        title="Confirmar Exclusão" 
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    )}

    {/* ✅ Modal de visualização de paciente */}
    {viewPatient && (
      <Modal 
        isOpen={!!viewPatient} 
        onClose={() => setViewPatient(null)} 
        title="Visualizar Paciente" 
        size="full"
        className="max-w-7xl max-h-[98vh]"
      >
        <div className="p-4 space-y-4">
          {/* Dados do Usuário e Perfil em linha */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Dados do Usuário */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Dados do Usuário
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700">E-mail</label>
                  <p className="text-sm text-gray-900">{viewPatient.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">CPF</label>
                  <p className="text-sm text-gray-900">{viewPatient.profile?.cpf || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Dados do Perfil */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                Dados do Perfil
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Nome Completo</label>
                  <p className="text-sm text-gray-900">{viewPatient.profile?.name || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Data Nasc.</label>
                    <p className="text-sm text-gray-900">
                      {viewPatient.profile?.birth_date 
                        ? new Date(viewPatient.profile.birth_date).toLocaleDateString('pt-BR') 
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Gênero</label>
                    <p className="text-sm text-gray-900">{viewPatient.profile?.gender || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Cartão SUS</label>
                  <p className="text-sm text-gray-900">{viewPatient.profile?.sus_card || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Telefones e E-mails em linha */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Telefones */}
            {viewPatient.profile?.profile_phones && viewPatient.profile.profile_phones.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-600" />
                  Telefones
                </h3>
                <div className="space-y-1">
                  {viewPatient.profile.profile_phones.map((phone, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border text-sm">
                      <span className="font-medium text-gray-700">{phone.phone}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {phone.phone_type}
                      </span>
                      {phone.is_primary && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* E-mails */}
            {viewPatient.profile?.profile_emails && viewPatient.profile.profile_emails.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-orange-600" />
                  E-mails
                </h3>
                <div className="space-y-1">
                  {viewPatient.profile.profile_emails.map((email, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border text-sm">
                      <span className="text-gray-700">{email.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Endereços - Layout compacto */}
          {viewPatient.profile?.profile_addresses && viewPatient.profile.profile_addresses.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                Endereços
              </h3>
              <div className="space-y-2">
                {viewPatient.profile.profile_addresses.map((address, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">Logradouro:</span>
                          <span className="text-gray-900">{address.address}, {address.number}</span>
                        </div>
                        {address.complement && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700">Complemento:</span>
                            <span className="text-gray-900">{address.complement}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">Bairro:</span>
                          <span className="text-gray-900">{address.district}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">Cidade/UF:</span>
                          <span className="text-gray-900">{address.city}/{address.state}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">CEP:</span>
                          <span className="text-gray-900">{address.zip_code}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">Tipo:</span>
                          <span className="text-gray-900">{address.address_type}</span>
                          {address.is_primary && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              Principal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Informações do Sistema */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-600" />
              Informações do Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Criado em</label>
                <p className="text-sm text-gray-900">
                  {viewPatient.created_at 
                    ? new Date(viewPatient.created_at).toLocaleDateString('pt-BR') 
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Atualizado em</label>
                <p className="text-sm text-gray-900">
                  {viewPatient.updated_at 
                    ? new Date(viewPatient.updated_at).toLocaleDateString('pt-BR') 
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Botão de fechar */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setViewPatient(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
      </div>
</Modal>
    )}
</div>
);

};

export default Patients;