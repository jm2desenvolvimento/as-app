import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3, 
  Star, 
  Video, 
  Plus, 
  MessageCircle, 
  Settings, 
  CalendarDays, 
  Clock3, 
  Stethoscope, 
  Target, 
  Bell, 
  Zap, 
  BookOpen,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermission, PERMISSIONS } from '../../hooks/usePermission';
import { useIsMobile } from '../../hooks/useIsMobile';

// Tipos
interface DoctorData {
  id: string;
  name: string;
  email: string;
  specialty: string;
  crm: string;
  phone: string;
  health_unit: string;
  experience_years: number;
  rating: number;
  total_patients: number;
  total_appointments: number;
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
}

interface MetricCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subtitle?: string;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  permission: typeof PERMISSIONS[keyof typeof PERMISSIONS];
  color: string;
}

interface PerformanceMetric {
  title: string;
  value: string;
  target: string;
  percentage: number;
  color: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const isMobile = useIsMobile();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  // const [appointments] = useState<Appointment[]>([]); // Removido pois não está sendo usado
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Carregar dados do médico
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        
        // Simular delay de carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mockados para desenvolvimento
        setDoctorData({
          id: '1',
          name: 'Dr. João Silva',
          email: 'joao.silva@saude.gov.br',
          specialty: 'Clínico Geral',
          crm: '54321-SP',
          phone: '(11) 98765-4321',
          health_unit: 'UBS Vila Nova',
          experience_years: 12,
          rating: 4.7,
          total_patients: 892,
          total_appointments: 2156
        });

        const mockAppointments: Appointment[] = [
          {
            id: '1',
            patient_name: 'Maria Silva Santos',
            patient_id: 'P001',
            date: '2025-01-25',
            time: '08:00',
            status: 'completed',
            type: 'consultation',
            health_unit: 'UBS Vila Nova',
            room: 'Sala 2',
            notes: 'Paciente com diabetes - controle de glicemia'
          },
          {
            id: '2',
            patient_name: 'João Pereira Lima',
            patient_id: 'P002',
            date: '2025-01-25',
            time: '09:30',
            status: 'scheduled',
            type: 'follow_up',
            health_unit: 'UBS Vila Nova',
            room: 'Sala 2',
            notes: 'Retorno - exames de rotina'
          },
          {
            id: '3',
            patient_name: 'Ana Costa Ferreira',
            patient_id: 'P003',
            date: '2025-01-25',
            time: '11:00',
            status: 'scheduled',
            type: 'consultation',
            health_unit: 'UBS Vila Nova',
            room: 'Sala 2'
          },
          {
            id: '4',
            patient_name: 'Pedro Santos Oliveira',
            patient_id: 'P004',
            date: '2025-01-25',
            time: '14:00',
            status: 'scheduled',
            type: 'online',
            health_unit: 'UBS Vila Nova',
            notes: 'Consulta online - telemedicina'
          }
        ];

        // setAppointments(mockAppointments); // Removido pois appointments não existe mais
        setTodayAppointments(mockAppointments.filter(a => a.date === '2025-01-25'));

