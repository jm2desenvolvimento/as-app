import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Eye, Edit2, Trash2, Search, EyeOff, MapPin, Building2, User, UserCheck, Phone, Mail, Settings } from 'lucide-react';
import Modal from './Modal';
import { PageHeader } from '../ui';
import { usePermission } from '../../hooks/usePermission';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

interface Doctor {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    name: string;
    birth_date: string;
    gender: string;
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
    profile_doctor?: {
      id: string;
      crm_number: string;
      crm_uf: string;
      specialty?: string; // ✅ Adicionado para visualização
    };
    cpf?: string; // Adicionado para visualização
  };
}

// ✅ Interface para endereços do formulário
interface AddressForm {
  address: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
  address_type: string;
  is_primary: boolean;
}

const Doctors = () => {
  const { hasPermission } = usePermission();
  const isMobile = useIsMobile();
  const { user } = useAuthStore();
  const canCreate = hasPermission('doctor_create');
  const canEdit = hasPermission('doctor_update');
  const canDelete = hasPermission('doctor_delete');
  const canView = hasPermission('doctor_view');

  // ✅ DEBUG: Log das permissões
  console.log('🔐 [Doctors] Permissões do usuário:', {
    user: user?.email,
    role: user?.role,
    permissions: user?.permissions,
    canCreate,
    canEdit,
    canDelete,
    canView
  });

  // ✅ DEBUG: Verificar se o usuário está logado
  console.log('🔐 [Doctors] Estado de autenticação:', {
    isLoggedIn: !!user,
    token: !!localStorage.getItem('token'),
    userPermissions: user?.permissions?.length || 0
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // const [form, setForm] = useState({
  //   name: '',
  //   email: '',
  //   phone: '',
  //   birth_date: '',
  // }); // Removido pois não está sendo usado
  // const [errors, setErrors] = useState<any>({}); // Removido pois não está sendo usado
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null);

  // ✅ NOVOS ESTADOS PARA VINCULAÇÃO TERRITORIAL
  const [cityHalls, setCityHalls] = useState<any[]>([]);
  const [healthUnits, setHealthUnits] = useState<any[]>([]);
  const [selectedCityHall, setSelectedCityHall] = useState('');
  const [selectedHealthUnit, setSelectedHealthUnit] = useState('');

  // Novo estado para etapa do modal
  const [modalStep, setModalStep] = useState<1 | 2 | 3 | 4>(1);
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
    crm_number: '',
    crm_uf: '',
    specialty: '', // ✅ NOVO CAMPO: ESPECIALIDADE
  });
  const [profileErrors, setProfileErrors] = useState<any>({});

  // Estado para etapa 3
  const [phones, setPhones] = useState([
    { phone: '', phone_type: 'Celular', is_primary: true }
  ]);
  const [emails, setEmails] = useState([
    { email: '' }
  ]);
  const [contactErrors, setContactErrors] = useState<any>({});

  // Estado para etapa 4
  const [addresses, setAddresses] = useState<AddressForm[]>([
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
    fetchDoctors();
    // ✅ CARREGAR DADOS TERRITORIAIS
    loadTerritorialData();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/doctors');
      setDoctors(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar médicos:', error);
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
    setModalStep(1);
    setEditId(null);
    setUserForm({ email: '', password: '', confirmPassword: '', cpf: '' });
    setProfileForm({ name: '', birth_date: '', gender: '', crm_number: '', crm_uf: '', specialty: '' });
    setPhones([{ phone: '', phone_type: 'Celular', is_primary: true }]);
    setEmails([{ email: '' }]);
    setAddresses([{
      address: '', number: '', complement: '', district: '', city: '', state: '', zip_code: '', address_type: 'Residencial', is_primary: true
    }]);
    setUserErrors({});
    setProfileErrors({});
    setContactErrors({});
    setAddressErrors({});
  };

  const handleEdit = (doctor: Doctor) => {
    setEditId(doctor.id);
    setUserForm({
      email: doctor.email || '',
      password: '',
      confirmPassword: '',
      cpf: '',
    });
    setProfileForm({
      name: doctor.profile?.name || '',
      birth_date: doctor.profile?.birth_date ? new Date(doctor.profile.birth_date).toISOString().split('T')[0] : '',
      gender: doctor.profile?.gender || '',
      crm_number: doctor.profile?.profile_doctor?.crm_number || '',
      crm_uf: doctor.profile?.profile_doctor?.crm_uf || '',
      specialty: doctor.profile?.profile_doctor?.specialty || '', // ✅ NOVO CAMPO: ESPECIALIDADE
    });
    setPhones(doctor.profile?.profile_phones?.length ? doctor.profile.profile_phones : [{ phone: '', phone_type: 'Celular', is_primary: true }]);
    setEmails(doctor.profile?.profile_emails?.length ? doctor.profile.profile_emails : [{ email: '' }]);
    setAddresses(doctor.profile?.profile_addresses?.length ? doctor.profile.profile_addresses.map(addr => ({
      address: addr.address || '',
      number: addr.number || '',
      complement: addr.complement || '',
      district: addr.district || '',
      city: addr.city || '',
      state: addr.state || '',
      zip_code: addr.zip_code || '',
      address_type: addr.address_type || 'Residencial',
      is_primary: addr.is_primary || false
    })) : [{
      address: '', number: '', complement: '', district: '', city: '', state: '', zip_code: '', address_type: 'Residencial', is_primary: true
    }]);
    setIsModalOpen(true);
    setModalStep(1);
  };

  const handleView = (doctor: Doctor) => {
    console.log('🔐 [Doctors] handleView chamado com médico:', doctor);
    setViewDoctor(doctor);
  };

  const handleDelete = (id: string) => {
    console.log('🔐 [Doctors] handleDelete chamado com ID:', id);
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    console.log('🔐 [Doctors] confirmDelete chamado com deleteId:', deleteId);
    if (!deleteId) return;
    try {
      console.log('🔐 [Doctors] Fazendo requisição DELETE para:', `/doctors/${deleteId}`);
      await axios.delete(`/doctors/${deleteId}`);
      console.log('🔐 [Doctors] Médico excluído com sucesso');
      setDeleteId(null);
      fetchDoctors();
    } catch (error) {
      console.error('❌ [Doctors] Erro ao excluir médico:', error);
      alert('Erro ao excluir médico. Tente novamente.');
    }
  };

  // Funções de validação e manipulação do modal
  const validateUserStep = () => {
    const newErrors: any = {};
    if (!userForm.email) newErrors.email = 'E-mail obrigatório';
    if (!userForm.password) newErrors.password = 'Senha obrigatória';
    if (userForm.password !== userForm.confirmPassword) newErrors.confirmPassword = 'Senhas não conferem';
    if (!userForm.cpf) newErrors.cpf = 'CPF obrigatório';
    setUserErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUserStep()) {
      setModalStep(2);
    }
  };

  const validateProfileStep = () => {
    const newErrors: any = {};
    if (!profileForm.name) newErrors.name = 'Nome obrigatório';
    if (!profileForm.specialty) newErrors.specialty = 'Especialidade obrigatória'; // ✅ NOVA VALIDAÇÃO
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateProfileStep()) {
      setModalStep(3);
    }
  };

  const handleProfileBack = () => setModalStep(1);

  // Funções para manipular telefones
  const handleAddPhone = () => setPhones([...phones, { phone: '', phone_type: 'Celular', is_primary: false }]);
  const handleRemovePhone = (idx: number) => setPhones(phones.filter((_, i) => i !== idx));
  const handlePhoneChange = (idx: number, field: string, value: any) => {
    const newPhones = [...phones];
    newPhones[idx] = { ...newPhones[idx], [field]: value };
    setPhones(newPhones);
  };
  const handleSetPrimaryPhone = (idx: number) => {
    setPhones(phones.map((phone, i) => ({ ...phone, is_primary: i === idx })));
  };

  // Funções para manipular emails
  const handleAddEmail = () => setEmails([...emails, { email: '' }]);
  const handleRemoveEmail = (idx: number) => setEmails(emails.filter((_, i) => i !== idx));
  const handleEmailChange = (idx: number, value: string) => {
    const newEmails = [...emails];
    newEmails[idx] = { ...newEmails[idx], email: value };
    setEmails(newEmails);
  };

  const validateContactStep = () => {
    const newErrors: any = {};
    if (!phones[0]?.phone) newErrors.phone = 'Pelo menos um telefone é obrigatório';
    setContactErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContactNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateContactStep()) {
      setModalStep(4);
    }
  };

  const handleContactBack = () => setModalStep(2);

  // Funções para manipular endereços
  const handleAddAddress = () => setAddresses([...addresses, {
    address: '', number: '', complement: '', district: '', city: '', state: '', zip_code: '', address_type: 'Residencial', is_primary: false
  }]);
  const handleRemoveAddress = (idx: number) => setAddresses(addresses.filter((_, i) => i !== idx));
  const handleAddressChange = (idx: number, field: string, value: any) => {
    const newAddresses = [...addresses];
    newAddresses[idx] = { ...newAddresses[idx], [field]: value };
    setAddresses(newAddresses);
  };
  const handleSetPrimaryAddress = (idx: number) => {
    setAddresses(addresses.map((address, i) => ({ ...address, is_primary: i === idx })));
  };

  const validateAddressStep = () => {
    const newErrors: any = {};
    if (!addresses[0]?.address || !addresses[0]?.city || !addresses[0]?.state) {
      newErrors.address = 'Pelo menos um endereço completo é obrigatório';
    }
    setAddressErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddressStep()) return;

    // ✅ VALIDAÇÃO DOS CAMPOS TERRITORIAIS
    if (!selectedCityHall) {
      alert('Selecione uma prefeitura');
      return;
    }
    if (!selectedHealthUnit) {
      alert('Selecione uma UBS');
      return;
    }

    const doctorData = {
      email: userForm.email,
      password: userForm.password,
      cpf: userForm.cpf,
      name: profileForm.name,
      birth_date: profileForm.birth_date ? new Date(profileForm.birth_date).toISOString() : undefined,
      gender: profileForm.gender,
      crm_number: profileForm.crm_number,
      crm_uf: profileForm.crm_uf,
      specialty: profileForm.specialty, // ✅ NOVO CAMPO: ESPECIALIDADE
      // ✅ NOVOS CAMPOS TERRITORIAIS
      city_id: selectedCityHall,
      health_unit_id: selectedHealthUnit,
      phones,
      emails: emails.filter(e => e.email && e.email.trim() !== ""),
      addresses: addresses.map(addr => ({
        ...addr,
        district: addr.district && addr.district.trim() !== "" ? addr.district : undefined,
        number: addr.number && addr.number.trim() !== "" ? addr.number : undefined,
        complement: addr.complement && addr.complement.trim() !== "" ? addr.complement : undefined,
      })),
    };

    try {
      if (editId) {
        await axios.put(`/doctors/${editId}`, doctorData);
      } else {
        await axios.post('/doctors', doctorData);
      }
      setIsModalOpen(false);
      setModalStep(1);
      fetchDoctors();
      
      // ✅ Reset campos territoriais
      setSelectedCityHall('');
      setSelectedHealthUnit('');
    } catch (error) {
      console.error('Erro ao salvar médico:', error);
      alert('Erro ao salvar médico. Tente novamente.');
    }
  };

  const handleAddressBack = () => setModalStep(3);

  const filteredDoctors = doctors.filter(d =>
    (d.profile?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (d.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (d.profile?.profile_phones?.[0]?.phone?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (d.profile?.profile_doctor?.crm_number?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-16">
      <PageHeader
        title="Gestão de Médicos"
        subtitle="Gerencie todos os médicos cadastrados"
        icon={Stethoscope}
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
              placeholder="Buscar médicos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm bg-white shadow-sm placeholder-gray-400"
            />
          </div>
        </div>
        {canCreate && (
          <button className={`flex items-center bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold animate-glow ${
            isMobile ? 'px-3 py-2 text-sm' : 'px-6 py-2 text-base'
          }`} onClick={handleOpenModal}>
            <Plus className={`${isMobile ? 'h-4 w-4 mr-1' : 'h-5 w-5 mr-2'}`} />
            Novo Médico
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
              <th className="px-6 py-4 text-left font-bold tracking-wide">CRM</th>
              <th className="px-6 py-4 text-center font-bold tracking-wide">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400 text-lg">Nenhum médico encontrado.</td></tr>
            ) :
              filteredDoctors.map((row, idx) => (
                <tr key={row.id} className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-all`}>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.profile?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-700">{row.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-700">{row.profile?.profile_phones?.[0]?.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-700">{row.profile?.profile_doctor?.crm_number ? `${row.profile.profile_doctor.crm_number}/${row.profile.profile_doctor.crm_uf}` : 'N/A'}</td>
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
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setModalStep(1); }} title={editId ? 'Editar Médico' : 'Novo Médico'} size="full" className="max-w-4xl max-h-[90vh]">
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {modalStep === 1 && (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-blue-600">1</div>
                  <span className="font-medium text-blue-700">Dados de Usuário</span>
                  <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-gray-300">2</div>
                  <span className="font-medium text-gray-500">Dados do Perfil</span>
                  <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-gray-300">3</div>
                  <span className="font-medium text-gray-500">Contatos</span>
                  <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-gray-300">4</div>
                  <span className="font-medium text-gray-500">Endereço</span>
                </div>
              </div>
              <form onSubmit={handleNextStep} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={e => setUserForm({...userForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="exemplo@email.com"
                  />
                  {userErrors.email && <p className="text-red-500 text-sm mt-1">{userErrors.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={userForm.password}
                        onChange={e => setUserForm({...userForm, password: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Digite sua senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {userErrors.password && <p className="text-red-500 text-sm mt-1">{userErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={userForm.confirmPassword}
                        onChange={e => setUserForm({...userForm, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirme sua senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {userErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{userErrors.confirmPassword}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={userForm.cpf}
                    onChange={e => setUserForm({...userForm, cpf: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000.000.000-00"
                  />
                  {userErrors.cpf && <p className="text-red-500 text-sm mt-1">{userErrors.cpf}</p>}
                </div>

                {/* ✅ CAMPOS DE VINCULAÇÃO TERRITORIAL */}
                {user?.role === 'MASTER' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building2 className="inline w-4 h-4 mr-2" />
                      Prefeitura
                    </label>
                    <select
                      value={selectedCityHall}
                      onChange={(e) => handleCityHallChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="inline w-4 h-4 mr-2" />
                    Unidade de Saúde (UBS)
                  </label>
                  <select
                    value={selectedHealthUnit}
                    onChange={(e) => setSelectedHealthUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Próximo
                  </button>
                </div>
              </form>
            </>
          )}

          {modalStep === 2 && (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-gray-300">1</div>
                  <span className="font-medium text-gray-500">Dados de Usuário</span>
                  <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-blue-600">2</div>
                  <span className="font-medium text-blue-700">Dados do Perfil</span>
                  <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-gray-300">3</div>
                  <span className="font-medium text-gray-500">Contatos</span>
                  <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-gray-300">4</div>
                  <span className="font-medium text-gray-500">Endereço</span>
                </div>
              </div>
              <form onSubmit={handleProfileNext} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o nome completo"
                  />
                  {profileErrors.name && <p className="text-red-500 text-sm mt-1">{profileErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={profileForm.birth_date}
                      onChange={e => setProfileForm({...profileForm, birth_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                    <select
                      value={profileForm.gender}
                      onChange={e => setProfileForm({...profileForm, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número do CRM</label>
                    <input
                      type="text"
                      value={profileForm.crm_number}
                      onChange={e => setProfileForm({...profileForm, crm_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="00000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UF do CRM</label>
                    <select
                      value={profileForm.crm_uf}
                      onChange={e => setProfileForm({...profileForm, crm_uf: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione</option>
                      <option value="AC">AC</option>
                      <option value="AL">AL</option>
                      <option value="AP">AP</option>
                      <option value="AM">AM</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="DF">DF</option>
                      <option value="ES">ES</option>
                      <option value="GO">GO</option>
                      <option value="MA">MA</option>
                      <option value="MT">MT</option>
                      <option value="MS">MS</option>
                      <option value="MG">MG</option>
                      <option value="PA">PA</option>
                      <option value="PB">PB</option>
                      <option value="PR">PR</option>
                      <option value="PE">PE</option>
                      <option value="PI">PI</option>
                      <option value="RJ">RJ</option>
                      <option value="RN">RN</option>
                      <option value="RS">RS</option>
                      <option value="RO">RO</option>
                      <option value="RR">RR</option>
                      <option value="SC">SC</option>
                      <option value="SP">SP</option>
                      <option value="SE">SE</option>
                      <option value="TO">TO</option>
                    </select>
                  </div>
                </div>
                
                {/* ✅ NOVO CAMPO: ESPECIALIDADE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade *</label>
                  <select
                    value={profileForm.specialty}
                    onChange={e => setProfileForm({...profileForm, specialty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione a especialidade</option>
                    <option value="Clínico Geral">Clínico Geral</option>
                    <option value="Cardiologia">Cardiologia</option>
                    <option value="Pediatria">Pediatria</option>
                    <option value="Ortopedia">Ortopedia</option>
                    <option value="Ginecologia">Ginecologia</option>
                    <option value="Dermatologia">Dermatologia</option>
                    <option value="Oftalmologia">Oftalmologia</option>
                    <option value="Psiquiatria">Psiquiatria</option>
                    <option value="Neurologia">Neurologia</option>
                    <option value="Urologia">Urologia</option>
                    <option value="Endocrinologia">Endocrinologia</option>
                    <option value="Pneumologia">Pneumologia</option>
                    <option value="Oncologia">Oncologia</option>
                    <option value="Gastroenterologia">Gastroenterologia</option>
                    <option value="Hematologia">Hematologia</option>
                    <option value="Reumatologia">Reumatologia</option>
                    <option value="Infectologia">Infectologia</option>
                    <option value="Nefrologia">Nefrologia</option>
                    <option value="Cirurgia Geral">Cirurgia Geral</option>
                    <option value="Cirurgia Cardíaca">Cirurgia Cardíaca</option>
                    <option value="Cirurgia Vascular">Cirurgia Vascular</option>
                    <option value="Cirurgia Plástica">Cirurgia Plástica</option>
                    <option value="Anestesiologia">Anestesiologia</option>
                    <option value="Radiologia">Radiologia</option>
                    <option value="Medicina Nuclear">Medicina Nuclear</option>
                    <option value="Patologia">Patologia</option>
                    <option value="Medicina Legal">Medicina Legal</option>
                    <option value="Medicina do Trabalho">Medicina do Trabalho</option>
                    <option value="Medicina Esportiva">Medicina Esportiva</option>
                    <option value="Medicina de Família">Medicina de Família</option>
                    <option value="Outro">Outro</option>
                  </select>
                  {profileErrors.specialty && <p className="text-red-500 text-sm mt-1">{profileErrors.specialty}</p>}
                </div>

                <div className="flex justify-between gap-2 pt-4">
                  <button
                    type="button"
                    onClick={handleProfileBack}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Próximo
                  </button>
                </div>
              </form>
            </>
          )}

          {modalStep === 3 && (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-gray-300">1</div>
                  <span className="font-medium text-gray-500">Dados de Usuário</span>
                  <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-gray-300">2</div>
                  <span className="font-medium text-gray-500">Dados do Perfil</span>
                  <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-blue-600">3</div>
                  <span className="font-medium text-blue-700">Contatos</span>
                  <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-gray-300">4</div>
                  <span className="font-medium text-gray-500">Endereço</span>
                </div>
              </div>
              <form onSubmit={handleContactNext} className="space-y-6">
                {/* Telefones */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Telefones</h3>
                    <button
                      type="button"
                      onClick={handleAddPhone}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      + Adicionar
                    </button>
                  </div>
                  {phones.map((phone, idx) => (
                    <div key={idx} className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={phone.phone}
                          onChange={e => handlePhoneChange(idx, 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="w-32">
                        <select
                          value={phone.phone_type}
                          onChange={e => handlePhoneChange(idx, 'phone_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Celular">Celular</option>
                          <option value="Fixo">Fixo</option>
                          <option value="Comercial">Comercial</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="primaryPhone"
                          checked={phone.is_primary}
                          onChange={() => handleSetPrimaryPhone(idx)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-600">Principal</span>
                      </div>
                      {phones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhone(idx)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  ))}
                  {contactErrors.phone && <p className="text-red-500 text-sm">{contactErrors.phone}</p>}
                </div>

                {/* Emails */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">E-mails Alternativos</h3>
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      + Adicionar
                    </button>
                  </div>
                  {emails.map((email, idx) => (
                    <div key={idx} className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <input
                          type="email"
                          value={email.email}
                          onChange={e => handleEmailChange(idx, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="exemplo@email.com"
                        />
                      </div>
                      {emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(idx)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between gap-2 pt-4">
                  <button
                    type="button"
                    onClick={handleContactBack}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Próximo
                  </button>
                </div>
              </form>
            </>
          )}

          {modalStep === 4 && (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-gray-300">1</div>
                  <span className="font-medium text-gray-500">Dados de Usuário</span>
                  <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-gray-300">2</div>
                  <span className="font-medium text-gray-500">Dados do Perfil</span>
                  <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-gray-300">3</div>
                  <span className="font-medium text-gray-500">Contatos</span>
                  <div className="w-8 h-1 bg-blue-200 rounded mx-2" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-blue-600">4</div>
                  <span className="font-medium text-blue-700">Endereço</span>
                </div>
              </div>
              <form onSubmit={handleAddressFinish} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Endereços</h3>
                    <button
                      type="button"
                      onClick={handleAddAddress}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      + Adicionar
                    </button>
                  </div>
                  {addresses.map((address, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                          <input
                            type="text"
                            value={address.address}
                            onChange={e => handleAddressChange(idx, 'address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Rua, Avenida, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                          <input
                            type="text"
                            value={address.number}
                            onChange={e => handleAddressChange(idx, 'number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="123"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                          <input
                            type="text"
                            value={address.complement}
                            onChange={e => handleAddressChange(idx, 'complement', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Apto, Casa, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                          <input
                            type="text"
                            value={address.district}
                            onChange={e => handleAddressChange(idx, 'district', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Centro"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                          <input
                            type="text"
                            value={address.city}
                            onChange={e => handleAddressChange(idx, 'city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="São Paulo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                          <input
                            type="text"
                            value={address.state}
                            onChange={e => handleAddressChange(idx, 'state', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="SP"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                          <input
                            type="text"
                            value={address.zip_code}
                            onChange={e => handleAddressChange(idx, 'zip_code', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="00000-000"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                              value={address.address_type}
                              onChange={e => handleAddressChange(idx, 'address_type', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Residencial">Residencial</option>
                              <option value="Comercial">Comercial</option>
                              <option value="Outro">Outro</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="primaryAddress"
                              checked={address.is_primary}
                              onChange={() => handleSetPrimaryAddress(idx)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-600">Principal</span>
                          </div>
                        </div>
                        {addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAddress(idx)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {addressErrors.address && <p className="text-red-500 text-sm">{addressErrors.address}</p>}
                </div>

                <div className="flex justify-between gap-2 pt-4">
                  <button
                    type="button"
                    onClick={handleAddressBack}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editId ? 'Atualizar' : 'Criar'} Médico
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </Modal>
      {/* Modal de visualização */}
      <Modal isOpen={!!viewDoctor} onClose={() => setViewDoctor(null)} title="Visualizar Médico" size="full" className="max-w-7xl max-h-[98vh]">
        {viewDoctor && (
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
                    <p className="text-sm text-gray-900">{viewDoctor.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">CPF</label>
                    <p className="text-sm text-gray-900">{viewDoctor.profile?.cpf || 'N/A'}</p>
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
                    <p className="text-sm text-gray-900">{viewDoctor.profile?.name || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Data Nasc.</label>
                      <p className="text-sm text-gray-900">
                        {viewDoctor.profile?.birth_date 
                          ? new Date(viewDoctor.profile.birth_date).toLocaleDateString('pt-BR') 
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Gênero</label>
                      <p className="text-sm text-gray-900">{viewDoctor.profile?.gender || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">CRM</label>
                    <p className="text-sm text-gray-900">
                      {viewDoctor.profile?.profile_doctor?.crm_number 
                        ? `${viewDoctor.profile.profile_doctor.crm_number}/${viewDoctor.profile.profile_doctor.crm_uf}` 
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Especialidade</label>
                    <p className="text-sm text-gray-900">{viewDoctor.profile?.profile_doctor?.specialty || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Telefones e E-mails em linha */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Telefones */}
              {viewDoctor.profile?.profile_phones && viewDoctor.profile.profile_phones.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-purple-600" />
                    Telefones
                  </h3>
                  <div className="space-y-1">
                    {viewDoctor.profile.profile_phones.map((phone, idx) => (
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
              {viewDoctor.profile?.profile_emails && viewDoctor.profile.profile_emails.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-600" />
                    E-mails
                  </h3>
                  <div className="space-y-1">
                    {viewDoctor.profile.profile_emails.map((email, idx) => (
                      <div key={idx} className="p-2 bg-white rounded border text-sm">
                        <span className="text-gray-700">{email.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Endereços - Layout compacto */}
            {viewDoctor.profile?.profile_addresses && viewDoctor.profile.profile_addresses.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  Endereços
                </h3>
                <div className="space-y-2">
                  {viewDoctor.profile.profile_addresses.map((address, idx) => (
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

            {/* Informações do Sistema */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-600" />
                Informações do Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Criado em</label>
                  <p className="text-sm text-gray-900">
                    {new Date(viewDoctor.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Atualizado em</label>
                  <p className="text-sm text-gray-900">
                    {new Date(viewDoctor.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Botão de fechar */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewDoctor(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
      {/* Modal de confirmação de exclusão */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Excluir Médico" size="sm">
        <div className="text-gray-800 text-base mb-4">Deseja realmente excluir este médico?</div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
          <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Doctors; 