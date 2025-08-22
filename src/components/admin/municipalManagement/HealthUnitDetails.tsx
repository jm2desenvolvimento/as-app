import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Edit2, Users, ClipboardList, Calendar, User, MapPin, Phone, Landmark, Mail, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const HealthUnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado para unidade real
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
            axios.get(`/healthunit/${id}`)
      .then(res => setUnit(res.data))
      .catch(() => setError('Erro ao buscar unidade de saúde'))
      .finally(() => setLoading(false));
  }, [id]);

  const [tab, setTab] = useState('geral');

  if (loading) return <div className="p-10 text-center text-blue-600 text-xl">Carregando...</div>;
  if (error || !unit) return <div className="p-10 text-center text-red-500 text-xl">{error || 'Unidade não encontrada'}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-16">
      {/* Header com gradiente sutil, breadcrumb e informações */}
      <div className="relative mb-8">
        {/* Gradiente mais visível de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-blue-50 to-indigo-100 rounded-2xl shadow-sm"></div>
        
        <div className="relative p-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
            <span>›</span>
            <span className="hover:text-blue-600 cursor-pointer">Gestão Municipal</span>
            <span>›</span>
            <span className="hover:text-blue-600 cursor-pointer">Unidades de Saúde</span>
            <span>›</span>
            <span className="text-blue-600 font-medium">{unit.name}</span>
          </div>

          {/* Título principal e botões de ação */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Detalhes da UBS: {unit.name}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {unit.city} - {unit.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Status: Ativa
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {unit.doctors} médicos
                  </span>
                </div>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/admin/municipal-management/health-units')} 
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <Edit2 className="h-4 w-4" /> Editar UBS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de indicadores melhorados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {/* Card Médicos */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-blue-100 hover:border-blue-200">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
                {unit.doctors}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Médicos Vinculados</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full" style={{width: `${Math.min((unit.doctors / 10) * 100, 100)}%`}}></div>
            </div>
          </div>
        </div>

        {/* Card Pacientes */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-green-100 hover:border-green-200">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
                {unit.patients}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Pacientes Cadastrados</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-1 rounded-full" style={{width: `${Math.min((unit.patients / 2000) * 100, 100)}%`}}></div>
            </div>
          </div>
        </div>

        {/* Card Prontuários */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-purple-100 hover:border-purple-200">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform duration-300">
                {unit.medicalRecords}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Prontuários</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 rounded-full" style={{width: `${Math.min((unit.medicalRecords / 1000) * 100, 100)}%`}}></div>
            </div>
          </div>
        </div>

        {/* Card Agendamentos */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-amber-100 hover:border-amber-200">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-amber-600 group-hover:scale-110 transition-transform duration-300">
                {unit.appointments}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Agendamentos Ativos</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-1 rounded-full" style={{width: `${Math.min((unit.appointments / 500) * 100, 100)}%`}}></div>
            </div>
          </div>
        </div>

        {/* Card Escalas */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-red-100 hover:border-red-200">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-red-600 group-hover:scale-110 transition-transform duration-300">
                {unit.schedules}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Escalas Médicas</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div className="bg-gradient-to-r from-red-500 to-red-600 h-1 rounded-full" style={{width: `${Math.min((unit.schedules / 20) * 100, 100)}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs modernas com ícones */}
      <div className="flex gap-1 mb-8 bg-white rounded-2xl shadow-lg p-2 border border-gray-100 overflow-x-auto">
        <button 
          onClick={() => setTab('geral')} 
          className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
            tab === 'geral' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Building2 className="h-5 w-5" /> Informações
        </button>
        <button 
          onClick={() => setTab('medicos')} 
          className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
            tab === 'medicos' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <User className="h-5 w-5" /> Médicos
        </button>
        <button 
          onClick={() => setTab('pacientes')} 
          className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
            tab === 'pacientes' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Users className="h-5 w-5" /> Pacientes
        </button>
        <button 
          onClick={() => setTab('prontuarios')} 
          className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
            tab === 'prontuarios' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <ClipboardList className="h-5 w-5" /> Prontuários
        </button>
        <button 
          onClick={() => setTab('agendamentos')} 
          className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
            tab === 'agendamentos' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Calendar className="h-5 w-5" /> Agendamentos
        </button>
        <button 
          onClick={() => setTab('escalas')} 
          className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
            tab === 'escalas' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Clock className="h-5 w-5" /> Escalas Médicas
        </button>
      </div>

      {/* Conteúdo das abas */}
      {tab === 'geral' && (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-6">
          <div className="text-xl font-bold mb-4">Informações da UBS</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700 text-base"><Building2 className="h-5 w-5 text-blue-400" /><span><strong>Nome da UBS</strong><br />{unit.name}</span></div>
              <div className="flex items-center gap-2 text-gray-700 text-base"><MapPin className="h-5 w-5 text-blue-400" /><span><strong>Endereço</strong><br />{unit.address}</span></div>
              <div className="flex items-center gap-2 text-gray-700 text-base"><Phone className="h-5 w-5 text-blue-400" /><span><strong>Telefone</strong><br />{unit.phone}</span></div>
              <div className="flex items-center gap-2 text-gray-700 text-base"><Mail className="h-5 w-5 text-blue-400" /><span><strong>E-mail</strong><br />{unit.contact}</span></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700 text-base"><Clock className="h-5 w-5 text-blue-400" /><span><strong>Horário de Funcionamento</strong><br />{unit.workingHours}</span></div>
              <div className="flex items-center gap-2 text-gray-700 text-base"><Landmark className="h-5 w-5 text-blue-400" /><span><strong>Prefeitura Vinculada</strong><br />{unit.cityHall}</span></div>
              <div className="flex items-center gap-2 text-gray-700 text-base"><CheckCircle className="h-5 w-5 text-green-500" /><span><strong>Status</strong><br /><span className="text-green-600 font-semibold">Ativo</span></span></div>
            </div>
          </div>
          <div className="flex gap-2 mt-6 justify-end">
            <button className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200">Editar Informações</button>
            <button className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Gerenciar Vínculos</button>
          </div>
        </div>
      )}
      {tab === 'medicos' && (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-6">
          <span className="text-gray-400">Lista de médicos aqui...</span>
        </div>
      )}
      {tab === 'pacientes' && (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-6">
          <span className="text-gray-400">Lista de pacientes aqui...</span>
        </div>
      )}
      {tab === 'prontuarios' && (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-6">
          <span className="text-gray-400">Lista de prontuários aqui...</span>
        </div>
      )}
      {tab === 'agendamentos' && (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-6">
          <span className="text-gray-400">Lista de agendamentos aqui...</span>
        </div>
      )}
      {tab === 'escalas' && (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-6">
          <span className="text-gray-400">Lista de escalas médicas aqui...</span>
        </div>
      )}
    </div>
  );
};

export default HealthUnitDetails; 