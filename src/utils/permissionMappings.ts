// Mapeamento de categorias com ícones e nomes
export const PERMISSION_CATEGORIES = {
  dashboard: { icon: "📊", name: "Dashboard", color: "bg-blue-50 border-blue-200" },
  user: { icon: "👥", name: "Usuários", color: "bg-green-50 border-green-200" },
  profile: { icon: "📋", name: "Perfis", color: "bg-purple-50 border-purple-200" },
  permission: { icon: "🔐", name: "Permissões", color: "bg-red-50 border-red-200" },
  role: { icon: "🎭", name: "Roles", color: "bg-indigo-50 border-indigo-200" },
  appointment: { icon: "🏥", name: "Agendamentos", color: "bg-teal-50 border-teal-200" },
  patient: { icon: "👤", name: "Pacientes", color: "bg-pink-50 border-pink-200" },
  doctor: { icon: "👨‍⚕️", name: "Médicos", color: "bg-cyan-50 border-cyan-200" },
  specialty: { icon: "🏥", name: "Especialidades", color: "bg-orange-50 border-orange-200" },
  health_unit: { icon: "🏢", name: "Unidades de Saúde", color: "bg-emerald-50 border-emerald-200" },
  city_hall: { icon: "🏛️", name: "Prefeituras", color: "bg-yellow-50 border-yellow-200" },
  medical_record: { icon: "📋", name: "Prontuários", color: "bg-lime-50 border-lime-200" },
  medical_schedule: { icon: "📅", name: "Agendas Médicas", color: "bg-violet-50 border-violet-200" },
  report: { icon: "📊", name: "Relatórios", color: "bg-rose-50 border-rose-200" },
  config: { icon: "⚙️", name: "Configurações", color: "bg-gray-50 border-gray-200" },
  system: { icon: "🖥️", name: "Sistema", color: "bg-slate-50 border-slate-200" },
  audit: { icon: "📝", name: "Auditoria", color: "bg-amber-50 border-amber-200" },
  notification: { icon: "📨", name: "Notificações", color: "bg-sky-50 border-sky-200" },
};

