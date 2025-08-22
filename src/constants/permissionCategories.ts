import { 
  Building2, 
  Stethoscope, 
  Users, 
  Calendar, 
  ClipboardList, 
  Heart, 
  Bell, 
  Shield, 
  Settings, 
  User,
  Building,
  MapPin,
  Clock,
  BarChart3,
  Eye,
  UserCog,
  Lock,
  Badge
} from 'lucide-react';
import Home from '../pages/landingpage/Home'; // Corrigindo a importação para a página Home.tsx

export interface PermissionCategory {
  key: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  permissions: string[];
}

export interface PermissionGroup {
  key: string;
  name: string;
  icon: any;
  color: string;
  gradient: string;
  description: string;
  categories: PermissionCategory[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'core',
    name: 'Sistema Principal',
    icon: Home,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    description: 'Funcionalidades básicas do sistema',
    categories: [
      {
        key: 'dashboard',
        name: 'Dashboard',
        icon: Home,
        color: 'blue',
        description: 'Painel principal e métricas',
        permissions: ['dashboard_view', 'dashboard_stats', 'dashboard_reports']
      },
      {
        key: 'users',
        name: 'Usuários',
        icon: User,
        color: 'blue',
        description: 'Gerenciamento de usuários do sistema',
        permissions: ['user_create', 'user_read', 'user_update', 'user_delete', 'user_list']
      },
      {
        key: 'profiles',
        name: 'Perfis',
        icon: Users,
        color: 'blue',
        description: 'Gerenciamento de perfis de usuário',
        permissions: ['profile_create', 'profile_read', 'profile_update', 'profile_delete', 'profile_list']
      }
    ]
  },
  {
    key: 'medical',
    name: 'Área Médica',
    icon: Heart,
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    description: 'Funcionalidades médicas e clínicas',
    categories: [
      {
        key: 'doctors',
        name: 'Médicos',
        icon: Stethoscope,
        color: 'emerald',
        description: 'Gerenciamento de médicos',
        permissions: ['doctor_create', 'doctor_read', 'doctor_update', 'doctor_delete', 'doctor_list']
      },
      {
        key: 'patients',
        name: 'Pacientes',
        icon: Users,
        color: 'emerald',
        description: 'Gerenciamento de pacientes',
        permissions: ['patient_create', 'patient_read', 'patient_update', 'patient_delete', 'patient_list']
      },
      {
        key: 'appointments',
        name: 'Agendamentos',
        icon: Calendar,
        color: 'emerald',
        description: 'Sistema de agendamento de consultas',
        permissions: ['appointment_create', 'appointment_read', 'appointment_update', 'appointment_delete', 'appointment_list', 'appointment_cancel', 'appointment_reschedule']
      },
      {
        key: 'medical_records',
        name: 'Prontuários',
        icon: ClipboardList,
        color: 'emerald',
        description: 'Prontuários médicos dos pacientes',
        permissions: ['medical_record_create', 'medical_record_read', 'medical_record_update', 'medical_record_delete', 'medical_record_list']
      },
      {
        key: 'medical_schedules',
        name: 'Agenda Médica',
        icon: Clock,
        color: 'emerald',
        description: 'Gerenciamento de agenda médica',
        permissions: ['medical_schedule_create', 'medical_schedule_read', 'medical_schedule_update', 'medical_schedule_delete', 'medical_schedule_list']
      },
      {
        key: 'specialties',
        name: 'Especialidades',
        icon: Badge,
        color: 'emerald',
        description: 'Especialidades médicas',
        permissions: ['specialty_create', 'specialty_read', 'specialty_update', 'specialty_delete', 'specialty_list']
      }
    ]
  },
  {
    key: 'management',
    name: 'Gestão',
    icon: Building2,
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    description: 'Administração e gestão do sistema',
    categories: [
      {
        key: 'health_units',
        name: 'Unidades de Saúde',
        icon: Building,
        color: 'orange',
        description: 'UBS e unidades de saúde',
        permissions: ['health_unit_create', 'health_unit_read', 'health_unit_update', 'health_unit_delete', 'health_unit_list']
      },
      {
        key: 'city_halls',
        name: 'Prefeituras',
        icon: MapPin,
        color: 'orange',
        description: 'Gestão de prefeituras',
        permissions: ['city_hall_create', 'city_hall_read', 'city_hall_update', 'city_hall_delete', 'city_hall_list']
      },
      {
        key: 'reports',
        name: 'Relatórios',
        icon: BarChart3,
        color: 'orange',
        description: 'Geração e visualização de relatórios',
        permissions: ['report_generate', 'report_view', 'report_export']
      }
    ]
  },
  {
    key: 'security',
    name: 'Segurança & Controle',
    icon: Shield,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    description: 'Permissões, roles e controle de acesso',
    categories: [
      {
        key: 'permissions',
        name: 'Permissões',
        icon: Lock,
        color: 'purple',
        description: 'Gerenciamento de permissões',
        permissions: ['permission_create', 'permission_read', 'permission_update', 'permission_delete', 'permission_list']
      },
      {
        key: 'roles',
        name: 'Roles',
        icon: UserCog,
        color: 'purple',
        description: 'Gerenciamento de roles do sistema',
        permissions: ['role_create', 'role_read', 'role_update', 'role_delete', 'role_list', 'user_permission_manage']
      },
      {
        key: 'audit',
        name: 'Auditoria',
        icon: Eye,
        color: 'purple',
        description: 'Logs e auditoria do sistema',
        permissions: ['audit_view', 'audit_export']
      }
    ]
  },
  {
    key: 'system',
    name: 'Sistema',
    icon: Settings,
    color: 'slate',
    gradient: 'from-slate-500 to-slate-600',
    description: 'Configurações e funcionalidades do sistema',
    categories: [
      {
        key: 'notifications',
        name: 'Notificações',
        icon: Bell,
        color: 'slate',
        description: 'Sistema de notificações',
        permissions: ['notification_send', 'notification_view', 'notification_manage']
      },
      {
        key: 'settings',
        name: 'Configurações',
        icon: Settings,
        color: 'slate',
        description: 'Configurações gerais do sistema',
        permissions: ['config_view', 'config_update', 'system_settings']
      }
    ]
  }
];

