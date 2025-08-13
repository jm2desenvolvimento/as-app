import React from 'react';
import { Check, X } from 'lucide-react';
import { getPermissionColor, PERMISSION_LABELS } from '../../../constants/permissionCategories';

interface PermissionCardProps {
  permission: string;
  isActive: boolean;
  onChange: (permission: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PermissionCard: React.FC<PermissionCardProps> = ({
  permission,
  isActive,
  onChange,
  disabled = false,
  size = 'md'
}) => {
  const color = getPermissionColor(permission);
  const label = PERMISSION_LABELS[permission] || permission;
  
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-sm',
    lg: 'p-5 text-base'
  };

  const colorVariants: Record<string, string> = {
    blue: isActive ? 'bg-green-50 border-green-200 hover:border-green-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300',
    green: isActive ? 'bg-green-50 border-green-200 hover:border-green-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300',
    yellow: isActive ? 'bg-green-50 border-green-200 hover:border-green-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300',
    red: isActive ? 'bg-green-50 border-green-200 hover:border-green-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300',
    purple: isActive ? 'bg-green-50 border-green-200 hover:border-green-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300',
    indigo: isActive ? 'bg-green-50 border-green-200 hover:border-green-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300',
    orange: isActive ? 'bg-green-50 border-green-200 hover:border-green-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300',
    gray: isActive ? 'bg-green-50 border-green-200 hover:border-green-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
  };

  const iconColorVariants: Record<string, string> = {
    blue: isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600',
    green: isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600',
    yellow: isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600',
    red: isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600',
    purple: isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600',
    indigo: isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600',
    orange: isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600',
    gray: isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
  };

  return (
    <div
      className={`
        relative flex items-center justify-between rounded-xl border-2 transition-all duration-200 cursor-pointer
        transform hover:scale-105 hover:shadow-md
        ${sizeClasses[size]}
        ${colorVariants[color] || colorVariants.gray}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={() => !disabled && onChange(permission)}
    >
      {/* Gradiente sutil de fundo quando ativo */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
      )}
      
      <div className="flex-1 relative z-10">
        <h4 className="font-semibold text-gray-900 leading-tight">
          {label}
        </h4>
        <p className="text-xs text-gray-500 mt-1 font-mono">
          {permission}
        </p>
      </div>
      
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 relative z-10
        ${iconColorVariants[color] || iconColorVariants.gray}
      `}>
        {isActive ? (
          <Check className="h-4 w-4" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </div>
      
      {/* Efeito de brilho quando ativo */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </div>
  );
}; 