// Mapeamento de nomes humanizados das permissões
export const PERMISSION_NAMES = {
  // === DASHBOARD ===
  dashboard_view: "Visualizar dashboard",
  dashboard_stats: "Visualizar estatísticas",
  dashboard_reports: "Acessar relatórios do dashboard",

  // === USUÁRIOS ===
  user_create: "Criar usuários",
  user_read: "Visualizar usuários",
  user_update: "Editar usuários",
  user_delete: "Excluir usuários",
  user_list: "Listar usuários",

  // === PERFIS ===
  profile_create: "Criar perfis",
  profile_read: "Visualizar perfis",
  profile_update: "Editar perfis",
  profile_delete: "Excluir perfis",
  profile_list: "Listar perfis",

  // === PERMISSÕES ===
  permission_create: "Criar permissões",
  permission_read: "Visualizar permissões",
  permission_update: "Editar permissões",
  permission_delete: "Excluir permissões",
  permission_list: "Listar permissões",

  // === ROLES ===
  role_create: "Criar roles",
  role_read: "Visualizar roles",
  role_update: "Editar roles",
  role_delete: "Excluir roles",
  role_list: "Listar roles",
  user_permission_manage: "Gerenciar permissões de usuários",

  // === AGENDAMENTOS ===
  appointment_create: "Criar agendamentos",
  appointment_read: "Visualizar agendamentos",
  appointment_update: "Editar agendamentos",
  appointment_delete: "Excluir agendamentos",
  appointment_list: "Listar agendamentos",
  appointment_cancel: "Cancelar agendamentos",
  appointment_reschedule: "Reagendar agendamentos",

  // === PACIENTES ===
  patient_create: "Criar pacientes",
  patient_read: "Visualizar pacientes",
  patient_update: "Editar pacientes",
  patient_delete: "Excluir pacientes",
  patient_list: "Listar pacientes",

  // === MÉDICOS ===
  doctor_create: "Criar médicos",
  doctor_read: "Visualizar médicos",
  doctor_update: "Editar médicos",
  doctor_delete: "Excluir médicos",
  doctor_list: "Listar médicos",

  // === ESPECIALIDADES ===
  specialty_create: "Criar especialidades",
  specialty_read: "Visualizar especialidades",
  specialty_update: "Editar especialidades",
  specialty_delete: "Excluir especialidades",
  specialty_list: "Listar especialidades",

  // === UNIDADES DE SAÚDE ===
  health_unit_create: "Criar unidades de saúde",
  health_unit_read: "Visualizar unidades de saúde",
  health_unit_update: "Editar unidades de saúde",
  health_unit_delete: "Excluir unidades de saúde",
  health_unit_list: "Listar unidades de saúde",

  // === PREFEITURAS ===
  city_hall_create: "Criar prefeituras",
  city_hall_read: "Visualizar prefeituras",
  city_hall_update: "Editar prefeituras",
  city_hall_delete: "Excluir prefeituras",
  city_hall_list: "Listar prefeituras",

  // === PRONTUÁRIOS MÉDICOS ===
  medical_record_create: "Criar prontuários",
  medical_record_read: "Visualizar prontuários",
  medical_record_update: "Editar prontuários",
  medical_record_delete: "Excluir prontuários",
  medical_record_list: "Listar prontuários",

  // === AGENDAS MÉDICAS ===
  medical_schedule_create: "Criar agendas médicas",
  medical_schedule_read: "Visualizar agendas médicas",
  medical_schedule_update: "Editar agendas médicas",
  medical_schedule_delete: "Excluir agendas médicas",
  medical_schedule_list: "Listar agendas médicas",

  // === RELATÓRIOS ===
  report_generate: "Gerar relatórios",
  report_view: "Visualizar relatórios",
  report_export: "Exportar relatórios",

  // === CONFIGURAÇÕES ===
  config_view: "Visualizar configurações",
  config_update: "Editar configurações",
  system_settings: "Configurações do sistema",

  // === AUDITORIA ===
  audit_view: "Visualizar auditoria",
  audit_export: "Exportar logs de auditoria",

  // === NOTIFICAÇÕES ===
  notification_send: "Enviar notificações",
  notification_view: "Visualizar notificações",
  notification_manage: "Gerenciar notificações",
};

// Função para extrair a categoria de uma permissão
export const getPermissionCategory = (permissionName: string): string => {
  const parts = permissionName.split('_');
  return parts[0] || 'other';
};

// Função para obter o nome humanizado de uma permissão
export const getPermissionDisplayName = (permissionName: string): string => {
  return PERMISSION_NAMES[permissionName as keyof typeof PERMISSION_NAMES] || permissionName;
};

// Função para agrupar permissões por categoria
export const groupPermissionsByCategory = (permissions: string[]) => {
  const grouped: Record<string, string[]> = {};
  
  permissions.forEach(permission => {
    const category = getPermissionCategory(permission);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(permission);
  });

  // Ordenar permissões dentro de cada categoria
  Object.keys(grouped).forEach(category => {
    grouped[category].sort();
  });

  return grouped;
};

// Função para obter informações da categoria
export const getCategoryInfo = (categoryKey: string) => {
  return PERMISSION_CATEGORIES[categoryKey as keyof typeof PERMISSION_CATEGORIES] || {
    icon: "📝",
    name: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
    color: "bg-gray-50 border-gray-200"
  };
};

// Lista dos roles disponíveis
export const AVAILABLE_ROLES = [
  { key: 'MASTER', name: 'Master', color: 'bg-red-600', description: 'Acesso total ao sistema' },
  { key: 'ADMIN', name: 'Administrador', color: 'bg-blue-600', description: 'Acesso administrativo' },
  { key: 'DOCTOR', name: 'Médico', color: 'bg-green-600', description: 'Acesso médico' },
  { key: 'PATIENT', name: 'Paciente', color: 'bg-purple-600', description: 'Acesso básico' },
]; 