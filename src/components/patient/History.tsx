import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  X,
  Clock,
  FileText,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Video,
  MapPin,
  User,
  Stethoscope,
  TrendingUp,
  BarChart3,
  FileDown,
  Share2,
  Printer,
  CalendarDays,
  AlertCircle,
  Plus,
  ArrowLeft,
  MoreHorizontal,
  Star,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  History as HistoryIcon
} from 'lucide-react';
// Removidos imports de gráficos - não serão utilizados
import { usePermission, PERMISSIONS } from '../../hooks/usePermission';
import Modal from '../common/Modal';
import { PageHeader } from '../ui';

// Tipos
interface Appointment {
  id: string;
  date: string;
  time: string;
  duration: number; // em minutos
  doctor_name: string;
  doctor_email?: string;
  doctor_phone?: string;
  specialty: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  health_unit: string;
  is_online: boolean;
  notes?: string;
  next_appointment?: string;
  rating?: number;
  feedback?: string;
  documents?: {
    id: string;
    name: string;
    type: 'prescription' | 'exam_request' | 'report' | 'certificate';
    file_url?: string;
  }[];
}

interface FilterState {
  period: 'all' | '1m' | '3m' | '6m' | '1y' | 'custom';
  specialty: string;
  status: string;
  type: string;
  unit: string;
  search: string;
  startDate?: string;
  endDate?: string;
}

interface Statistics {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  attendanceRate: number;
  averageRating: number;
}

