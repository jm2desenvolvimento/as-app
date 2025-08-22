import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  Video, 
  Download, 
  MessageCircle, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Thermometer, 
  Pill, 
  Shield, 
  Info, 
  BookOpen, 
  FileHeart,
  FileText
} from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';

// Tipos
interface PatientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  birth_date: string;
  blood_type?: string;
  allergies?: string[];
  emergency_contact?: string;
  emergency_contact_name?: string;
  medications?: string[];
  chronic_conditions?: string[];
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor_name: string;
  specialty: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  health_unit: string;
  notes?: string;
  is_online?: boolean;
}

interface MedicalDocument {
  id: string;
  name: string;
  type: 'exam' | 'prescription' | 'report' | 'other';
  date: string;
  status: 'pending' | 'completed' | 'available';
  doctor_name?: string;
  result?: string;
  file_url?: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  permission: 'appointment_create' | 'medical_record_view' | 'notification_view';
  color: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  // const [stats] = useState<any>(null); // Removido pois não está sendo usado

  // Verificar permissão
  if (!hasPermission('dashboard_patient_view')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar o dashboard.</p>
        </div>
      </div>
    );
  }

  // Carregar dados do paciente
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        
        // Simular delay de carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mockados para desenvolvimento
        setPatientData({
          id: '1',
          name: 'Maria Silva Santos',
          email: 'maria.silva@email.com',
          phone: '(11) 99999-9999',
          birth_date: '1985-03-15',
          blood_type: 'O+',
          allergies: ['Penicilina', 'Dermatite'],
          emergency_contact: '(11) 88888-8888',
          emergency_contact_name: 'João Silva (Esposo)',
          medications: ['Losartana 50mg', 'Metformina 850mg'],
          chronic_conditions: ['Hipertensão', 'Diabetes Tipo 2']
        });

        setAppointments([
          {
            id: '1',
            date: '2025-01-25',
            time: '14:00',
            doctor_name: 'Dr. Carlos Eduardo',
            specialty: 'Cardiologia',
            status: 'scheduled',
            health_unit: 'UBS Vila Nova',
            is_online: false,
            notes: 'Consulta de rotina - trazer exames recentes'
          },
          {
            id: '2',
            date: '2025-01-20',
            time: '09:30',
            doctor_name: 'Dra. Ana Paula',
            specialty: 'Clínico Geral',
            status: 'completed',
            health_unit: 'UBS Centro',
            is_online: false
          },
          {
            id: '3',
            date: '2025-01-15',
            time: '16:00',
            doctor_name: 'Dr. Roberto Silva',
            specialty: 'Ortopedia',
            status: 'completed',
            health_unit: 'UBS Jardim',
            is_online: true
          },
          {
            id: '4',
            date: '2025-02-05',
            time: '10:00',
            doctor_name: 'Dra. Fernanda Costa',
            specialty: 'Endocrinologia',
            status: 'scheduled',
            health_unit: 'UBS Centro',
            is_online: true,
            notes: 'Consulta online - verificar glicemia'
          }
        ]);

        setDocuments([
          {
            id: '1',
            name: 'Exame de Sangue Completo',
            type: 'exam',
            date: '2025-01-18',
            status: 'completed',
            doctor_name: 'Dra. Ana Paula',
            result: 'Normal',
            file_url: '/documents/exame-sangue.pdf'
          },
          {
            id: '2',
            name: 'Ressonância Magnética - Joelho',
            type: 'exam',
            date: '2025-01-22',
            status: 'pending',
            doctor_name: 'Dr. Carlos Eduardo'
          },
          {
            id: '3',
            name: 'Prescrição Médica - Losartana',
            type: 'prescription',
            date: '2025-01-20',
            status: 'available',
            doctor_name: 'Dra. Ana Paula',
            file_url: '/documents/prescricao-losartana.pdf'
          },
          {
            id: '4',
            name: 'Hemograma',
            type: 'exam',
            date: '2025-01-10',
            status: 'completed',
            doctor_name: 'Dra. Ana Paula',
            result: 'Leucócitos elevados',
            file_url: '/documents/hemograma.pdf'
          }
        ]);

        // setStats({
        //   totalAppointments: 15,
        //   completedAppointments: 12,
        //   scheduledAppointments: 3,
        //   pendingDocuments: 2,
        //   nextAppointment: '2025-01-25T14:00:00'
        // }); // Removido pois stats não existe mais
        
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  // Métricas seguindo padrão do master
  const metricCards: MetricCard[] = [
    {
      title: 'Consultas Agendadas',
      value: appointments.filter(a => a.status === 'scheduled').length,
      icon: <Calendar size={28} />,
      colorClass: 'text-blue-500 bg-blue-100 border-b-4 border-blue-400',
      trend: 'up',
      trendValue: '+2 este mês'
    },
    {
      title: 'Consultas Realizadas',
      value: appointments.filter(a => a.status === 'completed').length,
      icon: <CheckCircle size={28} />,
      colorClass: 'text-green-500 bg-green-100 border-b-4 border-green-400',
      trend: 'up',
      trendValue: '+5 este ano'
    },
    {
      title: 'Próxima Consulta',
      value: appointments.find(a => a.status === 'scheduled')?.date ? 
        new Date(appointments.find(a => a.status === 'scheduled')!.date).toLocaleDateString('pt-BR') : 
        'Nenhuma',
      icon: <Clock size={28} />,
      colorClass: 'text-purple-500 bg-purple-100 border-b-4 border-purple-400'
    },
    {
      title: 'Exames Pendentes',
      value: documents.filter(d => d.status === 'pending').length,
      icon: <FileText size={28} />,
      colorClass: 'text-yellow-500 bg-yellow-100 border-b-4 border-yellow-400',
      trend: 'down',
      trendValue: '-1 esta semana'
    }
  ];

  // Ações rápidas expandidas
  const quickActions: QuickAction[] = [
    {
      label: 'Agendar Consulta',
      icon: <Plus className="w-5 h-5" />,
      action: () => navigate('/patient/appointments/new'),
      permission: 'appointment_create',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'Telemedicina',
      icon: <Video className="w-5 h-5" />,
      action: () => navigate('/patient/telemedicine'),
      permission: 'appointment_create',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'Meu Prontuário',
      icon: <FileText className="w-5 h-5" />,
      action: () => navigate('/patient/medical-record'),
      permission: 'medical_record_view',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      label: 'Documentos',
      icon: <Download className="w-5 h-5" />,
      action: () => navigate('/patient/documents'),
      permission: 'medical_record_view',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      label: 'Chat Médico',
      icon: <MessageCircle className="w-5 h-5" />,
      action: () => navigate('/patient/chat'),
      permission: 'notification_view',
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      label: 'Notificações',
      icon: <Bell className="w-5 h-5" />,
      action: () => navigate('/patient/notifications'),
      permission: 'notification_view',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    }
  ];

  // Próximas consultas
  const upcomingAppointments = appointments
    .filter(a => a.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Últimas consultas
  const recentAppointments = appointments
    .filter(a => a.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Documentos recentes
  const recentDocuments = documents
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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
      {/* Header seguindo padrão do master */}
      <div className="mb-6 flex items-center gap-4">
        <TrendingUp className="text-blue-600" size={36} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {patientData?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 text-base">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Cards de Métricas seguindo padrão do master */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {metricCards.map((card, index) => (
          <div key={index} className={`flex items-center bg-white rounded-xl shadow p-5 min-w-[220px] border-b-4 ${card.colorClass} transition hover:scale-105 hover:shadow-lg`}>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 text-2xl ${card.colorClass.replace('border-b-4', '')}`}>
              {card.icon}
            </div>
            <div>
              <div className="text-gray-500 text-sm font-medium">{card.title}</div>
              <div className="text-3xl font-bold text-gray-900">{card.value}</div>
              {card.trend && (
                <div className="flex items-center gap-1 mt-1">
                  {card.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : card.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  ) : null}
                  <span className="text-xs text-gray-500">{card.trendValue}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Ações Rápidas Expandidas */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => {
            // Verificar permissão
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

      {/* Seções Informativas Expandidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Próximas Consultas */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-500" size={20} /> Próximas Consultas
            </span>
            <button 
              onClick={() => navigate('/patient/appointments')}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Ver todas →
            </button>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      appointment.is_online ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {appointment.is_online ? (
                        <Video className="w-5 h-5 text-green-600" />
                      ) : (
                        <Calendar className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{appointment.doctor_name}</p>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                      </p>
                      <p className="text-xs text-gray-500">{appointment.health_unit}</p>
                      {appointment.notes && (
                        <p className="text-xs text-blue-600 mt-1">📝 {appointment.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.is_online ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {appointment.is_online ? 'Online' : 'Presencial'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma consulta agendada</p>
                <button 
                  onClick={() => navigate('/patient/appointments/new')}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Agendar consulta
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Últimas Consultas */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <CheckCircle className="text-blue-500" size={20} /> Últimas Consultas
            </span>
            <button 
              onClick={() => navigate('/patient/appointments')}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Ver histórico →
            </button>
          </div>
          <div className="space-y-4">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      appointment.is_online ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {appointment.is_online ? (
                        <Video className="w-5 h-5 text-green-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{appointment.doctor_name}</p>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                      </p>
                      <p className="text-xs text-gray-500">{appointment.health_unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Realizada
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma consulta realizada</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seções Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Informações de Saúde */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-lg text-gray-800">Informações de Saúde</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Tipo Sanguíneo</span>
              </div>
              <span className="text-sm font-bold text-blue-600">{patientData?.blood_type || 'Não informado'}</span>
            </div>
            
            {patientData?.medications && patientData.medications.length > 0 && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Medicamentos</span>
                </div>
                <div className="space-y-1">
                  {patientData.medications.map((med, index) => (
                    <p key={index} className="text-xs text-purple-700">• {med}</p>
                  ))}
                </div>
              </div>
            )}

            {patientData?.chronic_conditions && patientData.chronic_conditions.length > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Condições Crônicas</span>
                </div>
                <div className="space-y-1">
                  {patientData.chronic_conditions.map((condition, index) => (
                    <p key={index} className="text-xs text-orange-700">• {condition}</p>
                  ))}
                </div>
              </div>
            )}

            {patientData?.emergency_contact && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Contato de Emergência</span>
                </div>
                <p className="text-xs text-green-700">{patientData.emergency_contact_name}</p>
                <p className="text-xs text-green-700">{patientData.emergency_contact}</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertas Médicos */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-lg text-gray-800">Alertas Médicos</span>
          </div>
          <div className="space-y-3">
            {patientData?.allergies && patientData.allergies.length > 0 ? (
              patientData.allergies.map((allergy, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Alergia: {allergy}</p>
                    <p className="text-xs text-red-600">Informe sempre aos médicos</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Heart className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Nenhum alerta médico</p>
              </div>
            )}
          </div>
        </div>

        {/* Documentos Recentes */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <FileText className="text-blue-500" size={20} /> Documentos Recentes
            </span>
            <button 
              onClick={() => navigate('/patient/documents')}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Ver todos →
            </button>
          </div>
          <div className="space-y-4">
            {recentDocuments.length > 0 ? (
              recentDocuments.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{document.name}</p>
                      <p className="text-sm text-gray-600">{document.doctor_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(document.date).toLocaleDateString('pt-BR')}
                      </p>
                      {document.result && (
                        <p className="text-xs text-blue-600">📊 {document.result}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      document.status === 'completed' ? 'bg-green-100 text-green-800' :
                      document.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {document.status === 'completed' ? 'Disponível' :
                       document.status === 'pending' ? 'Pendente' : 'Processando'}
                    </span>
                    {document.file_url && (
                      <button className="block mt-1 text-xs text-blue-600 hover:text-blue-700">
                        📥 Download
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhum documento recente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seção de Recursos Úteis */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-lg text-gray-800">Recursos Úteis</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Guia de Saúde</p>
              <p className="text-xs text-gray-600">Dicas e informações úteis</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <FileHeart className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Meu Histórico</p>
              <p className="text-xs text-gray-600">Histórico completo de saúde</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Suporte</p>
              <p className="text-xs text-gray-600">Fale conosco</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
