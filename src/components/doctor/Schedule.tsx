import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Plus, 
  Filter, 
  AlertCircle, 
  Video, 
  Clock3, 
  Stethoscope, 
  CalendarIcon, 
  Building2, 
  CalendarDays, 
  MoreVertical, 
  CheckCircle, 
  Edit, 
  X,
  MessageCircle,
  List
} from 'lucide-react';
import { usePermission, PERMISSIONS } from '../../hooks/usePermission';

// Tipos atualizados para a API
interface MedicalSchedule {
  id: string;
  doctor_id: string;
  health_unit_id: string;
  start_datetime: string;
  end_datetime: string;
  status: 'pending' | 'confirmed' | 'temporary' | 'cancelled';
  total_slots: number;
  available_slots: number;
  is_recurring: boolean;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_end_date?: string;
  recurrence_weekdays?: string;
  substitute_doctor_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  doctor: {
    id: string;
    profile: {
      id: string;
      name: string;
      profile_doctor?: {
        crm_number: string;
        crm_uf: string;
      };
    };
  };
  health_unit: {
    id: string;
    name: string;
    address: string;
    phone?: string;
  };
  substitute_doctor?: {
    id: string;
    profile: {
      id: string;
      name: string;
      profile_doctor?: {
        crm_number: string;
        crm_uf: string;
      };
    };
  };
}

interface Appointment {
  id: string;
  patient_name: string;
  patient_id: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type: 'consultation' | 'follow_up' | 'emergency' | 'online';
  notes?: string;
  health_unit: string;
  room?: string;
  patient_phone?: string;
  patient_email?: string;
}