const History: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    period: 'all',
    specialty: '',
    status: '',
    type: '',
    unit: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'doctor' | 'specialty'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [itemsPerPage] = useState(10);

  // Verificar permissão
  if (!hasPermission(PERMISSIONS.PATIENT_HISTORY_VIEW)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar o histórico de consultas.</p>
        </div>
      </div>
    );
  }

  // Carregar dados
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Simular delay de carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mockados para desenvolvimento
        const mockAppointments: Appointment[] = [
          {
            id: '1',
            date: '2025-01-20',
            time: '09:30',
            duration: 30,
            doctor_name: 'Dra. Ana Paula Silva',
            doctor_email: 'ana.paula@ubs.com',
            doctor_phone: '(11) 3333-3333',
            specialty: 'Clínico Geral',
            status: 'completed',
            health_unit: 'UBS Centro',
            is_online: false,
            notes: 'Paciente apresentou dor de cabeça e febre. Exame físico normal.',
            next_appointment: '2025-02-20',
            rating: 5,
            feedback: 'Médica muito atenciosa e profissional',
            documents: [
              {
                id: '1',
                name: 'Prescrição - Paracetamol',
                type: 'prescription',
                file_url: '/documents/prescricao-paracetamol.pdf'
              },
              {
                id: '2',
                name: 'Solicitação - Hemograma',
                type: 'exam_request',
                file_url: '/documents/solicitacao-hemograma.pdf'
              }
            ]
          },
          {
            id: '2',
            date: '2025-01-15',
            time: '16:00',
            duration: 45,
            doctor_name: 'Dr. Roberto Silva',
            doctor_email: 'roberto.silva@ubs.com',
            doctor_phone: '(11) 4444-4444',
            specialty: 'Ortopedia',
            status: 'completed',
            health_unit: 'UBS Jardim',
            is_online: true,
            notes: 'Consulta online. Paciente com dor no joelho direito.',
            rating: 4,
            feedback: 'Consulta online muito eficiente',
            documents: [
              {
                id: '3',
                name: 'Prescrição - Anti-inflamatório',
                type: 'prescription',
                file_url: '/documents/prescricao-antiinflamatorio.pdf'
              }
            ]
          },
          {
            id: '3',
            date: '2025-01-10',
            time: '14:00',
            duration: 30,
            doctor_name: 'Dr. Carlos Eduardo',
            doctor_email: 'carlos.eduardo@ubs.com',
            doctor_phone: '(11) 5555-5555',
            specialty: 'Cardiologia',
            status: 'cancelled',
            health_unit: 'UBS Vila Nova',
            is_online: false,
            notes: 'Consulta cancelada pelo paciente'
          },
          {
            id: '4',
            date: '2024-12-28',
            time: '10:00',
            duration: 40,
            doctor_name: 'Dra. Fernanda Costa',
            doctor_email: 'fernanda.costa@ubs.com',
            doctor_phone: '(11) 6666-6666',
            specialty: 'Endocrinologia',
            status: 'completed',
            health_unit: 'UBS Centro',
            is_online: false,
            notes: 'Controle de diabetes. Glicemia controlada.',
            next_appointment: '2025-02-28',
            rating: 5,
            feedback: 'Excelente atendimento',
            documents: [
              {
                id: '4',
                name: 'Prescrição - Metformina',
                type: 'prescription',
                file_url: '/documents/prescricao-metformina.pdf'
              }
            ]
          },
          {
            id: '5',
            date: '2024-12-15',
            time: '11:30',
            duration: 25,
            doctor_name: 'Dra. Ana Paula Silva',
            specialty: 'Clínico Geral',
            status: 'no_show',
            health_unit: 'UBS Centro',
            is_online: false,
            notes: 'Paciente não compareceu'
          }
        ];

        setAppointments(mockAppointments);
        
        // Calcular estatísticas
        const stats: Statistics = {
          total: mockAppointments.length,
          completed: mockAppointments.filter(a => a.status === 'completed').length,
          cancelled: mockAppointments.filter(a => a.status === 'cancelled').length,
          noShow: mockAppointments.filter(a => a.status === 'no_show').length,
          attendanceRate: Math.round((mockAppointments.filter(a => a.status === 'completed').length / mockAppointments.length) * 100),
          averageRating: Math.round(mockAppointments.filter(a => a.rating).reduce((acc, a) => acc + (a.rating || 0), 0) / mockAppointments.filter(a => a.rating).length)
        };
        
        setStatistics(stats);
        
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
        setError('Erro ao carregar histórico de consultas');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Filtrar consultas
  useEffect(() => {
    let filtered = [...appointments];

    // Filtro por período
    if (filters.period !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.period) {
        case '1m':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3m':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(a => new Date(a.date) >= startDate);
    }

    // Filtro por especialidade
    if (filters.specialty) {
      filtered = filtered.filter(a => a.specialty === filters.specialty);
    }

    // Filtro por status
    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }

    // Filtro por tipo
    if (filters.type) {
      filtered = filtered.filter(a => 
        filters.type === 'online' ? a.is_online : !a.is_online
      );
    }

    // Filtro por unidade
    if (filters.unit) {
      filtered = filtered.filter(a => a.health_unit === filters.unit);
    }

    // Filtro por busca
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.doctor_name.toLowerCase().includes(search) ||
        a.specialty.toLowerCase().includes(search) ||
        a.health_unit.toLowerCase().includes(search) ||
        (a.notes && a.notes.toLowerCase().includes(search))
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        case 'doctor':
          comparison = a.doctor_name.localeCompare(b.doctor_name);
          break;
        case 'specialty':
          comparison = a.specialty.localeCompare(b.specialty);
          break;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    setFilteredAppointments(filtered);
    setCurrentPage(1);
  }, [appointments, filters, sortBy, sortOrder]);

  // Dados para gráficos removidos - não serão utilizados

  // Obter especialidades únicas
  const specialties = [...new Set(appointments.map(a => a.specialty))];
  const units = [...new Set(appointments.map(a => a.health_unit))];

  // Calcular paginação
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  // Funções auxiliares
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Realizada';
      case 'cancelled': return 'Cancelada';
      case 'no_show': return 'Não compareceu';
      default: return 'Agendada';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (time: string) => {
    return time;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar histórico</h2>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-16">
      {/* Header visual padrão */}
      <PageHeader
        title="Meu Histórico de Consultas"
        subtitle="Visualize e gerencie todas as suas consultas agendadas e realizadas"
        icon={HistoryIcon}
        className="mb-2 py-1 px-4 rounded-xl shadow bg-white border border-gray-100"
      />

      {/* Indicadores modernos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {/* Card Total de Consultas */}
        <div
          className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-blue-500`}
          style={{ borderLeftWidth: 6 }}
        >
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 mr-4`}>
            <Calendar className={`h-7 w-7 text-blue-500`} />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Total de Consultas</div>
            <div className="text-2xl font-bold text-gray-900">{statistics?.total || 0}</div>
          </div>
        </div>
        
        {/* Card Realizadas */}
        <div className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-green-500`} style={{ borderLeftWidth: 6 }}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-green-50 mr-4`}>
            <CheckCircle className={`h-7 w-7 text-green-500`} />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Realizadas</div>
            <div className="text-2xl font-bold text-gray-900">{statistics?.completed || 0}</div>
          </div>
        </div>
        
        {/* Card Taxa de Comparecimento */}
        <div className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-purple-500`} style={{ borderLeftWidth: 6 }}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-purple-50 mr-4`}>
            <TrendingUp className={`h-7 w-7 text-purple-500`} />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Taxa de Comparecimento</div>
            <div className="text-2xl font-bold text-gray-900">{statistics?.attendanceRate || 0}%</div>
          </div>
        </div>
        
        {/* Card Avaliação Média */}
        <div className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-yellow-400`} style={{ borderLeftWidth: 6 }}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-50 mr-4`}>
            <Star className={`h-7 w-7 text-yellow-500`} />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Avaliação Média</div>
            <div className="text-2xl font-bold text-gray-900">{statistics?.averageRating || 0}/5</div>
          </div>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-10 mb-6 gap-4 animate-fade-in">
        <div className="flex items-center w-full md:w-auto max-w-xl flex-1">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Buscar por médico, especialidade, unidade..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm bg-white shadow-sm placeholder-gray-400"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 bg-blue-50 border border-l-0 border-blue-200 rounded-r-xl hover:bg-blue-100 transition flex items-center shadow-sm"
          >
            <Filter className="h-4 w-4 text-blue-500" />
          </button>
        </div>
        
        {/* Filtros Rápidos */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFilters({...filters, period: 'all', specialty: '', status: '', type: '', unit: '', search: ''})}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filters.period === 'all' && !filters.specialty && !filters.status && !filters.type && !filters.unit
                ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>
            Todas
          </button>
          <button 
            onClick={() => setFilters({...filters, status: 'completed'})}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filters.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>
            Realizadas
          </button>
          <button 
            onClick={() => setFilters({...filters, status: 'cancelled'})}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filters.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>
            Canceladas
          </button>
          <button 
            onClick={() => setFilters({...filters, period: '1y'})}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filters.period === '1y' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>
            Este ano
          </button>
        </div>
      </div>

      {/* Filtros Avançados */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select
                value={filters.period}
                onChange={(e) => setFilters({...filters, period: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os períodos</option>
                <option value="1m">Último mês</option>
                <option value="3m">Últimos 3 meses</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="1y">Último ano</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade</label>
              <select
                value={filters.specialty}
                onChange={(e) => setFilters({...filters, specialty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as especialidades</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os status</option>
                <option value="completed">Realizada</option>
                <option value="cancelled">Cancelada</option>
                <option value="no_show">Não compareceu</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os tipos</option>
                <option value="online">Online</option>
                <option value="presential">Presencial</option>
              </select>
            </div>
          </div>
        </div>
      )}



             {/* Lista de Consultas - Tabela */}
       <div className="bg-white rounded-xl shadow overflow-hidden">
         <div className="p-6 border-b border-gray-200">
           <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold text-gray-900">
               Consultas ({filteredAppointments.length})
             </h3>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-600">Ordenar por:</span>
                 <select
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value as any)}
                   className="px-3 py-1 border border-gray-300 rounded text-sm"
                 >
                   <option value="date">Data</option>
                   <option value="doctor">Médico</option>
                   <option value="specialty">Especialidade</option>
                 </select>
                 <button
                   onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                   className="p-1 hover:bg-gray-100 rounded"
                 >
                   {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                 </button>
               </div>
             </div>
           </div>
         </div>

         {currentAppointments.length > 0 ? (
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     MÉDICO
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     ESPECIALIDADE
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     DATA/HORA
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     STATUS
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     AÇÕES
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {currentAppointments.map((appointment, index) => (
                   <tr key={appointment.id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                           appointment.is_online ? 'bg-green-100' : 'bg-blue-100'
                         }`}>
                           {appointment.is_online ? (
                             <Video className="w-4 h-4 text-green-600" />
                           ) : (
                             <Calendar className="w-4 h-4 text-blue-600" />
                           )}
                         </div>
                         <div>
                           <div className="text-sm font-medium text-gray-900">{appointment.doctor_name}</div>
                           <div className="text-sm text-gray-500">{appointment.health_unit}</div>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">{appointment.specialty}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                       <div className="text-sm text-gray-500">{formatTime(appointment.time)}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                         {getStatusText(appointment.status)}
                       </span>
                       {appointment.rating && (
                         <div className="flex items-center gap-1 mt-1">
                           <Star className="w-3 h-3 text-yellow-400 fill-current" />
                           <span className="text-xs text-gray-500">{appointment.rating}/5</span>
                         </div>
                       )}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex items-center gap-2">
                                                   <button
                            onClick={() => {
                              const foundAppointment = currentAppointments.find(a => a.id === appointment.id);
                              setSelectedAppointment(foundAppointment || null);
                              setExpandedAppointment(expandedAppointment === appointment.id ? null : appointment.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                         {appointment.status === 'completed' && appointment.documents && appointment.documents.length > 0 && (
                           <button
                             className="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                             title="Ver documentos"
                           >
                             <FileText className="w-4 h-4 text-green-600" />
                           </button>
                         )}
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ) : (
           <div className="p-12 text-center">
             <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma consulta encontrada</h3>
             <p className="text-gray-500 mb-4">Tente ajustar os filtros para encontrar suas consultas.</p>
             <button
               onClick={() => setFilters({period: 'all', specialty: '', status: '', type: '', unit: '', search: ''})}
               className="text-blue-600 hover:text-blue-700 font-medium"
             >
               Limpar filtros
             </button>
           </div>
         )}

                   {/* Modal de Detalhes */}
          <Modal
            isOpen={!!expandedAppointment}
            onClose={() => {
              setExpandedAppointment(null);
              setSelectedAppointment(null);
            }}
            title="Detalhes da Consulta"
            size="xl"
            appointment={selectedAppointment}
          />

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAppointments.length)} de {filteredAppointments.length} consultas
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
