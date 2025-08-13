import React from 'react';
import { usePermission, type Permission } from '../hooks/usePermission';

interface ProtectedByPermissionProps {
  children: React.ReactNode;
  permissions: Permission | Permission[];
  requireAll?: boolean; // Se true, exige todas as permissões. Se false, exige apenas uma
  fallback?: React.ReactNode;
  role?: string; // Opcional: verificar role específico
}

/**
 * Componente para proteger conteúdo baseado em permissões
 */
export function ProtectedByPermission({
  children,
  permissions,
  requireAll = true,
  fallback = null,
  role
}: ProtectedByPermissionProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, hasRole } = usePermission();

  // Verificar role se especificado
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Normalizar permissões para array
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

  // Verificar permissões
  const hasAccess = requireAll 
    ? hasAllPermissions(permissionArray)
    : hasAnyPermission(permissionArray);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Versão simplificada para uma única permissão
interface ProtectedByRoleProps {
  children: React.ReactNode;
  roles: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedByRole({
  children,
  roles,
  requireAll = false,
  fallback = null
}: ProtectedByRoleProps) {
  const { hasRole } = usePermission();

  const roleArray = Array.isArray(roles) ? roles : [roles];

  const hasAccess = requireAll
    ? roleArray.every(role => hasRole(role))
    : roleArray.some(role => hasRole(role));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 