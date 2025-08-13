import { PERMISSION_GROUPS, PERMISSION_LABELS, getPermissionColor } from '../constants/permissionCategories';

/**
 * Obtém o nome amigável de uma permissão
 */
export const getPermissionDisplayName = (permission: string): string => {
  return PERMISSION_LABELS[permission] || permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Obtém a categoria de uma permissão
 */
export const getPermissionCategory = (permission: string): string => {
  for (const group of PERMISSION_GROUPS) {
    for (const category of group.categories) {
      if (category.permissions.includes(permission)) {
        return category.key;
      }
    }
  }
  return 'other';
};

/**
 * Obtém o grupo de uma permissão
 */
export const getPermissionGroup = (permission: string): string => {
  for (const group of PERMISSION_GROUPS) {
    for (const category of group.categories) {
      if (category.permissions.includes(permission)) {
        return group.key;
      }
    }
  }
  return 'system';
};

/**
 * Agrupa permissões por categoria
 */
export const groupPermissionsByCategory = (permissions: string[]): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};
  
  permissions.forEach(permission => {
    const category = getPermissionCategory(permission);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(permission);
  });
  
  return grouped;
};

/**
 * Filtra permissões por termo de busca
 */
export const filterPermissions = (permissions: string[], searchTerm: string): string[] => {
  if (!searchTerm.trim()) return permissions;
  
  const term = searchTerm.toLowerCase();
  return permissions.filter(permission => 
    permission.toLowerCase().includes(term) ||
    getPermissionDisplayName(permission).toLowerCase().includes(term)
  );
};

/**
 * Calcula estatísticas de permissões
 */
export const calculatePermissionStats = (
  allPermissions: string[], 
  userPermissions: string[]
): {
  total: number;
  active: number;
  percentage: number;
  missing: string[];
  extra: string[];
} => {
  const active = userPermissions.filter(p => allPermissions.includes(p)).length;
  const total = allPermissions.length;
  const percentage = total > 0 ? Math.round((active / total) * 100) : 0;
  
  const missing = allPermissions.filter(p => !userPermissions.includes(p));
  const extra = userPermissions.filter(p => !allPermissions.includes(p));
  
  return {
    total,
    active,
    percentage,
    missing,
    extra
  };
};

/**
 * Obtém cor CSS para uma permissão baseada na ação
 */
export const getPermissionColorClass = (permission: string, active: boolean = false): string => {
  const color = getPermissionColor(permission);
  
  const colorMap: Record<string, { bg: string; border: string; text: string; activeBg: string; activeBorder: string }> = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      activeBg: 'bg-blue-100',
      activeBorder: 'border-blue-300'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200', 
      text: 'text-green-700',
      activeBg: 'bg-green-100',
      activeBorder: 'border-green-300'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      activeBg: 'bg-yellow-100', 
      activeBorder: 'border-yellow-300'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      activeBg: 'bg-red-100',
      activeBorder: 'border-red-300'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      activeBg: 'bg-purple-100',
      activeBorder: 'border-purple-300'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      activeBg: 'bg-orange-100',
      activeBorder: 'border-orange-300'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      activeBg: 'bg-gray-100',
      activeBorder: 'border-gray-300'
    }
  };
  
  const colors = colorMap[color] || colorMap.gray;
  
  return `${active ? colors.activeBg : colors.bg} ${active ? colors.activeBorder : colors.border} ${colors.text}`;
};

/**
 * Valida se uma lista de permissões é válida
 */
export const validatePermissions = (permissions: string[]): {
  valid: string[];
  invalid: string[];
  duplicates: string[];
} => {
  const allValidPermissions = PERMISSION_GROUPS.flatMap(group => 
    group.categories.flatMap(category => category.permissions)
  );
  
  const valid: string[] = [];
  const invalid: string[] = [];
  const duplicates: string[] = [];
  const seen = new Set<string>();
  
  permissions.forEach(permission => {
    if (seen.has(permission)) {
      duplicates.push(permission);
      return;
    }
    
    seen.add(permission);
    
    if (allValidPermissions.includes(permission)) {
      valid.push(permission);
    } else {
      invalid.push(permission);
    }
  });
  
  return { valid, invalid, duplicates };
};

/**
 * Formata lista de permissões para exibição
 */
export const formatPermissionsList = (permissions: string[], limit: number = 5): string => {
  if (permissions.length === 0) return 'Nenhuma permissão';
  
  const displayNames = permissions.slice(0, limit).map(getPermissionDisplayName);
  
  if (permissions.length <= limit) {
    return displayNames.join(', ');
  }
  
  return `${displayNames.join(', ')} e mais ${permissions.length - limit}`;
};

/**
 * Compara duas listas de permissões
 */
export const comparePermissions = (
  oldPermissions: string[], 
  newPermissions: string[]
): {
  added: string[];
  removed: string[];
  unchanged: string[];
} => {
  const oldSet = new Set(oldPermissions);
  const newSet = new Set(newPermissions);
  
  const added = newPermissions.filter(p => !oldSet.has(p));
  const removed = oldPermissions.filter(p => !newSet.has(p));
  const unchanged = oldPermissions.filter(p => newSet.has(p));
  
  return { added, removed, unchanged };
};

/**
 * Gera sugestões de permissões baseadas em um role
 */
export const getSuggestedPermissions = (role: string): string[] => {
  const rolePermissionMap: Record<string, string[]> = {
    MASTER: PERMISSION_GROUPS.flatMap(g => g.categories.flatMap(c => c.permissions)),
    ADMIN: [
      'dashboard_view', 'dashboard_metrics_view',
      'user_view', 'user_create', 'user_edit',
      'health_unit_view', 'health_unit_create', 'health_unit_edit',
      'report_view', 'report_generate'
    ],
    DOCTOR: [
      'dashboard_view',
      'patient_view', 'patient_view_details',
      'appointment_view', 'appointment_create', 'appointment_edit',
      'medical_record_view', 'medical_record_create', 'medical_record_edit',
      'prescription_create', 'diagnostic_create', 'treatment_create'
    ],
    PATIENT: [
      'dashboard_view',
      'appointment_view', 'appointment_create', 'appointment_cancel',
      'medical_record_view',
      'profile_view', 'profile_edit'
    ]
  };
  
  return rolePermissionMap[role] || [];
}; 