        setStats({
          todayAppointments: 4,
          completedToday: 1,
          pendingToday: 3,
          weeklyAppointments: 28,
          monthlyAppointments: 112,
          averageRating: 4.7,
          patientSatisfaction: 92,
          onlineConsultations: 15,
          emergencyCases: 5,
          followUps: 12,
          newPatients: 8
        });
        
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  // Verificar permissão após os hooks
  if (!hasPermission(PERMISSIONS.DASHBOARD_DOCTOR_VIEW)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar o dashboard médico.</p>
        </div>
      </div>
    );
  }

  // Métricas principais seguindo padrão do sistema
  const metricCards: MetricCard[] = [
    {
      title: 'Consultas Hoje',
      value: stats?.todayAppointments || 0,
      icon: <Calendar size={28} />,
      colorClass: 'text-blue-500 bg-blue-100 border-b-4 border-blue-400',
      trend: 'up',
      trendValue: '+1 vs ontem',
      subtitle: '3 pendentes'
    },
    {
      title: 'Pacientes Atendidos',
      value: stats?.completedToday || 0,
      icon: <UserCheck size={28} />,
      colorClass: 'text-green-500 bg-green-100 border-b-4 border-green-400',
      trend: 'up',
      trendValue: '+1 esta manhã'
    },
    {
      title: 'Avaliação Média',
      value: `${stats?.averageRating || 0}/5.0`,
      icon: <Star size={28} />,
      colorClass: 'text-yellow-500 bg-yellow-100 border-b-4 border-yellow-400',
      subtitle: `${stats?.patientSatisfaction || 0}% satisfação`
    },
    {
      title: 'Consultas Online',
      value: stats?.onlineConsultations || 0,
      icon: <Video size={28} />,
      colorClass: 'text-purple-500 bg-purple-100 border-b-4 border-purple-400',
      trend: 'up',
      trendValue: '+3 este mês'
    }
  ];

  // Métricas de performance
  const performanceMetrics: PerformanceMetric[] = [
    {
      title: 'Taxa de Comparecimento',
      value: '92%',
      target: '90%',
      percentage: 92,
      color: 'bg-green-500'
    },
    {
      title: 'Tempo Médio de Consulta',
      value: '22 min',
      target: '25 min',
      percentage: 88,
      color: 'bg-blue-500'
    },
    {
      title: 'Satisfação do Paciente',
      value: '92%',
      target: '90%',
      percentage: 92,
      color: 'bg-yellow-500'
    },
    {
      title: 'Eficiência de Agendamento',
      value: '85%',
      target: '85%',
      percentage: 85,
      color: 'bg-purple-500'
    }
  ];

  // Ações rápidas para médicos
  const quickActions: QuickAction[] = [
    {
      label: 'Nova Consulta',
      icon: <Plus className="w-5 h-5" />,
      action: () => navigate('/doctor/appointments/new'),
      permission: PERMISSIONS.APPOINTMENT_CREATE,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'Telemedicina',
      icon: <Video className="w-5 h-5" />,
      action: () => navigate('/doctor/telemedicine'),
      permission: PERMISSIONS.MEDICAL_SCHEDULE_VIEW,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'Prontuários',
      icon: <FileText className="w-5 h-5" />,
      action: () => navigate('/doctor/medical-records'),
      permission: PERMISSIONS.MEDICAL_RECORD_VIEW,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      label: 'Chat Médico',
      icon: <MessageCircle className="w-5 h-5" />,
      action: () => navigate('/doctor/chat'),
      permission: PERMISSIONS.NOTIFICATION_VIEW,
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      label: 'Relatórios',
      icon: <BarChart3 className="w-5 h-5" />,
      action: () => navigate('/doctor/reports'),
      permission: PERMISSIONS.REPORT_VIEW,
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      label: 'Configurações',
      icon: <Settings className="w-5 h-5" />,
      action: () => navigate('/doctor/settings'),
      permission: PERMISSIONS.CONFIG_VIEW,
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  // Estatísticas mensais
  const monthlyStats = [
    { label: 'Total de Consultas', value: stats?.monthlyAppointments || 0, icon: <CalendarDays className="w-4 h-4" />, color: 'text-blue-600' },
    { label: 'Novos Pacientes', value: stats?.newPatients || 0, icon: <UserCheck className="w-4 h-4" />, color: 'text-green-600' },
    { label: 'Retornos', value: stats?.followUps || 0, icon: <Clock3 className="w-4 h-4" />, color: 'text-purple-600' },
    { label: 'Urgências', value: stats?.emergencyCases || 0, icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-600' }
  ];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dashboard</h2>
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
      {/* Header seguindo padrão do sistema */}
      <div className="mb-6 flex items-center gap-4">
        <TrendingUp className="text-blue-600" size={36} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Médico
          </h1>
          <p className="text-gray-500 text-base">
            Painel de controle e estatísticas
          </p>
        </div>
      </div>

      {/* Card de Boas-vindas */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Lado Esquerdo - Informações Gerais */}
          <div className="flex-1 p-8 border-r border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-1 h-16 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">
                    {new Date().toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Olá, Dr. {doctorData?.name?.split(' ')[1] || 'Médico'}!
                </h2>
                <p className="text-gray-600 mb-4">
                  Bem-vindo ao seu dashboard. Você tem {todayAppointments.length} consulta{todayAppointments.length !== 1 ? 's' : ''} agendada{todayAppointments.length !== 1 ? 's' : ''} para hoje.
                </p>
                {todayAppointments.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Próxima consulta às {todayAppointments[0]?.time}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lado Direito - Próxima Consulta */}
          <div className="lg:w-80 bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Próxima Consulta</h3>
            </div>
            
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Paciente</p>
                  <p className="font-semibold text-lg">{todayAppointments[0]?.patient_name}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Data e Horário</p>
                  <p className="font-semibold">Hoje às {todayAppointments[0]?.time}</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                    Detalhes
                  </button>
                  <button className="flex-1 bg-white text-blue-700 hover:bg-blue-50 text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                    Iniciar Consulta
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-blue-100 mb-2">Nenhuma consulta agendada</p>
                <p className="text-blue-200 text-sm">Você está livre hoje!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {metricCards.map((card, index) => (
          <div key={index} className={`flex items-center bg-white rounded-xl shadow p-5 min-w-[220px] border-b-4 ${card.colorClass} transition hover:scale-105 hover:shadow-lg`}>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 text-2xl ${card.colorClass.replace('border-b-4', '')}`}>
              {card.icon}
            </div>
            <div>
              <div className="text-gray-500 text-sm font-medium">{card.title}</div>
              <div className="text-3xl font-bold text-gray-900">{card.value}</div>
              {card.subtitle && (
                <div className="text-xs text-gray-500 mt-1">{card.subtitle}</div>
              )}
              {card.trend && (
                <div className="flex items-center gap-1 mt-1">
                  {card.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : card.trend === 'down' ? (
                    <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                  ) : null}
                  <span className="text-xs text-gray-500">{card.trendValue}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => {
            if (!hasPermission(action.permission)) return null;
            
            return (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center gap-2`}
              >
                {action.icon}
                <span className="text-sm font-medium text-center">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Agenda do Dia */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-500" size={20} /> Agenda do Dia
            </span>
            <button 
              onClick={() => navigate('/doctor/appointments')}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Ver agenda completa →
            </button>
          </div>
          <div className="space-y-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      appointment.type === 'online' ? 'bg-green-100' :
                      appointment.type === 'emergency' ? 'bg-red-100' :
                      appointment.type === 'follow_up' ? 'bg-purple-100' :
                      'bg-blue-100'
                    }`}>
                      {appointment.type === 'online' ? (
                        <Video className="w-5 h-5 text-green-600" />
                      ) : appointment.type === 'emergency' ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : appointment.type === 'follow_up' ? (
                        <Clock className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{appointment.patient_name}</p>
                      <p className="text-sm text-gray-600">
                        {appointment.time} • {appointment.room || 'Sala não definida'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.type === 'online' ? 'Consulta Online' :
                         appointment.type === 'emergency' ? 'Urgência' :
                         appointment.type === 'follow_up' ? 'Retorno' : 'Consulta'}
                      </p>
                      {appointment.notes && (
                        <p className="text-xs text-blue-600 mt-1">📝 {appointment.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status === 'completed' ? 'Concluída' :
                       appointment.status === 'scheduled' ? 'Agendada' :
                       appointment.status === 'in_progress' ? 'Em andamento' :
                       'Cancelada'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma consulta agendada para hoje</p>
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas de Performance */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-lg text-gray-800">Performance</span>
          </div>
          <div className="space-y-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{metric.title}</span>
                  <span className="text-sm font-bold text-gray-900">{metric.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${metric.color}`}
                    style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Meta: {metric.target}</span>
                  <span>{metric.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estatísticas Mensais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {monthlyStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-full bg-gray-100 ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas e Notificações */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold text-lg text-gray-800">Alertas e Notificações</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">3 consultas pendentes para hoje</p>
              <p className="text-xs text-yellow-600">Próxima consulta em 15 minutos</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">5 prontuários para revisar</p>
              <p className="text-xs text-blue-600">Exames recentes disponíveis</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Avaliação 5 estrelas recebida</p>
              <p className="text-xs text-green-600">Paciente Maria Silva Santos</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Video className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-purple-800">2 consultas online agendadas</p>
              <p className="text-xs text-purple-600">Para hoje às 11:00 e 15:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recursos Úteis */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-lg text-gray-800">Recursos Úteis</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Protocolos Médicos</p>
              <p className="text-xs text-gray-600">Guias e procedimentos</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <FileText className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Relatórios</p>
              <p className="text-xs text-gray-600">Estatísticas e métricas</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Suporte Técnico</p>
              <p className="text-xs text-gray-600">Ajuda e orientações</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <Settings className="w-5 h-5 text-yellow-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Configurações</p>
              <p className="text-xs text-gray-600">Preferências pessoais</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
