import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  cpf: string;
  role: string;
  city_id?: string | null;
  health_unit_id?: string | null;
  profile: any;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string, onSuccess?: (role_type: string) => void) => Promise<void>;
  logout: () => void;
  loadUserPermissions: () => Promise<void>;
  initAuth: () => Promise<void>;
}

// Função para obter permissões padrão baseadas no role
const getDefaultPermissionsByRole = (role: string): string[] => {
  const defaultPermissions = {
    MASTER: [
      // Dashboard
      'dashboard_view',
      'dashboard_stats',
      'dashboard_reports',
      'dashboard_master_view',
      'dashboard_admin_view',
      // Usuários
      'user_create','user_view','user_update','user_delete','user_list',
      // Perfis
      'profile_create','profile_view','profile_update','profile_delete','profile_list',
      // RBAC
      'permission_create','permission_view','permission_update','permission_delete','permission_list',
      'role_create','role_view','role_update','role_delete','role_list',
      'user_permission_manage',
      // Agendamentos
      'appointment_create','appointment_view','appointment_update','appointment_delete','appointment_list','appointment_cancel','appointment_reschedule',
      // Pacientes
      'patient_create','patient_view','patient_update','patient_delete','patient_list',
      // Médicos
      'doctor_create','doctor_view','doctor_update','doctor_delete','doctor_list',
      // Especialidades
      'specialty_create','specialty_view','specialty_update','specialty_delete','specialty_list',
      // Unidades de Saúde
      'health_unit_create','health_unit_view','health_unit_update','health_unit_delete','health_unit_list',
      // Prefeituras
      'city_hall_create','city_hall_view','city_hall_update','city_hall_delete','city_hall_list',
      // Prontuários
      'medical_record_create','medical_record_view','medical_record_update','medical_record_delete','medical_record_list',
      // Agenda Médica
      'medical_schedule_create','medical_schedule_view','medical_schedule_update','medical_schedule_delete','medical_schedule_list',
      // Relatórios
      'report_generate','report_view','report_export',
      // Config
      'config_view','config_update','system_settings',
      // Auditoria
      'audit_view','audit_export',
      // Notificações
      'notification_send','notification_view','notification_manage',
    ],
    ADMIN: [
      // Dashboard
      'dashboard_view',
      'dashboard_stats',
      'dashboard_reports',
      'dashboard_admin_view',
      // Usuários
      'user_create','user_view','user_update','user_delete','user_list',
      // Perfis
      'profile_create','profile_view','profile_update','profile_delete','profile_list',
      // RBAC
      'permission_create','permission_view','permission_update','permission_delete','permission_list',
      'role_create','role_view','role_update','role_delete','role_list',
      'user_permission_manage',
      // Agendamentos
      'appointment_create','appointment_view','appointment_update','appointment_delete','appointment_list','appointment_cancel','appointment_reschedule',
      // Pacientes
      'patient_create','patient_view','patient_update','patient_delete','patient_list',
      // Médicos
      'doctor_create','doctor_view','doctor_update','doctor_delete','doctor_list',
      // Especialidades
      'specialty_create','specialty_view','specialty_update','specialty_delete','specialty_list',
      // Unidades de Saúde
      'health_unit_create','health_unit_view','health_unit_update','health_unit_delete','health_unit_list',
      // Prefeituras
      'city_hall_create','city_hall_view','city_hall_update','city_hall_delete','city_hall_list',
      // Prontuários
      'medical_record_create','medical_record_view','medical_record_update','medical_record_delete','medical_record_list',
      // Agenda Médica
      'medical_schedule_create','medical_schedule_view','medical_schedule_update','medical_schedule_delete','medical_schedule_list',
      // Relatórios
      'report_generate','report_view','report_export',
      // Config
      'config_view','config_update','system_settings',
      // Auditoria
      'audit_view','audit_export',
      // Notificações
      'notification_send','notification_view','notification_manage',
    ],
    DOCTOR: [
      'dashboard_doctor_view',
      'doctor_schedule_view',
      'medical_schedule_view',
      'appointment_view',
      'patient_view',
      'patient_list',
      'medical_record_view',
      'medical_record_list',
      'medical_record_create',
      'medical_record_update',
      'medical_record_delete'
    ],
    PATIENT: [
      'dashboard_patient_view',
      'appointment_view',
      'profile_view',
      'profile_update'
    ]
  };

  return defaultPermissions[role as keyof typeof defaultPermissions] || [];
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (identifier, password, onSuccess) => {
    console.log('[ZUSTAND] login chamado', { identifier, password });
    console.log('[ZUSTAND] login - Token atual no localStorage:', localStorage.getItem('token'));
    console.log('[ZUSTAND] login - Estado atual do authStore:', get());
    
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/auth/login', {
        identifier,
        password,
      });
      console.log('[ZUSTAND] Resposta do backend:', response.data);
      
      const { user, access_token } = response.data;
      
      console.log('[ZUSTAND] login - Dados do usuário recebidos:', user);
      console.log('[ZUSTAND] login - Role do usuário:', user.role);
      console.log('[ZUSTAND] login - Token recebido:', access_token ? 'SIM' : 'NÃO');
      
      // Decodificar o token JWT para verificar o conteúdo
      if (access_token) {
        try {
          const tokenParts = access_token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('[ZUSTAND] login - Payload do token JWT:', payload);
            console.log('[ZUSTAND] login - Role no token JWT:', payload.role);
          }
        } catch (e) {
          console.warn('[ZUSTAND] login - Erro ao decodificar token JWT:', e);
        }
      }
      
      // Definir o token primeiro
      set({ token: access_token });
      localStorage.setItem('token', access_token);
      console.log('[ZUSTAND] login - Token salvo no localStorage e estado');
      
      // Carregar permissões do usuário
      try {
        const permissionsResponse = await axios.get('/rbac/my-permissions');
        const userWithPermissions = {
          ...user,
          permissions: permissionsResponse.data.permissions || []
        };
        
        set({ 
          user: userWithPermissions, 
          loading: false, 
          error: null 
        });
        
        console.log('[ZUSTAND] Permissões carregadas:', permissionsResponse.data.permissions);
      } catch (permError) {
        console.warn('[ZUSTAND] Erro ao carregar permissões, usando permissões padrão baseadas no role:', permError);
        
        // Definir permissões padrão baseadas no role do usuário
        const defaultPermissions = getDefaultPermissionsByRole(user.role);
        
        set({ 
          user: { ...user, permissions: defaultPermissions }, 
          loading: false, 
          error: null 
        });
        
        console.log('[ZUSTAND] Permissões padrão definidas:', defaultPermissions);
      }
      
      console.log('[ZUSTAND] login - Chamando callback onSuccess com role:', user.role);
      if (onSuccess) onSuccess(user.role);
    } catch (err: any) {
      console.error('[ZUSTAND] Erro na requisição de login:', err);
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
    }
    console.log('[ZUSTAND] login finalizado');
  },

  loadUserPermissions: async () => {
    const { user, token } = get();
    if (!user || !token) return;

    try {
      const response = await axios.get('/rbac/my-permissions');
      set(state => ({
        user: state.user ? {
          ...state.user,
          permissions: response.data.permissions || []
        } : null
      }));
      console.log('[ZUSTAND] Permissões recarregadas:', response.data.permissions);
    } catch (error) {
      console.error('[ZUSTAND] Erro ao carregar permissões:', error);
    }
  },

  logout: () => {
    console.log('[ZUSTAND] logout - Limpando estado e localStorage');
    set({ user: null, token: null, loading: false, error: null });
    localStorage.removeItem('token');
    console.log('[ZUSTAND] logout - Logout concluído');
  },

  /**
   * Inicializa a autenticação: se houver token no localStorage, busca o perfil e permissões do usuário
   */
  initAuth: async () => {
    const token = localStorage.getItem('token');
    console.log('[ZUSTAND] initAuth - Token encontrado no localStorage:', token ? 'SIM' : 'NÃO');
    if (!token) return;
    
    set({ token });
    console.log('[ZUSTAND] initAuth - Token definido no estado');
    
    try {
      // Buscar perfil do usuário
      console.log('[ZUSTAND] initAuth - Fazendo requisição para /auth/me');
      const userResponse = await axios.get('/auth/me');
      console.log('[ZUSTAND] initAuth - Resposta do /auth/me:', userResponse.data);
      
      // Verificar se o role está correto na resposta
      console.log('[ZUSTAND] initAuth - Role do usuário na resposta:', userResponse.data.role);
      
      // Decodificar o token atual para comparar
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        try {
          const tokenParts = currentToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('[ZUSTAND] initAuth - Payload do token atual:', payload);
            console.log('[ZUSTAND] initAuth - Role no token atual:', payload.role);
            console.log('[ZUSTAND] initAuth - Role na resposta vs token:', {
              responseRole: userResponse.data.role,
              tokenRole: payload.role
            });
          }
        } catch (e) {
          console.warn('[ZUSTAND] initAuth - Erro ao decodificar token atual:', e);
        }
      }
      
      // Buscar permissões
      let permissions: string[] = [];
      try {
        console.log('[ZUSTAND] initAuth - Fazendo requisição para /rbac/my-permissions');
        const permissionsResponse = await axios.get('/rbac/my-permissions');
        permissions = permissionsResponse.data.permissions || [];
        console.log('[ZUSTAND] Permissões carregadas no initAuth:', permissions);
      } catch (permError) {
        console.warn('[ZUSTAND] Erro ao carregar permissões no initAuth, usando permissões padrão:', permError);
        permissions = getDefaultPermissionsByRole(userResponse.data.role);
        console.log('[ZUSTAND] Permissões padrão definidas no initAuth:', permissions);
      }
      
      const userWithPermissions = { ...userResponse.data, permissions };
      console.log('[ZUSTAND] initAuth - Usuário final com permissões:', userWithPermissions);
      
      set({
        user: userWithPermissions,
        loading: false,
        error: null,
      });
      
      console.log('[ZUSTAND] initAuth - Estado atualizado com sucesso');
    } catch (err: any) {
      console.error('[ZUSTAND] initAuth - Erro ao inicializar autenticação:', err);
      console.error('[ZUSTAND] initAuth - Detalhes do erro:', err.response?.data);
      set({ user: null, token: null, error: 'Sessão expirada ou inválida' });
      localStorage.removeItem('token');
    }
  },
}));
 