import { useAuthStore } from '../store/authStore';
import { useMemo } from 'react';

// Lista de permissões (deve ser sincronizada com o backend)
export const PERMISSIONS = {
  // === USUÁRIOS ===
  USER_CREATE: 'user_create',
  USER_VIEW: 'user_view',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  USER_LIST: 'user_list',

  // === PERFIS ===
  PROFILE_CREATE: 'profile_create',
  PROFILE_VIEW: 'profile_view',
  PROFILE_UPDATE: 'profile_update',
  PROFILE_DELETE: 'profile_delete',
  PROFILE_LIST: 'profile_list',

  // === PERMISSÕES E ROLES ===
  PERMISSION_CREATE: 'permission_create',
  PERMISSION_VIEW: 'permission_view',
  PERMISSION_UPDATE: 'permission_update',
  PERMISSION_DELETE: 'permission_delete',
  PERMISSION_LIST: 'permission_list',
  ROLE_CREATE: 'role_create',
  ROLE_VIEW: 'role_view',
  ROLE_UPDATE: 'role_update',
  ROLE_DELETE: 'role_delete',
  ROLE_LIST: 'role_list',
  USER_PERMISSION_MANAGE: 'user_permission_manage',

  // === DASHBOARD ===
  DASHBOARD_STATS: 'dashboard_stats',
  DASHBOARD_REPORTS: 'dashboard_reports',
  DASHBOARD_MASTER_VIEW: 'dashboard_master_view',
  DASHBOARD_ADMIN_VIEW: 'dashboard_admin_view',
  DASHBOARD_DOCTOR_VIEW: 'dashboard_doctor_view',
  DASHBOARD_PATIENT_VIEW: 'dashboard_patient_view',

  // === AGENDAMENTOS ===
  APPOINTMENT_CREATE: 'appointment_create',
  APPOINTMENT_VIEW: 'appointment_view',
  APPOINTMENT_UPDATE: 'appointment_update',
  APPOINTMENT_DELETE: 'appointment_delete',
  APPOINTMENT_LIST: 'appointment_list',
  APPOINTMENT_CANCEL: 'appointment_cancel',
  APPOINTMENT_RESCHEDULE: 'appointment_reschedule',
  
  // === AGENDA MÉDICA ===
  DOCTOR_SCHEDULE_VIEW: 'doctor_schedule_view',
  DOCTOR_SCHEDULE_MANAGE: 'doctor_schedule_manage',
  
  // === HISTÓRICO PACIENTE ===
  PATIENT_HISTORY_VIEW: 'patient_history_view',

  // === PACIENTES ===
  PATIENT_CREATE: 'patient_create',
  PATIENT_VIEW: 'patient_view',
  PATIENT_UPDATE: 'patient_update',
  PATIENT_DELETE: 'patient_delete',
  PATIENT_LIST: 'patient_list',

  // === MÉDICOS ===
  DOCTOR_CREATE: 'doctor_create',
  DOCTOR_VIEW: 'doctor_view',
  DOCTOR_UPDATE: 'doctor_update',
  DOCTOR_DELETE: 'doctor_delete',
  DOCTOR_LIST: 'doctor_list',

  // === ESPECIALIDADES ===
  SPECIALTY_CREATE: 'specialty_create',
  SPECIALTY_VIEW: 'specialty_view',
  SPECIALTY_UPDATE: 'specialty_update',
  SPECIALTY_DELETE: 'specialty_delete',
  SPECIALTY_LIST: 'specialty_list',

  // === UNIDADES DE SAÚDE ===
  HEALTH_UNIT_CREATE: 'health_unit_create',
  HEALTH_UNIT_VIEW: 'health_unit_view',
  HEALTH_UNIT_UPDATE: 'health_unit_update',
  HEALTH_UNIT_DELETE: 'health_unit_delete',
  HEALTH_UNIT_LIST: 'health_unit_list',

  // === PREFEITURAS ===
  CITY_HALL_CREATE: 'city_hall_create',
  CITY_HALL_VIEW: 'city_hall_view',
  CITY_HALL_UPDATE: 'city_hall_update',
  CITY_HALL_DELETE: 'city_hall_delete',
  CITY_HALL_LIST: 'city_hall_list',

  // === PRONTUÁRIOS MÉDICOS ===
  MEDICAL_RECORD_CREATE: 'medical_record_create',
  MEDICAL_RECORD_VIEW: 'medical_record_view',
  MEDICAL_RECORD_UPDATE: 'medical_record_update',
  MEDICAL_RECORD_DELETE: 'medical_record_delete',
  MEDICAL_RECORD_LIST: 'medical_record_list',

  // === AGENDA MÉDICA ===
  MEDICAL_SCHEDULE_CREATE: 'medical_schedule_create',
  MEDICAL_SCHEDULE_VIEW: 'medical_schedule_view',
  MEDICAL_SCHEDULE_UPDATE: 'medical_schedule_update',
  MEDICAL_SCHEDULE_DELETE: 'medical_schedule_delete',
  MEDICAL_SCHEDULE_LIST: 'medical_schedule_list',

  // === RELATÓRIOS ===
  REPORT_GENERATE: 'report_generate',
  REPORT_VIEW: 'report_view',
  REPORT_EXPORT: 'report_export',

  // === CONFIGURAÇÕES ===
  CONFIG_VIEW: 'config_view',
  CONFIG_UPDATE: 'config_update',
  SYSTEM_SETTINGS: 'system_settings',

  // === AUDITORIA ===
  AUDIT_VIEW: 'audit_view',
  AUDIT_EXPORT: 'audit_export',

  // === NOTIFICAÇÕES ===
  NOTIFICATION_SEND: 'notification_send',
  NOTIFICATION_VIEW: 'notification_view',
  NOTIFICATION_MANAGE: 'notification_manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Hook para verificar permissões do usuário logado
 */
export function usePermission() {
  const { user } = useAuthStore();
  
  const userPermissions = useMemo(() => {
    return user?.permissions || [];
  }, [user?.permissions]);

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  /**
   * Verifica se o usuário tem todas as permissões especificadas
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => userPermissions.includes(permission));
  };

  /**
   * Verifica se o usuário tem pelo menos uma das permissões especificadas
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission));
  };

  /**
   * Verifica se o usuário tem um role específico
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  /**
   * Verifica se o usuário é admin ou master
   */
  const isAdmin = (): boolean => {
    return hasRole('ADMIN') || hasRole('MASTER');
  };

  /**
   * Verifica se o usuário é master
   */
  const isMaster = (): boolean => {
    return hasRole('MASTER');
  };

  /**
   * Verifica se o usuário é médico
   */
  const isDoctor = (): boolean => {
    return hasRole('DOCTOR');
  };

  /**
   * Verifica se o usuário é paciente
   */
  const isPatient = (): boolean => {
    return hasRole('PATIENT');
  };

  return {
    permissions: userPermissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    isAdmin,
    isMaster,
    isDoctor,
    isPatient,
    user,
  };
} 