// Mapeamento de permissões para nomes humanizados (SINCRONIZADO COM BACKEND)
export const PERMISSION_LABELS: Record<string, string> = {
  // === DASHBOARD ===
  'dashboard_view': 'Visualizar Dashboard',
  'dashboard_stats': 'Ver Estatísticas',
  'dashboard_reports': 'Ver Relatórios do Dashboard',
  
  // === USUÁRIOS ===
  'user_create': 'Criar Usuários',
  'user_read': 'Visualizar Usuários',
  'user_update': 'Editar Usuários',
  'user_delete': 'Excluir Usuários',
  'user_list': 'Listar Usuários',
  
  // === PERFIS ===
  'profile_create': 'Criar Perfis',
  'profile_read': 'Visualizar Perfis',
  'profile_update': 'Editar Perfis',
  'profile_delete': 'Excluir Perfis',
  'profile_list': 'Listar Perfis',
  
  // === MÉDICOS ===
  'doctor_create': 'Cadastrar Médicos',
  'doctor_read': 'Visualizar Médicos',
  'doctor_update': 'Editar Médicos',
  'doctor_delete': 'Excluir Médicos',
  'doctor_list': 'Listar Médicos',
  
  // === PACIENTES ===
  'patient_create': 'Cadastrar Pacientes',
  'patient_read': 'Visualizar Pacientes',
  'patient_update': 'Editar Pacientes',
  'patient_delete': 'Excluir Pacientes',
  'patient_list': 'Listar Pacientes',
  
  // === AGENDAMENTOS ===
  'appointment_create': 'Criar Agendamentos',
  'appointment_read': 'Visualizar Agendamentos',
  'appointment_update': 'Editar Agendamentos',
  'appointment_delete': 'Excluir Agendamentos',
  'appointment_list': 'Listar Agendamentos',
  'appointment_cancel': 'Cancelar Agendamentos',
  'appointment_reschedule': 'Reagendar Consultas',
  
  // === PRONTUÁRIOS MÉDICOS ===
  'medical_record_create': 'Criar Prontuários',
  'medical_record_read': 'Visualizar Prontuários',
  'medical_record_update': 'Editar Prontuários',
  'medical_record_delete': 'Excluir Prontuários',
  'medical_record_list': 'Listar Prontuários',
  
  // === AGENDA MÉDICA ===
  'medical_schedule_create': 'Criar Agenda Médica',
  'medical_schedule_read': 'Visualizar Agenda Médica',
  'medical_schedule_update': 'Editar Agenda Médica',
  'medical_schedule_delete': 'Excluir Agenda Médica',
  'medical_schedule_list': 'Listar Agenda Médica',
  
  // === ESPECIALIDADES ===
  'specialty_create': 'Criar Especialidades',
  'specialty_read': 'Visualizar Especialidades',
  'specialty_update': 'Editar Especialidades',
  'specialty_delete': 'Excluir Especialidades',
  'specialty_list': 'Listar Especialidades',
  
  // === UNIDADES DE SAÚDE ===
  'health_unit_create': 'Criar UBS',
  'health_unit_read': 'Visualizar UBS',
  'health_unit_update': 'Editar UBS',
  'health_unit_delete': 'Excluir UBS',
  'health_unit_list': 'Listar UBS',
  
  // === PREFEITURAS ===
  'city_hall_create': 'Criar Prefeituras',
  'city_hall_read': 'Visualizar Prefeituras',
  'city_hall_update': 'Editar Prefeituras',
  'city_hall_delete': 'Excluir Prefeituras',
  'city_hall_list': 'Listar Prefeituras',
  
  // === RELATÓRIOS ===
  'report_generate': 'Gerar Relatórios',
  'report_view': 'Visualizar Relatórios',
  'report_export': 'Exportar Relatórios',
  
  // === PERMISSÕES ===
  'permission_create': 'Criar Permissões',
  'permission_read': 'Visualizar Permissões',
  'permission_update': 'Editar Permissões',
  'permission_delete': 'Excluir Permissões',
  'permission_list': 'Listar Permissões',
  
  // === ROLES ===
  'role_create': 'Criar Roles',
  'role_read': 'Visualizar Roles',
  'role_update': 'Editar Roles',
  'role_delete': 'Excluir Roles',
  'role_list': 'Listar Roles',
  'user_permission_manage': 'Gerenciar Permissões de Usuários',
  
  // === CONFIGURAÇÕES ===
  'config_view': 'Visualizar Configurações',
  'config_update': 'Editar Configurações',
  'system_settings': 'Configurações do Sistema',
  
  // === AUDITORIA ===
  'audit_view': 'Ver Logs de Auditoria',
  'audit_export': 'Exportar Logs',
  
  // === NOTIFICAÇÕES ===
  'notification_send': 'Enviar Notificações',
  'notification_view': 'Ver Notificações',
  'notification_manage': 'Gerenciar Notificações'
};

// Cores por tipo de ação (SINCRONIZADO COM BACKEND)
export const ACTION_COLORS: Record<string, string> = {
  'view': 'blue',
  'read': 'blue',
  'create': 'green',
  'update': 'yellow',
  'edit': 'yellow',
  'delete': 'red',
  'send': 'purple',
  'export': 'indigo',
  'generate': 'cyan',
  'manage': 'orange',
  'list': 'gray',
  'cancel': 'red',
  'reschedule': 'yellow',
  'stats': 'blue',
  'reports': 'cyan',
  'settings': 'slate'
};

// Função para obter cor da permissão baseada na ação
export const getPermissionColor = (permission: string): string => {
  const action = permission.split('_').pop() || '';
  return ACTION_COLORS[action] || 'gray';
};

// Total de permissões (deve ser 77 - sincronizado com backend)
export const TOTAL_PERMISSIONS = PERMISSION_GROUPS.reduce((total, group) => 
  total + group.categories.reduce((categoryTotal, category) => 
    categoryTotal + category.permissions.length, 0
  ), 0
); 