interface FilterOptions {
  period: 'today' | 'week' | 'month' | 'custom' | 'all';
  ubs: string;
  status: string;
  type: string;
  view: 'list' | 'calendar';
}

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<MedicalSchedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    period: 'week',
    ubs: 'all',
    status: 'all',
    type: 'all',
    view: 'list'
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Garantir que schedules seja sempre um array
  const safeSchedules = Array.isArray(schedules) ? schedules : [];

  // Carregar dados da API
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        
                 // Buscar escalas médicas da API
        console.log('🔍 [SCHEDULE] Fazendo requisição para /medical-schedules/my-schedules');
        const response = await api.get('/medical-schedules/my-schedules');
        console.log('🔍 [SCHEDULE] Resposta da API:', response.data);
        console.log('🔍 [SCHEDULE] Tipo da resposta:', typeof response.data);
        console.log('🔍 [SCHEDULE] É array?', Array.isArray(response.data));

        if (response.data && Array.isArray(response.data)) {
          setSchedules(response.data);
        } else {
          console.log('🔍 [SCHEDULE] Resposta não é array, definindo array vazio');
          setSchedules([]);
        }
        
        // Por enquanto, manter agendamentos mockados até implementar a API de agendamentos
        const mockAppointments: Appointment[] = [
          {
            id: '1',
            patient_name: 'Maria Silva Santos',
            patient_id: 'P001',
            date: '2025-01-27',
            time: '08:00',
            status: 'scheduled',
            type: 'consultation',
            health_unit: 'UBS Vila Nova',
            room: 'Sala 2',
            notes: 'Paciente com diabetes - controle de glicemia',
            patient_phone: '(11) 99999-1111',
            patient_email: 'maria.silva@email.com'
          },
          {
            id: '2',
            patient_name: 'João Pereira Lima',
            patient_id: 'P002',
            date: '2025-01-27',
            time: '09:30',
            status: 'scheduled',
            type: 'follow_up',
            health_unit: 'UBS Vila Nova',
            room: 'Sala 2',
            notes: 'Retorno - exames de rotina',
            patient_phone: '(11) 99999-2222',
            patient_email: 'joao.lima@email.com'
          },
          {
            id: '3',
            patient_name: 'Ana Costa Ferreira',
            patient_id: 'P003',
            date: '2025-01-27',
            time: '11:00',
            status: 'scheduled',
            type: 'consultation',
            health_unit: 'UBS Vila Nova',
            room: 'Sala 2',
            patient_phone: '(11) 99999-3333',
            patient_email: 'ana.costa@email.com'
          },
          {
            id: '4',
            patient_name: 'Pedro Santos Oliveira',
            patient_id: 'P004',
            date: '2025-01-28',
            time: '14:00',
            status: 'scheduled',
            type: 'online',
            health_unit: 'UBS Centro',
            notes: 'Consulta online - telemedicina',
            patient_phone: '(11) 99999-4444',
            patient_email: 'pedro.oliveira@email.com'
          },
          {
            id: '5',
            patient_name: 'Lucia Mendes Silva',
            patient_id: 'P005',
            date: '2025-01-28',
            time: '15:30',
            status: 'scheduled',
            type: 'consultation',
            health_unit: 'UBS Centro',
            room: 'Sala 1',
            patient_phone: '(11) 99999-5555',
            patient_email: 'lucia.mendes@email.com'
          },
          {
            id: '6',
            patient_name: 'Roberto Almeida Costa',
            patient_id: 'P006',
            date: '2025-01-29',
            time: '13:00',
            status: 'scheduled',
            type: 'emergency',
            health_unit: 'UBS Jardim São Paulo',
            room: 'Sala 3',
            notes: 'Urgência - dor abdominal',
            patient_phone: '(11) 99999-6666',
            patient_email: 'roberto.costa@email.com'
          },
          {
            id: '7',
            patient_name: 'Fernanda Lima Santos',
            patient_id: 'P007',
            date: '2025-01-29',
            time: '14:30',
            status: 'scheduled',
            type: 'follow_up',
            health_unit: 'UBS Jardim São Paulo',
            room: 'Sala 3',
            notes: 'Retorno - controle de pressão',
            patient_phone: '(11) 99999-7777',
            patient_email: 'fernanda.lima@email.com'
          }
        ];

        setAppointments(mockAppointments);
        setFilteredAppointments(mockAppointments);
        
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        setError(err.response?.data?.message || 'Erro ao carregar dados da agenda');
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = appointments;

    // Filtro por período
    if (filters.period !== 'all') {
      const today = new Date();
      const startDate = new Date();
      
      switch (filters.period) {
        case 'today':
          filtered = filtered.filter(a => a.date === today.toISOString().split('T')[0]);
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(a => new Date(a.date) >= startDate);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(a => new Date(a.date) >= startDate);
          break;
      }
    }

    // Filtro por UBS
    if (filters.ubs !== 'all') {
      filtered = filtered.filter(a => a.health_unit === filters.ubs);
    }

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(a => a.status === filters.status);
    }

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(a => a.type === filters.type);
    }

    setFilteredAppointments(filtered);
  }, [appointments, filters]);

  // Verificar permissão após os hooks
  if (!hasPermission(PERMISSIONS.DOCTOR_SCHEDULE_VIEW)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar a agenda médica.</p>
        </div>
      </div>
    );
  }

  // Funções de ação
  const handleStartAppointment = (appointment: Appointment) => {
    console.log('Iniciando consulta:', appointment);
    // Implementar lógica de início de consulta
  };

  const handleReschedule = (appointment: Appointment) => {
    console.log('Reagendando:', appointment);
    // Implementar lógica de reagendamento
  };

  const handleCancel = (appointment: Appointment) => {
    console.log('Cancelando:', appointment);
    // Implementar lógica de cancelamento
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'scheduled': return 'Agendada';
      case 'in_progress': return 'Em andamento';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconhecido';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'online': return <Video className="w-4 h-4" />;
      case 'emergency': return <AlertCircle className="w-4 h-4" />;
      case 'follow_up': return <Clock3 className="w-4 h-4" />;
      default: return <Stethoscope className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      case 'follow_up': return 'text-purple-600 bg-purple-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-xl shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar agenda</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Calendar className="text-blue-600" size={36} />
                      <div>
              <h1 className="text-3xl font-bold text-gray-900">Agenda do Médico</h1>
              <p className="text-gray-500 text-base">
                {safeSchedules.length > 0 && safeSchedules[0]?.doctor?.profile?.name 
                  ? `Dr. ${safeSchedules[0].doctor.profile.name}` 
                  : 'Carregando...'}
                {safeSchedules.length > 0 && safeSchedules[0]?.doctor?.profile?.profile_doctor?.crm_number 
                  ? ` - CRM ${safeSchedules[0].doctor.profile.profile_doctor.crm_number}/${safeSchedules[0].doctor.profile.profile_doctor.crm_uf}` 
                  : ''}
              </p>
            </div>
        </div>
        <button
          onClick={() => navigate('/doctor/appointments/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          <select
            value={filters.period}
            onChange={(e) => setFilters({...filters, period: e.target.value as any})}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="custom">Personalizado</option>
          </select>

          <select
            value={filters.ubs}
            onChange={(e) => setFilters({...filters, ubs: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas as UBS</option>
            {safeSchedules.map((schedule) => (
              <option key={schedule.health_unit?.id || schedule.id} value={schedule.health_unit?.name || 'UBS não informada'}>
                {schedule.health_unit?.name || 'UBS não informada'}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="scheduled">Agendada</option>
            <option value="in_progress">Em andamento</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="consultation">Consulta</option>
            <option value="follow_up">Retorno</option>
            <option value="emergency">Urgência</option>
            <option value="online">Online</option>
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setFilters({...filters, view: 'list'})}
              className={`p-2 rounded-lg ${filters.view === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFilters({...filters, view: 'calendar'})}
              className={`p-2 rounded-lg ${filters.view === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Escalas */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Minhas Escalas</h2>
            </div>
                        <div className="space-y-4">
              {safeSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhuma escala encontrada</p>
                  <p className="text-sm text-gray-400">Suas escalas médicas aparecerão aqui</p>
                </div>
              ) : (
                safeSchedules.map((schedule) => (
              <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{schedule.health_unit?.name || 'UBS não informada'}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {schedule.doctor?.profile?.profile_doctor?.crm_number 
                      ? `CRM ${schedule.doctor.profile.profile_doctor.crm_number}/${schedule.doctor.profile.profile_doctor.crm_uf}`
                      : 'Médico'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{schedule.health_unit?.address || 'Endereço não informado'}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(schedule.start_datetime).toLocaleTimeString('pt-BR', { hour: 'numeric', minute: 'numeric' })} - {new Date(schedule.end_datetime).toLocaleTimeString('pt-BR', { hour: 'numeric', minute: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{schedule.health_unit?.address || 'Endereço não informado'}</span>
                  </div>
                                    <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {new Date(schedule.start_datetime).toLocaleDateString('pt-BR', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {schedule.is_recurring && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Recorrente
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      schedule.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      schedule.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      schedule.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.status === 'confirmed' ? 'Confirmada' :
                       schedule.status === 'pending' ? 'Pendente' :
                       schedule.status === 'cancelled' ? 'Cancelada' :
                       schedule.status === 'temporary' ? 'Temporária' : schedule.status}
                    </span>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        </div>

        {/* Agendamentos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Agendamentos</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {filteredAppointments.length} encontrados
                </span>
              </div>
            </div>

            {filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getTypeColor(appointment.type)}`}>
                          {getTypeIcon(appointment.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.patient_name}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                        <button
                          onClick={() => handleViewDetails(appointment)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{appointment.health_unit}</span>
                      </div>
                      {appointment.room && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{appointment.room}</span>
                        </div>
                      )}
                    </div>

                    {appointment.notes && (
                      <p className="text-sm text-blue-600 mb-3">📝 {appointment.notes}</p>
                    )}

                    <div className="flex items-center gap-2">
                      {appointment.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleStartAppointment(appointment)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Iniciar
                          </button>
                          <button
                            onClick={() => handleReschedule(appointment)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Reagendar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleCancel(appointment)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhum agendamento encontrado para os filtros selecionados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalhes da Consulta</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Paciente</h4>
                  <p className="text-gray-700">{selectedAppointment.patient_name}</p>
                  <p className="text-sm text-gray-500">ID: {selectedAppointment.patient_id}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data e Horário</h4>
                  <p className="text-gray-700">
                    {new Date(selectedAppointment.date).toLocaleDateString('pt-BR')} às {selectedAppointment.time}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Local</h4>
                  <p className="text-gray-700">{selectedAppointment.health_unit}</p>
                  {selectedAppointment.room && (
                    <p className="text-sm text-gray-500">Sala: {selectedAppointment.room}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tipo</h4>
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${getTypeColor(selectedAppointment.type)}`}>
                      {getTypeIcon(selectedAppointment.type)}
                    </div>
                    <span className="text-gray-700 capitalize">
                      {selectedAppointment.type === 'follow_up' ? 'Retorno' : 
                       selectedAppointment.type === 'online' ? 'Online' : 
                       selectedAppointment.type === 'emergency' ? 'Urgência' : 'Consulta'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                    {getStatusText(selectedAppointment.status)}
                  </span>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                    <p className="text-gray-700">{selectedAppointment.notes}</p>
                  </div>
                )}

                {selectedAppointment.patient_phone && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contato</h4>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4" />
                      <span>{selectedAppointment.patient_phone}</span>
                    </div>
                    {selectedAppointment.patient_email && (
                      <div className="flex items-center gap-2 text-gray-700 mt-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{selectedAppointment.patient_email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                {selectedAppointment.status === 'scheduled' && (
                  <button
                    onClick={() => {
                      handleStartAppointment(selectedAppointment);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Iniciar Consulta
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule; 