import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';
import { Calendar as RBCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { rrulestr } from 'rrule';
import { ptBR } from 'date-fns/locale';
// Ícones e libs visuais
import { 
  Stethoscope, 
  Plus, 
  CalendarDays, 
  Table, 
  LayoutGrid, 
  Edit, 
  Trash2, 
  Clock,
  User,
  Building2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar as CalendarIcon,
  Repeat,
  FileText,
  MapPin
} from 'lucide-react';
import { PageHeader } from '../../ui';
import Modal from '../../common/Modal';
import ErrorModal from '../../common/ErrorModal';

// Estilos CSS personalizados para animações
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .animate-slide-in {
    animation: slideIn 0.4s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.3s ease-out forwards;
  }
  
  .view-transition {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .view-transition-enter {
    opacity: 0;
    transform: translateY(20px);
  }
  
  .view-transition-enter-active {
    opacity: 1;
    transform: translateY(0);
  }
  
  .view-transition-exit {
    opacity: 1;
    transform: translateY(0);
  }
  
  .view-transition-exit-active {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

// Localizer do React Big Calendar com date-fns
const locales = {
  'pt-BR': ptBR,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Helpers
// const msToDuration = (ms: number) => {
//   const totalSeconds = Math.max(0, Math.floor(ms / 1000));
//   const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
//   const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
//   const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
//   return `${hours}:${minutes}:${seconds}`;
// };

// Tipos TypeScript baseados no backend
interface Doctor {
  id: string;
  email: string;
  cpf: string;
  role: string;
  city_id: string;
  health_unit_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile: {
  id: string;
  name: string;
    birth_date: string;
    gender: string;
    profile_doctor: {
      id: string;
      crm_number: string;
      crm_uf: string;
  specialty: string;
    };
    profile_phones: Array<{
      id: string;
      phone: string;
      phone_type: string;
      is_primary: boolean;
    }>;
    profile_emails: Array<{
      id: string;
      email: string;
      email_type: string;
      is_primary: boolean;
    }>;
    profile_addresses: Array<{
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

interface HealthUnit {
  id: string;
  name: string;
  address: string;
  phone: string;
  city?: string;
  city_hall_id: string;
}

interface MedicalSchedule {
  id: string;
  doctor_id: string;
  health_unit_id: string;
  start_datetime: string;
  end_datetime: string;
  status: 'pending' | 'confirmed' | 'temporary';
  total_slots: number;
  available_slots: number;
  is_recurring: boolean;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_end_date?: string;
  recurrence_weekdays?: string;
  substitute_doctor_id?: string;
  notes?: string;
  // Novos campos de recorrência avançada (alinhados ao backend)
  rrule?: string | null;
  exdates?: string[] | null;
  timezone?: string | null;
  created_at: string;
  updated_at: string;
  doctor?: Doctor;
  health_unit?: HealthUnit;
  substitute_doctor?: Doctor;
}

interface CreateScheduleData {
  doctor_id: string;
  health_unit_id: string;
  start_datetime: string;
  end_datetime: string;
  status?: 'pending' | 'confirmed' | 'temporary';
  total_slots: number;
  available_slots: number;
  is_recurring: boolean;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_end_date?: string;
  recurrence_weekdays?: string;
  substitute_doctor_id?: string;
  notes?: string;
  // Novos campos opcionais
  rrule?: string;
  exdates?: string[];
  timezone?: string;
}

// Mocks iniciais (serão substituídos por dados da API)
const mockUBSs: HealthUnit[] = [
  { id: 'ubs1', name: 'UBS 1', address: 'Rua das Flores, 123', phone: '(11) 99999-0001', city_hall_id: 'city1' },
  { id: 'ubs2', name: 'UBS 2', address: 'Av. Brasil, 456', phone: '(11) 99999-0002', city_hall_id: 'city2' },
];

const mockDoctors: Doctor[] = [
  { 
    id: 'doc1', 
    email: 'dr.silva@example.com',
    cpf: '12345678901',
    role: 'DOCTOR',
    city_id: 'city1',
    health_unit_id: 'ubs1',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    profile: {
      id: 'profile1',
      name: 'Dr. Silva',
      birth_date: '1980-01-01',
      gender: 'M',
      profile_doctor: {
        id: 'doc_profile1',
        crm_number: '12345',
        crm_uf: 'SP',
        specialty: 'Clínico Geral'
      },
      profile_phones: [],
      profile_emails: [],
      profile_addresses: []
    }
  },
  { 
    id: 'doc2', 
    email: 'dra.maria@example.com',
    cpf: '98765432109',
    role: 'DOCTOR',
    city_id: 'city2',
    health_unit_id: 'ubs2',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    profile: {
      id: 'profile2',
      name: 'Dra. Maria',
      birth_date: '1985-01-01',
      gender: 'F',
      profile_doctor: {
        id: 'doc_profile2',
        crm_number: '67890',
        crm_uf: 'SP',
        specialty: 'Pediatria'
      },
      profile_phones: [],
      profile_emails: [],
      profile_addresses: []
    }
  },
];

const mockSchedules: MedicalSchedule[] = [
  {
    id: '1',
    doctor_id: 'doc1',
    health_unit_id: 'ubs1',
    start_datetime: '2024-01-15T08:00:00Z',
    end_datetime: '2024-01-15T12:00:00Z',
    status: 'confirmed',
    total_slots: 20,
    available_slots: 15,
    is_recurring: true,
    recurrence_type: 'weekly',
    recurrence_weekdays: '1,2,3,4,5',
    notes: 'Atendimento de segunda a sexta',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    doctor: mockDoctors[0],
    health_unit: mockUBSs[0]
  },
  {
    id: '2',
    doctor_id: 'doc2',
    health_unit_id: 'ubs2',
    start_datetime: '2024-01-16T14:00:00Z',
    end_datetime: '2024-01-16T18:00:00Z',
    status: 'pending',
    total_slots: 15,
    available_slots: 15,
    is_recurring: false,
    notes: 'Atendimento pontual',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    doctor: mockDoctors[1],
    health_unit: mockUBSs[1]
  }
];

const MedicalSchedules = () => {
  const { user } = useAuthStore();
  
  // Estado centralizado
  const [schedules, setSchedules] = useState<MedicalSchedule[]>(mockSchedules);
  const [healthUnits, setHealthUnits] = useState<HealthUnit[]>(mockUBSs);
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [selectedUBS, setSelectedUBS] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [view, setView] = useState<'calendar' | 'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MedicalSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  // Estado específico do calendário (carregado por intervalo)
  const [calendarSchedules, setCalendarSchedules] = useState<MedicalSchedule[]>([]);
  const [calendarRange, setCalendarRange] = useState<{ start: Date; end: Date } | null>(null);
  const [formData, setFormData] = useState<CreateScheduleData>({
    doctor_id: '',
    health_unit_id: '',
    start_datetime: '',
    end_datetime: '',
    status: 'pending',
    total_slots: 0,
    available_slots: 0,
    is_recurring: false,
    recurrence_type: 'none',
    recurrence_end_date: '',
    recurrence_weekdays: '',
    rrule: '',
    exdates: [],
    timezone: '',
    substitute_doctor_id: undefined,
    notes: ''
  });

  // Estado para modal de erro
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info' | 'success';
    details?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
    details: ''
  });

  // Filtrar dados baseado no role do usuário
  const isMaster = user?.role === 'MASTER';
  const userCityHallId = user?.city_id as string | undefined;
  const userHealthUnitId = user?.health_unit_id as string | undefined; // se ADMIN estiver vinculado a uma UBS específica

  // Filtrar UBSs baseado no role e vínculo do usuário
  const filteredHealthUnits = useMemo(() => {
    if (isMaster) return healthUnits;
    const byCity = healthUnits.filter(ubs => ubs.city_hall_id === userCityHallId);
    if (userHealthUnitId) return byCity.filter(ubs => ubs.id === userHealthUnitId);
    return byCity;
  }, [isMaster, healthUnits, userCityHallId, userHealthUnitId]);

  // Filtrar médicos baseado no role e UBS selecionada
  const filteredDoctors = useMemo(() => {
    console.log('🔍 [filteredDoctors] Filtrando médicos:', {
      isMaster,
      doctorsCount: doctors.length,
      userCityHallId,
      selectedUBS,
      userHealthUnitId
    });

    // ✅ DEBUG: Mostrar dados completos dos médicos
    console.log('🔍 [filteredDoctors] Dados completos dos médicos:', doctors.map(doc => ({
      id: doc.id,
      name: doc.profile?.name || 'Nome não informado',
      city_id: doc.city_id,
      specialty: doc.profile?.profile_doctor?.specialty || 'Especialidade não informada',
      // ✅ DEBUG: Mostrar TODOS os campos disponíveis
      allFields: Object.keys(doc),
      rawData: doc
    })));

    if (isMaster) {
      console.log('🔍 [filteredDoctors] MASTER: retornando todos os médicos');
      return doctors;
    }
    
    // Para ADMIN, sempre filtrar por prefeitura primeiro
    let filtered = doctors;
    if (userCityHallId) {
      console.log('🔍 [filteredDoctors] ADMIN: filtrando por prefeitura:', userCityHallId);
      
      // ✅ DEBUG: Mostrar comparação detalhada
      doctors.forEach(doc => {
        console.log('🔍 [filteredDoctors] Comparando médico:', {
          name: doc.profile?.name || 'Nome não informado',
          docCityId: doc.city_id,
          userCityId: userCityHallId,
          match: doc.city_id === userCityHallId
        });
      });
      
      filtered = doctors.filter(doc => doc.city_id === userCityHallId);
      console.log('🔍 [filteredDoctors] ADMIN: filtrado por prefeitura:', {
        total: doctors.length,
        filtrados: filtered.length,
        cityId: userCityHallId
      });
    } else {
      console.log('⚠️ [filteredDoctors] ADMIN sem city_id vinculado');
      return [];
    }
    
    // Se há UBS selecionada, tentar filtrar por UBS específica
    if (selectedUBS) {
      console.log('🔍 [filteredDoctors] Filtrando por UBS selecionada:', selectedUBS);
      
      // TODO: Implementar filtro por UBS quando o backend suportar
      // Por enquanto, retorna médicos da prefeitura (que podem estar em qualquer UBS)
      console.log('🔍 [filteredDoctors] Retornando médicos da prefeitura (filtro por UBS não implementado)');
    }
    
    console.log('🔍 [filteredDoctors] Resultado final:', {
      total: doctors.length,
      filtrados: filtered.length,
      selectedUBS
    });
    
    return filtered;
  }, [isMaster, doctors, userCityHallId, selectedUBS, userHealthUnitId]);

  // Filtrar escalas baseado no role
  const userFilteredSchedules = isMaster 
    ? schedules 
    : schedules.filter(schedule => {
        const scheduleUBS = healthUnits.find(ubs => ubs.id === schedule.health_unit_id);
        return scheduleUBS?.city_hall_id === userCityHallId;
      });

  // Carregar dados da API
  useEffect(() => {
    console.log('🔄 [useEffect] Verificando condições para carregar dados:', {
      isMaster,
      selectedUBS,
      userHealthUnitId,
      userCityHallId
    });

    // Para MASTER, sempre carregar dados
    if (isMaster) {
      console.log('🔄 [useEffect] MASTER: carregando todos os dados');
    loadData();
      return;
    }

    // Para ADMIN, verificar se tem prefeitura vinculada
    if (!userCityHallId) {
      console.log('⚠️ [useEffect] ADMIN sem prefeitura vinculada - não pode acessar escalas médicas');
      return;
    }

    // Para ADMIN com prefeitura vinculada, sempre carregar médicos e UBSs
    console.log('🔄 [useEffect] ADMIN com prefeitura vinculada: carregando dados básicos');
    loadData();

    // Se tem UBS selecionada ou vinculada, carregar escalas também
    if (selectedUBS || userHealthUnitId) {
      console.log('🔄 [useEffect] ADMIN com UBS: carregando escalas médicas');
      // As escalas já são carregadas pela função loadData
    } else {
      console.log('⏸️ [useEffect] ADMIN aguardando seleção de UBS para carregar escalas');
    }
  }, [isMaster, selectedUBS, userHealthUnitId, userCityHallId]);

  // ✅ DEBUG: Monitorar mudanças nos médicos e filteredDoctors
  useEffect(() => {
    console.log('🔍 [DEBUG] Estado dos médicos mudou:', {
      doctorsCount: doctors.length,
      filteredDoctorsCount: filteredDoctors.length,
      selectedUBS,
      userCityHallId,
      isMaster,
      userHealthUnitId
    });
  }, [doctors, filteredDoctors, selectedUBS, userCityHallId, isMaster, userHealthUnitId]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📡 Fazendo requisições para a API...');
      
      // Carregar escalas médicas
      const schedulesResponse = await axios.get('/medical-schedules');
      console.log('✅ Escalas carregadas:', schedulesResponse.data);
      setSchedules(schedulesResponse.data);

      // Carregar UBSs (backend aplica escopo por prefeitura/UBS do usuário)
      try {
        const ubsResponse = await axios.get('/healthunit');
        console.log('✅ UBSs carregadas:', ubsResponse.data);
        setHealthUnits(Array.isArray(ubsResponse.data) ? ubsResponse.data : []);
      } catch (e) {
        console.warn('❌ Falha ao carregar UBSs da API. Erro:', e);
        setHealthUnits([]);
      }

      // Carregar médicos da API
      try {
        const doctorsResponse = await axios.get('/doctors');
        console.log('✅ Médicos carregados:', doctorsResponse.data);
        setDoctors(Array.isArray(doctorsResponse.data) ? doctorsResponse.data : []);
      } catch (e) {
        console.warn('❌ Falha ao carregar médicos da API. Erro:', e);
        setDoctors([]);
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      
      // Tratamento específico para erros de permissão
      if (error?.response?.status === 403) {
        const errorMessage = error?.response?.data?.message || 'Acesso negado';
        if (errorMessage.includes('sem prefeitura vinculada')) {
          console.warn('⚠️ ADMIN sem prefeitura vinculada - não pode acessar escalas médicas');
        } else {
          console.error('🚫 Erro de permissão:', errorMessage);
        }
      } else if (error?.response?.status === 500) {
        console.error('💥 Erro interno do servidor:', error?.response?.data);
      }
      
      // Usar dados mock em caso de erro
    } finally {
      setLoading(false);
      console.log('🏁 Carregamento concluído. Estado atual:', {
        schedules: schedules.length,
        healthUnits: healthUnits.length,
        doctors: doctors.length,
        selectedUBS,
        view
      });
    }
  };



  // Carrega escalas apenas para o calendário conforme intervalo + filtros
  const fetchCalendarByRange = async (start: Date, end: Date) => {
    // Para ADMIN, só carregar se tiver UBS selecionada
    if (!isMaster && !selectedUBS && !userHealthUnitId) {
      console.warn('ADMIN deve selecionar uma UBS para carregar escalas');
      setCalendarSchedules([]);
      return;
    }
    
    let params: any = {};
    try {
      params = {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      };
      if (selectedUBS) params.health_unit_id = selectedUBS;
      if (selectedDoctor) params.doctor_id = selectedDoctor;
      if (selectedStatus) params.status = selectedStatus;
      // Backend não possui rota "/medical-schedules/date-range"; a busca por intervalo é feita em GET "/medical-schedules" com query params start_date e end_date
      const res = await axios.get('/medical-schedules', { params });
      setCalendarSchedules(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Erro ao carregar escalas (calendário) por intervalo:', {
        params,
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message
      });
      
      // Tratamento específico para erros de permissão
      if (err?.response?.status === 403) {
        const errorMessage = err?.response?.data?.message || 'Acesso negado';
        if (errorMessage.includes('sem prefeitura vinculada')) {
          console.warn('ADMIN sem prefeitura vinculada - não pode acessar escalas médicas');
        }
      }
      
      setCalendarSchedules([]);
    }
  };

  // Garantir que a UBS selecionada seja coerente com os filtros e vínculos do usuário
  useEffect(() => {
    if (!filteredHealthUnits || filteredHealthUnits.length === 0) {
      setSelectedUBS('');
      return;
    }
    // Se o usuário está vinculado a uma UBS específica, forçar seleção
    if (userHealthUnitId) {
      if (selectedUBS !== userHealthUnitId) setSelectedUBS(userHealthUnitId);
      return;
    }
    // Caso a UBS selecionada atual não exista mais no filtro, selecionar a primeira disponível
    const exists = filteredHealthUnits.some(u => u.id === selectedUBS);
    if (!exists) setSelectedUBS(filteredHealthUnits[0].id);
  }, [filteredHealthUnits, userHealthUnitId]);

  // Funções de CRUD
  const handleCreate = async (data: CreateScheduleData) => {
    try {
      const response = await axios.post('/medical-schedules', data);
      setSchedules(prev => [...prev, response.data]);
      setIsModalOpen(false);
      resetForm();
      
      // Mostrar modal de sucesso
      setErrorModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Escala médica criada com sucesso!',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Erro ao criar escala:', error);
      
      // Determinar tipo e mensagem do erro
      let errorType: 'error' | 'warning' = 'error';
      let errorTitle = 'Erro ao criar escala';
      let errorMessage = 'Ocorreu um erro ao criar a escala médica.';
      let errorDetails = '';
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            errorTitle = 'Dados inválidos';
            errorMessage = 'Os dados fornecidos são inválidos ou incompletos.';
            errorDetails = data?.message || 'Verifique todos os campos obrigatórios.';
            break;
          case 401:
            errorTitle = 'Não autorizado';
            errorMessage = 'Você não está autorizado a realizar esta ação.';
            errorDetails = 'Faça login novamente ou verifique suas permissões.';
            break;
          case 403:
            errorTitle = 'Acesso negado';
            errorMessage = 'Você não tem permissão para criar escalas médicas.';
            errorDetails = 'Entre em contato com o administrador do sistema.';
            break;
          case 404:
            errorTitle = 'Recurso não encontrado';
            errorMessage = 'O médico ou unidade de saúde não foi encontrada.';
            errorDetails = 'Verifique se os dados estão corretos.';
            break;
          case 409:
            errorTitle = 'Conflito de horário';
            errorMessage = 'Já existe uma escala para este médico no horário especificado.';
            errorDetails = 'Escolha outro horário ou médico.';
            break;
          case 500:
            errorTitle = 'Erro do servidor';
            errorMessage = 'Ocorreu um erro interno no servidor.';
            errorDetails = 'Tente novamente mais tarde ou entre em contato com o suporte.';
            break;
          default:
            errorTitle = 'Erro inesperado';
            errorMessage = 'Ocorreu um erro inesperado ao criar a escala.';
            errorDetails = `Status: ${status}, Mensagem: ${data?.message || 'Erro desconhecido'}`;
        }
      } else if (error.request) {
        errorTitle = 'Erro de conexão';
        errorMessage = 'Não foi possível conectar ao servidor.';
        errorDetails = 'Verifique sua conexão com a internet ou tente novamente mais tarde.';
      } else {
        errorTitle = 'Erro inesperado';
        errorMessage = 'Ocorreu um erro inesperado.';
        errorDetails = error.message || 'Erro desconhecido';
      }
      
      // Mostrar modal de erro
      setErrorModal({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
        type: errorType,
        details: errorDetails
      });
    }
  };

  const handleEdit = async (id: string, data: Partial<CreateScheduleData>) => {
    try {
      const response = await axios.put(`/medical-schedules/${id}`, data);
      setSchedules(prev => prev.map(schedule => 
        schedule.id === id ? response.data : schedule
      ));
      setIsModalOpen(false);
      resetForm();
      
      // Mostrar modal de sucesso
      setErrorModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Escala médica atualizada com sucesso!',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Erro ao editar escala:', error);
      
      // Determinar tipo e mensagem do erro
      let errorType: 'error' | 'warning' = 'error';
      let errorTitle = 'Erro ao editar escala';
      let errorMessage = 'Ocorreu um erro ao editar a escala médica.';
      let errorDetails = '';
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            errorTitle = 'Dados inválidos';
            errorMessage = 'Os dados fornecidos são inválidos ou incompletos.';
            errorDetails = data?.message || 'Verifique todos os campos obrigatórios.';
            break;
          case 401:
            errorTitle = 'Não autorizado';
            errorMessage = 'Você não está autorizado a realizar esta ação.';
            errorDetails = 'Faça login novamente ou verifique suas permissões.';
            break;
          case 403:
            errorTitle = 'Acesso negado';
            errorMessage = 'Você não tem permissão para editar escalas médicas.';
            errorDetails = 'Entre em contato com o administrador do sistema.';
            break;
          case 404:
            errorTitle = 'Escala não encontrada';
            errorMessage = 'A escala médica não foi encontrada.';
            errorDetails = 'Verifique se a escala ainda existe.';
            break;
          case 500:
            errorTitle = 'Erro do servidor';
            errorMessage = 'Ocorreu um erro interno no servidor.';
            errorDetails = 'Tente novamente mais tarde ou entre em contato com o suporte.';
            break;
          default:
            errorTitle = 'Erro inesperado';
            errorMessage = 'Ocorreu um erro inesperado ao editar a escala.';
            errorDetails = `Status: ${status}, Mensagem: ${data?.message || 'Erro desconhecido'}`;
        }
      } else if (error.request) {
        errorTitle = 'Erro de conexão';
        errorMessage = 'Não foi possível conectar ao servidor.';
        errorDetails = 'Verifique sua conexão com a internet ou tente novamente mais tarde.';
      } else {
        errorTitle = 'Erro inesperado';
        errorMessage = 'Ocorreu um erro inesperado.';
        errorDetails = error.message || 'Erro desconhecido';
      }
      
      // Mostrar modal de erro
      setErrorModal({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
        type: errorType,
        details: errorDetails
      });
    }
  };

  const handleDelete = async (id: string) => {
    const scheduleToDelete = schedules.find(s => s.id === id);
    const doctorName = scheduleToDelete?.doctor?.profile?.name || 'esta escala';
    const ubsName = scheduleToDelete?.health_unit?.name || 'UBS';
    
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a escala?\n\n` +
      `Médico: ${doctorName}\n` +
      `UBS: ${ubsName}\n\n` +
      `Esta ação não pode ser desfeita.`
    );
    
    if (!confirmed) return;
    
    try {
      setLoading(true);
      await axios.delete(`/medical-schedules/${id}`);
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      
      // Feedback visual de sucesso
      const successMessage = `Escala de ${doctorName} excluída com sucesso!`;
      console.log(successMessage);
      
      // Aqui você pode adicionar um toast ou notificação
      // toast.success(successMessage);
      
    } catch (error: any) {
      console.error('Erro ao excluir escala:', error);
      
      // Determinar tipo e mensagem do erro
      let errorType: 'error' | 'warning' = 'error';
      let errorTitle = 'Erro ao excluir escala';
      let errorMessage = 'Ocorreu um erro ao excluir a escala médica.';
      let errorDetails = '';
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            errorTitle = 'Não autorizado';
            errorMessage = 'Você não está autorizado a realizar esta ação.';
            errorDetails = 'Faça login novamente ou verifique suas permissões.';
            break;
          case 403:
            errorTitle = 'Acesso negado';
            errorMessage = 'Você não tem permissão para excluir escalas médicas.';
            errorDetails = 'Entre em contato com o administrador do sistema.';
            break;
          case 404:
            errorTitle = 'Escala não encontrada';
            errorMessage = 'A escala médica não foi encontrada.';
            errorDetails = 'Verifique se a escala ainda existe.';
            break;
          case 500:
            errorTitle = 'Erro do servidor';
            errorMessage = 'Ocorreu um erro interno no servidor.';
            errorDetails = 'Tente novamente mais tarde ou entre em contato com o suporte.';
            break;
          default:
            errorTitle = 'Erro inesperado';
            errorMessage = 'Ocorreu um erro inesperado ao excluir a escala.';
            errorDetails = `Status: ${status}, Mensagem: ${data?.message || 'Erro desconhecido'}`;
        }
      } else if (error.request) {
        errorTitle = 'Erro de conexão';
        errorMessage = 'Não foi possível conectar ao servidor.';
        errorDetails = 'Verifique sua conexão com a internet ou tente novamente mais tarde.';
      } else {
        errorTitle = 'Erro inesperado';
        errorMessage = 'Ocorreu um erro inesperado.';
        errorDetails = error.message || 'Erro desconhecido';
      }
      
      // Mostrar modal de erro
      setErrorModal({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
        type: errorType,
        details: errorDetails
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções de filtro
  const filteredSchedules = userFilteredSchedules.filter(schedule => {
    if (selectedUBS && schedule.health_unit_id !== selectedUBS) return false;
    if (selectedDoctor && schedule.doctor_id !== selectedDoctor) return false;
    if (selectedStatus && schedule.status !== selectedStatus) return false;
    return true;
  });

  // Funções de formulário
  const resetForm = () => {
    setFormData({
      doctor_id: '',
      health_unit_id: '',
      start_datetime: '',
      end_datetime: '',
      status: 'pending',
      total_slots: 0,
      available_slots: 0,
      is_recurring: false,
      recurrence_type: 'none',
      recurrence_end_date: '',
      recurrence_weekdays: '',
      rrule: '',
      exdates: [],
      timezone: '',
      substitute_doctor_id: undefined,
      notes: ''
    });
    setEditingSchedule(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações específicas para ADMIN
    if (!isMaster) {
      // ADMIN deve ter UBS selecionada
      if (!formData.health_unit_id) {
        alert('ADMIN deve selecionar uma UBS para criar escalas');
        return;
      }
      
      // Verificar se a UBS selecionada pertence à prefeitura do ADMIN
      const selectedUBSData = filteredHealthUnits.find(ubs => ubs.id === formData.health_unit_id);
      if (selectedUBSData && userCityHallId && selectedUBSData.city_hall_id !== userCityHallId) {
        alert('ADMIN só pode criar escalas para UBSs da sua prefeitura');
        return;
      }
      
      // Se ADMIN tem UBS vinculada, verificar se está tentando criar para outra UBS
      if (userHealthUnitId && formData.health_unit_id !== userHealthUnitId) {
        alert('ADMIN vinculado a uma UBS específica só pode criar escalas para essa UBS');
        return;
      }
    }
    
    // Validações gerais
    if (!formData.doctor_id) {
      alert('Selecione um médico');
      return;
    }
    
    if (!formData.health_unit_id) {
      alert('Selecione uma UBS');
      return;
    }
    
    if (!formData.start_datetime || !formData.end_datetime) {
      alert('Preencha data e hora de início e fim');
      return;
    }
    
    const startDate = new Date(formData.start_datetime);
    const endDate = new Date(formData.end_datetime);
    
    if (startDate >= endDate) {
      alert('A data/hora de fim deve ser posterior à data/hora de início');
      return;
    }
    
    if (startDate < new Date()) {
      alert('Não é possível criar escalas no passado');
      return;
    }
    
    if (formData.total_slots <= 0) {
      alert('O total de vagas deve ser maior que zero');
      return;
    }
    
    if (formData.available_slots > formData.total_slots) {
      alert('As vagas disponíveis não podem ser maiores que o total de vagas');
      return;
    }
    
    // Limpar campos de recorrência se não for recorrente
    const cleanFormData = { ...formData };
    if (!cleanFormData.is_recurring) {
      cleanFormData.recurrence_type = 'none';
      cleanFormData.recurrence_end_date = undefined;
      cleanFormData.recurrence_weekdays = undefined;
      cleanFormData.rrule = undefined;
      cleanFormData.exdates = undefined;
      cleanFormData.timezone = undefined;
    }
    
    if (editingSchedule) {
      handleEdit(editingSchedule.id, cleanFormData);
    } else {
      handleCreate(cleanFormData);
    }
  };

  const openEditModal = (schedule: MedicalSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      doctor_id: schedule.doctor_id,
      health_unit_id: schedule.health_unit_id,
      start_datetime: schedule.start_datetime.slice(0, 16), // Remove segundos para input datetime-local
      end_datetime: schedule.end_datetime.slice(0, 16),
      status: schedule.status,
      total_slots: schedule.total_slots,
      available_slots: schedule.available_slots,
      is_recurring: schedule.is_recurring,
      recurrence_type: schedule.recurrence_type || 'none',
      recurrence_end_date: schedule.recurrence_end_date?.slice(0, 16),
      recurrence_weekdays: schedule.recurrence_weekdays,
      rrule: schedule.rrule || '',
      exdates: schedule.exdates || [],
      timezone: schedule.timezone || '',
      substitute_doctor_id: schedule.substitute_doctor_id,
      notes: schedule.notes || ''
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    
    // Para ADMIN, forçar seleção de UBS se não houver uma selecionada
    let ubsId = selectedUBS;
    if (!ubsId && !isMaster && filteredHealthUnits.length > 0) {
      ubsId = filteredHealthUnits[0]?.id;
      setSelectedUBS(ubsId);
    }
    
    setFormData(prev => ({
      ...prev,
      health_unit_id: ubsId || ''
    }));
    setIsModalOpen(true);
  };

  // Filtragem para o calendário (baseada em calendarSchedules)
  const filteredCalendarSchedules = useMemo(() => {
    let base = calendarSchedules;
    if (!isMaster) {
      base = base.filter(schedule => {
        const scheduleUBS = healthUnits.find(ubs => ubs.id === schedule.health_unit_id);
        if (!scheduleUBS) return false;
        if (scheduleUBS.city_hall_id !== userCityHallId) return false;
        if (userHealthUnitId && schedule.health_unit_id !== userHealthUnitId) return false;
        return true;
      });
    }
    return base.filter(schedule => {
      if (selectedUBS && schedule.health_unit_id !== selectedUBS) return false;
      if (selectedDoctor && schedule.doctor_id !== selectedDoctor) return false;
      if (selectedStatus && schedule.status !== selectedStatus) return false;
      return true;
    });
  }, [calendarSchedules, isMaster, healthUnits, userCityHallId, userHealthUnitId, selectedUBS, selectedDoctor, selectedStatus]);

  const calendarEventsRBC = useMemo(() => {
    const events: any[] = [];
    for (const schedule of filteredCalendarSchedules) {
              const title = `${schedule.doctor?.profile?.name || 'Médico não encontrado'} - ${schedule.health_unit?.name || 'UBS não encontrada'}`;
      const startBase = new Date(schedule.start_datetime);
      const endBase = new Date(schedule.end_datetime);
      const durationMs = Math.max(0, endBase.getTime() - startBase.getTime());

      if (schedule.rrule && calendarRange) {
        try {
          const rule = rrulestr(schedule.rrule);
          const between = (rule as any).between(calendarRange.start, calendarRange.end, true) as Date[];
          const exdates: string[] = Array.isArray((schedule as any).exdates) ? (schedule as any).exdates : [];
          for (const dt of between) {
            // ignorar datas de exceção (comparação por ISO sem ms)
            const iso = new Date(dt).toISOString().slice(0, 16);
            const isExcluded = exdates.some((ex) => ex.slice(0, 16) === iso);
            if (isExcluded) continue;
            events.push({
              id: `${schedule.id}-${dt.getTime()}`,
              title,
              start: dt,
              end: new Date(dt.getTime() + durationMs),
              resource: schedule,
            });
          }
          continue;
        } catch (e) {
          console.warn('Falha ao processar RRULE no frontend, exibindo apenas instância base:', e);
        }
      }

      // Evento simples (não recorrente ou fallback)
      events.push({
        id: schedule.id,
        title,
        start: startBase,
        end: endBase,
        resource: schedule,
      });
    }
    return events;
  }, [filteredCalendarSchedules, calendarRange]);

  // Clique em evento no calendário
  const handleEventClick = (event: any) => {
    const schedule: MedicalSchedule | undefined = event?.resource;
    if (schedule) openEditModal(schedule);
  };

  // Seleção de slot no calendário
  const handleSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    resetForm();
    
    // Para ADMIN, forçar seleção de UBS se não houver uma selecionada
    let ubsId = selectedUBS;
    if (!ubsId && !isMaster && filteredHealthUnits.length > 0) {
      ubsId = filteredHealthUnits[0]?.id;
      setSelectedUBS(ubsId);
    }
    
    setFormData(prev => ({
      ...prev,
      start_datetime: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
      end_datetime: format(slotInfo.end, "yyyy-MM-dd'T'HH:mm"),
      health_unit_id: ubsId || ''
    }));
    setIsModalOpen(true);
  };

  // Alteração de intervalo do calendário
  const handleRangeChange = (range: any) => {
    let start: Date;
    let end: Date;
    if (Array.isArray(range)) {
      start = range[0];
      end = range[range.length - 1];
    } else {
      start = range.start;
      end = range.end;
    }
    setCalendarRange({ start, end });
    fetchCalendarByRange(start, end);
  };

  // Inicializa o intervalo padrão da semana atual e recarrega quando filtros mudam
  useEffect(() => {
    if (!calendarRange) {
      const now = new Date();
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setCalendarRange({ start, end });
      fetchCalendarByRange(start, end);
    } else {
      // Recarregar ao mudar filtros mantendo o intervalo atual
      fetchCalendarByRange(calendarRange.start, calendarRange.end);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUBS, selectedDoctor, selectedStatus, isMaster, userCityHallId, userHealthUnitId]);

  // Funções de formatação
  // const formatDateTime = (dateTime: string) => {
  //   return new Date(dateTime).toLocaleString('pt-BR', {
  //     day: '2-digit',
  //     month: '2-digit',
  //     year: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   });
  // };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'temporary': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'temporary': return <Clock className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  // Renderização condicional de visualizações com transições suaves
  const renderTableView = () => (
    <div className="bg-white rounded-xl shadow overflow-hidden transform transition-all duration-300 ease-in-out">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Médico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UBS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vagas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recorrência
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSchedules.map((schedule, index) => (
              <tr key={schedule.id} className="hover:bg-gray-50 transform transition-all duration-200 hover:scale-[1.01]" style={{ animationDelay: `${index * 50}ms` }}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {schedule.doctor?.profile?.name || 'Médico não encontrado'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {schedule.doctor?.profile?.profile_doctor?.specialty}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {schedule.health_unit?.name || 'UBS não encontrada'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(schedule.start_datetime)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(schedule.start_datetime)} - {formatTime(schedule.end_datetime)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {schedule.available_slots}/{schedule.total_slots}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round((schedule.available_slots / schedule.total_slots) * 100)}% disponível
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                    {getStatusIcon(schedule.status)}
                    <span className="ml-1">
                      {schedule.status === 'confirmed' ? 'Confirmado' :
                       schedule.status === 'pending' ? 'Pendente' :
                       schedule.status === 'temporary' ? 'Temporário' : schedule.status}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {schedule.is_recurring ? (
                    <div className="flex items-center">
                      <Repeat className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-gray-900">
                        {schedule.recurrence_type === 'daily' ? 'Diário' :
                         schedule.recurrence_type === 'weekly' ? 'Semanal' :
                         schedule.recurrence_type === 'monthly' ? 'Mensal' : 'Recorrente'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Pontual</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transform transition-all duration-200 hover:scale-110"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transform transition-all duration-200 hover:scale-110"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSchedules.map((schedule, index) => (
        <div 
          key={schedule.id} 
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:-translate-y-1"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {schedule.doctor?.profile?.name || 'Médico não encontrado'}
                  </h3>
                  <p className="text-sm text-gray-500">{schedule.doctor?.profile?.profile_doctor?.specialty}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                {getStatusIcon(schedule.status)}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="h-4 w-4 mr-2" />
                {schedule.health_unit?.name || 'UBS não encontrada'}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {formatDate(schedule.start_datetime)}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(schedule.start_datetime)} - {formatTime(schedule.end_datetime)}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Vagas: {schedule.available_slots}/{schedule.total_slots}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {Math.round((schedule.available_slots / schedule.total_slots) * 100)}%
                </div>
              </div>
              
              {schedule.is_recurring && (
                <div className="flex items-center text-sm text-blue-600">
                  <Repeat className="h-4 w-4 mr-2" />
                  {schedule.recurrence_type === 'daily' ? 'Diário' :
                   schedule.recurrence_type === 'weekly' ? 'Semanal' :
                   schedule.recurrence_type === 'monthly' ? 'Mensal' : 'Recorrente'}
                </div>
              )}
              
              {schedule.notes && (
                <div className="flex items-start text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-2 mt-0.5" />
                  <span className="line-clamp-2">{schedule.notes}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => openEditModal(schedule)}
                className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transform transition-all duration-200 hover:scale-110"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(schedule.id)}
                className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transform transition-all duration-200 hover:scale-110"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCalendarView = () => (
    <div className="bg-white rounded-xl shadow p-6 min-h-[600px] transform transition-all duration-500 ease-in-out">
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-blue-800">
          <CalendarDays className="h-5 w-5" />
          <span className="font-medium">Dica: Clique em um horário vazio para criar uma nova escala, ou clique em um evento para editá-lo</span>
        </div>
      </div>
      
      {/* Calendário SEMPRE visível - não depende de ter escalas */}
      <RBCalendar
        localizer={localizer}
        culture="pt-BR"
        events={calendarEventsRBC}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        style={{ height: 600 }}
        selectable
        onSelectSlot={({ start, end }) => handleSlotSelect({ start, end })}
        onSelectEvent={handleEventClick}
        onRangeChange={handleRangeChange}
        messages={{
          date: 'Data',
          time: 'Hora',
          event: 'Evento',
          allDay: 'Dia inteiro',
          week: 'Semana',
          work_week: 'Semana útil',
          day: 'Dia',
          month: 'Mês',
          previous: 'Anterior',
          next: 'Próximo',
          yesterday: 'Ontem',
          tomorrow: 'Amanhã',
          today: 'Hoje',
          agenda: 'Agenda',
          noEventsInRange: 'Não há eventos neste período.',
        }}
        popup
        longPressThreshold={250}
        timeslots={2}
        step={30}
        min={new Date(1970, 0, 1, 6, 0, 0)}
        max={new Date(1970, 0, 1, 20, 0, 0)}
        eventPropGetter={(event: any) => {
          const status = event?.resource?.status as string | undefined;
          let backgroundColor = '#93c5fd'; // azul claro default
          if (status === 'confirmed') backgroundColor = '#86efac'; // verde
          else if (status === 'pending') backgroundColor = '#fde68a'; // amarelo
          else if (status === 'temporary') backgroundColor = '#bfdbfe'; // azul
          return { 
            style: { 
              backgroundColor, 
              border: 'none', 
              color: '#1f2937',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            } 
          };
        }}
        slotPropGetter={(_date: Date) => ({
          style: {
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out'
          }
        })}
        dayPropGetter={(_date: Date) => ({
          style: {
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0'
          }
        })}
      />
      
      {/* Mensagem adicional quando não há escalas (mas calendário continua visível) */}
      {filteredSchedules.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Calendário vazio</p>
              <p className="text-sm text-yellow-700">
                Não há escalas cadastradas ainda. Use o calendário acima para criar sua primeira escala!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderView = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow p-6 min-h-[400px] flex items-center justify-center transform transition-all duration-500 ease-in-out">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando escalas...</p>
          </div>
        </div>
      );
    }

    // Renderização com transições suaves - SEMPRE mostra a view selecionada
      return (
      <div className="transform transition-all duration-500 ease-in-out">
        {view === 'calendar' && (
          <div className="animate-fade-in">
            {renderCalendarView()}
          </div>
        )}
        {view === 'table' && (
          <div className="animate-fade-in">
            {filteredSchedules.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
                  <Table className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-600">Nenhuma escala encontrada</p>
            <p className="text-sm text-gray-500">Tente ajustar os filtros ou criar uma nova escala</p>
          </div>
              </div>
            ) : (
              renderTableView()
            )}
          </div>
        )}
        {view === 'grid' && (
          <div className="animate-fade-in">
            {filteredSchedules.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-6 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-600">Nenhuma escala encontrada</p>
                  <p className="text-sm text-gray-500">Tente ajustar os filtros ou criar uma nova escala</p>
                </div>
              </div>
            ) : (
              renderGridView()
            )}
          </div>
        )}
        </div>
      );
  };

  return (
    <>
      {/* Estilos CSS personalizados */}
      <style>{customStyles}</style>
      
    <div className="flex flex-col h-full w-full min-h-0 min-w-0 relative">
      {/* Header visual padrão */}
      <PageHeader
        title="Escalas Médicas"
        subtitle="Gestão completa das escalas dos médicos das UBSs"
        icon={Stethoscope}
          className="mb-2 py-1 px-4 rounded-xl shadow bg-white border border-gray-100 animate-slide-in"
      />
      
      {/* Header contextual da UBS selecionada */}
      {selectedUBS && (
      <div className="flex items-center gap-4 bg-white rounded-xl shadow border border-gray-100 px-6 py-4 mb-4 animate-fade-in">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-50">
          <Stethoscope className="w-8 h-8 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-blue-900 truncate">
              {filteredHealthUnits.find(u => u.id === selectedUBS)?.name}
            </div>
            <div className="text-gray-500 text-sm truncate">
              {filteredHealthUnits.find(u => u.id === selectedUBS)?.address}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {filteredHealthUnits.find(u => u.id === selectedUBS)?.phone}
            </div>
          </div>
        </div>
      )}
      
      {/* Indicador de prefeitura para ADMIN */}
      {!isMaster && userCityHallId && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Visualizando dados da sua prefeitura
          </span>
      </div>
      )}
      
      {/* Indicador de dados carregados */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>📊 <strong>Escalas:</strong> {schedules.length}</span>
          <span>🏥 <strong>UBSs:</strong> {healthUnits.length}</span>
          <span>👨‍⚕️ <strong>Médicos:</strong> {doctors.length}</span>
          <span>🎯 <strong>UBS Selecionada:</strong> {selectedUBS ? 'Sim' : 'Não'}</span>
        </div>
      </div>
      
      {/* Aviso para ADMIN sem prefeitura vinculada */}
      {!isMaster && !userCityHallId && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-800">
            ⚠️ ADMIN sem prefeitura vinculada - Entre em contato com o suporte para configurar sua prefeitura
          </span>
        </div>
      )}
      
      {/* Filtros avançados */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-gray-700 font-medium">UBS:</label>
          <select 
            value={selectedUBS} 
            onChange={e => setSelectedUBS(e.target.value)} 
            disabled={!!userHealthUnitId}
            title={userHealthUnitId ? 'UBS vinculada ao seu usuário' : 'Selecione uma UBS'}
            className={`border border-gray-300 rounded-lg px-4 py-2 text-base focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm ${userHealthUnitId ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <option value="">Selecione uma UBS</option>
            {filteredHealthUnits.map(ubs => (
              <option key={ubs.id} value={ubs.id}>{ubs.name}</option>
            ))}
          </select>
          
          <label className="text-gray-700 font-medium ml-4">Médico:</label>
          <select 
            value={selectedDoctor} 
            onChange={e => setSelectedDoctor(e.target.value)} 
            className="border border-gray-300 rounded-lg px-4 py-2 text-base focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm min-w-[160px]"
          >
            <option value="">Todos os médicos</option>
            {filteredDoctors.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.profile?.name || 'Nome não informado'} - {doc.profile?.profile_doctor?.specialty || 'Especialidade não informada'}
              </option>
            ))}
          </select>
          
          <label className="text-gray-700 font-medium ml-4">Status:</label>
          <select 
            value={selectedStatus} 
            onChange={e => setSelectedStatus(e.target.value)} 
            className="border border-gray-300 rounded-lg px-4 py-2 text-base focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm min-w-[120px]"
          >
            <option value="">Todos</option>
            <option value="confirmed">Confirmado</option>
            <option value="pending">Pendente</option>
            <option value="temporary">Temporário</option>
          </select>
        </div>
        
        {/* Switch de visualização com feedback visual melhorado */}
        <div className="flex gap-2 mt-2 md:mt-0">
          <button 
            onClick={() => setView('calendar')} 
            className={`p-3 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
              view === 'calendar' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`} 
            title="Calendário"
            aria-label="Visualização em calendário"
            aria-pressed={view === 'calendar'}
            role="button"
          >
            <CalendarDays className="h-6 w-6" />
            <span className="ml-2 text-sm font-medium hidden sm:inline">Calendário</span>
          </button>
          <button 
            onClick={() => setView('table')} 
            className={`p-3 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
              view === 'table' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`} 
            title="Tabela"
            aria-label="Visualização em tabela"
            aria-pressed={view === 'table'}
            role="button"
          >
            <Table className="h-6 w-6" />
            <span className="ml-2 text-sm font-medium hidden sm:inline">Tabela</span>
          </button>
          <button 
            onClick={() => setView('grid')} 
            className={`p-3 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
              view === 'grid' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`} 
            title="Grid"
            aria-label="Visualização em grade"
            aria-pressed={view === 'grid'}
            role="button"
          >
            <LayoutGrid className="h-6 w-6" />
            <span className="ml-2 text-sm font-medium hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>
      
      {/* Mensagem de orientação para ADMIN sem UBS selecionada */}
      {!isMaster && !selectedUBS && filteredHealthUnits.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-blue-800">Selecione uma UBS</h3>
          </div>
          <p className="text-blue-700 mb-4">
            Para gerenciar escalas médicas, você deve primeiro selecionar uma Unidade de Saúde (UBS) da sua prefeitura.
          </p>
          <div className="flex justify-center">
            <select 
              value={selectedUBS} 
              onChange={e => setSelectedUBS(e.target.value)} 
              className="border border-blue-300 rounded-lg px-4 py-2 text-base focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm min-w-[300px]"
            >
              <option value="">Selecione uma UBS para continuar</option>
              {filteredHealthUnits.map(ubs => (
                <option key={ubs.id} value={ubs.id}>{ubs.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      {/* Renderização condicional da visualização com indicador de view ativa */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          <span className="font-medium">Visualização atual:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            view === 'calendar' ? 'bg-blue-100 text-blue-700' :
            view === 'table' ? 'bg-green-100 text-green-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {view === 'calendar' ? '📅 Calendário' :
             view === 'table' ? '📊 Tabela' :
             '🔲 Grid'}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">
            {view === 'calendar' ? 'Visualize e gerencie escalas em formato de calendário interativo' :
             view === 'table' ? 'Lista detalhada de todas as escalas com informações completas' :
             'Cards visuais organizados para uma visão geral rápida'}
          </span>
        </div>
      </div>
      
      {renderView()}
      
                {/* Botão flutuante para adicionar escala com animação */}
      <button
        className={`fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl transition-all duration-300 ease-in-out font-semibold text-lg focus:outline-none focus:ring-4 transform hover:scale-105 ${
          selectedUBS 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 focus:ring-blue-200 animate-pulse' 
            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
        }`}
        title={selectedUBS ? 'Adicionar Escala' : 'Selecione uma UBS primeiro'}
        onClick={selectedUBS ? openCreateModal : undefined}
        disabled={!selectedUBS}
      >
        <Plus className="h-6 w-6" /> 
        <span className="hidden sm:inline">Nova Escala</span>
      </button>
      
      {/* Modal de cadastro/edição de escala médica - SEM SCROLL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingSchedule ? 'Editar Escala Médica' : 'Nova Escala Médica'} 
        size="xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Informações básicas - Reduzido espaçamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Médico *
              </label>
              <select
                required
                value={formData.doctor_id}
                onChange={(e) => setFormData(prev => ({ ...prev, doctor_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Selecione um médico</option>
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.profile?.name || 'Nome não informado'} - {doc.profile?.profile_doctor?.specialty || 'Especialidade não informada'}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Nenhum médico disponível</option>
                )}
              </select>
              {filteredDoctors.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  {!userCityHallId ? 'Usuário sem prefeitura vinculada' : 'Nenhum médico encontrado para esta UBS'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UBS *
              </label>
              <select
                required
                value={formData.health_unit_id}
                onChange={(e) => setFormData(prev => ({ ...prev, health_unit_id: e.target.value }))}
                disabled={!!userHealthUnitId}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  userHealthUnitId ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Selecione uma UBS</option>
                {filteredHealthUnits.map(ubs => (
                  <option key={ubs.id} value={ubs.id}>{ubs.name}</option>
                ))}
              </select>
              {userHealthUnitId && (
                <p className="text-xs text-gray-500 mt-1">UBS vinculada ao seu usuário</p>
              )}
            </div>
          </div>
          
          {/* Data e hora - Reduzido espaçamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data/Hora Início *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.start_datetime}
                onChange={(e) => setFormData(prev => ({ ...prev, start_datetime: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data/Hora Fim *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.end_datetime}
                onChange={(e) => setFormData(prev => ({ ...prev, end_datetime: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          
          {/* Vagas e status - Reduzido espaçamento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total de Vagas *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.total_slots}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  total_slots: parseInt(e.target.value) || 0,
                  available_slots: parseInt(e.target.value) || 0
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vagas Disponíveis
              </label>
              <input
                type="number"
                min="0"
                max={formData.total_slots}
                value={formData.available_slots}
                onChange={(e) => setFormData(prev => ({ ...prev, available_slots: parseInt(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="temporary">Temporário</option>
              </select>
            </div>
          </div>
          
          {/* Recorrência - Reduzido espaçamento */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="is_recurring"
                checked={formData.is_recurring}
                onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_recurring" className="ml-2 block text-sm font-medium text-gray-700">
                Escala recorrente
              </label>
            </div>
            
            {formData.is_recurring && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Recorrência
                  </label>
                  <select
                    value={formData.recurrence_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrence_type: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="none">Nenhuma</option>
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Término da Recorrência
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.recurrence_end_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrence_end_date: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                
                {/* Recorrência avançada - SIMPLIFICADA */}
                <div className="space-y-4">
                  {/* Dias da Semana - Checkboxes intuitivos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dias da Semana
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {[
                        { value: '1', label: 'Seg', full: 'Segunda' },
                        { value: '2', label: 'Ter', full: 'Terça' },
                        { value: '3', label: 'Qua', full: 'Quarta' },
                        { value: '4', label: 'Qui', full: 'Quinta' },
                        { value: '5', label: 'Sex', full: 'Sexta' },
                        { value: '6', label: 'Sáb', full: 'Sábado' },
                        { value: '0', label: 'Dom', full: 'Domingo' }
                      ].map(day => {
                        const currentWeekdays = formData.recurrence_weekdays ? formData.recurrence_weekdays.split(',').map(d => d.trim()) : [];
                        const isChecked = currentWeekdays.includes(day.value);
                        
                        return (
                          <label key={day.value} className="flex flex-col items-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let newWeekdays = currentWeekdays;
                                if (e.target.checked) {
                                  if (!newWeekdays.includes(day.value)) {
                                    newWeekdays.push(day.value);
                                  }
                                } else {
                                  newWeekdays = newWeekdays.filter(d => d !== day.value);
                                }
                                setFormData(prev => ({ 
                                  ...prev, 
                                  recurrence_weekdays: newWeekdays.join(',') 
                                }));
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-xs text-gray-600 mt-1">{day.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Selecione os dias da semana para esta escala recorrente
                    </p>
                  </div>
                  
                  {/* Fuso Horário */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuso Horário
                    </label>
                    <select
                      value={formData.timezone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Selecione o fuso horário</option>
                      <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                      <option value="America/Manaus">Manaus (GMT-4)</option>
                      <option value="America/Belem">Belém (GMT-3)</option>
                      <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
                      <option value="America/Recife">Recife (GMT-3)</option>
                      <option value="America/Salvador">Salvador (GMT-3)</option>
                      <option value="America/Maceio">Maceió (GMT-3)</option>
                      <option value="America/Aracaju">Aracaju (GMT-3)</option>
                      <option value="America/Natal">Natal (GMT-3)</option>
                      <option value="America/Joao_Pessoa">João Pessoa (GMT-3)</option>
                    </select>
                  </div>
                  
                  {/* Datas de Exceção - Campo simples */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Datas de Exceção
                    </label>
                    <input
                      type="text"
                      value={formData.exdates ? formData.exdates.join(', ') : ''}
                      onChange={(e) => {
                        const dates = e.target.value.split(',').map(d => d.trim()).filter(d => d);
                        setFormData(prev => ({ ...prev, exdates: dates }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Ex: 2025-08-25, 2025-08-26 (separadas por vírgula)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Digite as datas que não devem ter escala, separadas por vírgula
                    </p>
                  </div>
                  
                  {/* RRULE - Opções pré-definidas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Recorrência Avançada
                    </label>
                    <select
                      value={formData.rrule || ''}
                      onChange={(e) => {
                        let rrule = '';
                        switch (e.target.value) {
                          case 'weekly_workdays':
                            rrule = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
                            break;
                          case 'weekly_weekend':
                            rrule = 'FREQ=WEEKLY;BYDAY=SA,SU';
                            break;
                          case 'monthly_first':
                            rrule = 'FREQ=MONTHLY;BYMONTHDAY=1';
                            break;
                          case 'monthly_last':
                            rrule = 'FREQ=MONTHLY;BYMONTHDAY=-1';
                            break;
                          case 'custom':
                            rrule = '';
                            break;
                          default:
                            rrule = '';
                        }
                        setFormData(prev => ({ ...prev, rrule }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Selecione um tipo</option>
                      <option value="weekly_workdays">Segunda a Sexta (Dias úteis)</option>
                      <option value="weekly_weekend">Sábado e Domingo (Fins de semana)</option>
                      <option value="monthly_first">Primeiro dia de cada mês</option>
                      <option value="monthly_last">Último dia de cada mês</option>
                      <option value="custom">Personalizado (RRULE manual)</option>
                    </select>
                    
                    {/* Campo RRULE personalizado */}
                    {formData.rrule && formData.rrule.includes('FREQ=') && (
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Regra de Recorrência (RRULE)
                        </label>
                        <input
                          type="text"
                          value={formData.rrule}
                          onChange={(e) => setFormData(prev => ({ ...prev, rrule: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-blue-500 focus:border-blue-500"
                          placeholder="FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Regra técnica para usuários avançados
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Médico substituto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Médico Substituto
            </label>
            <select
              value={formData.substitute_doctor_id || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, substitute_doctor_id: e.target.value || undefined }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Nenhum médico substituto</option>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.profile?.name || 'Nome não informado'} - {doc.profile?.profile_doctor?.specialty || 'Especialidade não informada'}
                  </option>
                ))
              ) : (
                <option value="" disabled>Nenhum médico disponível</option>
              )}
            </select>
          </div>
          
          {/* Observações - Reduzido altura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Informações adicionais sobre a escala..."
            />
          </div>
          
          {/* Botões - Reduzido espaçamento */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {editingSchedule ? 'Atualizar' : 'Criar'} Escala
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Erro */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
        type={errorModal.type}
        details={errorModal.details}
        size="lg"
      />
    </div>
    </>
  );
};

export default MedicalSchedules;
