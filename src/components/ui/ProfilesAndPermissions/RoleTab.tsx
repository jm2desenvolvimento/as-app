import React from 'react';
import { Shield, Users, Crown, Stethoscope } from 'lucide-react';

interface RoleTabProps {
  role: string;
  label: string;
  description: string;
  isActive: boolean;
  permissionCount: number;
  totalPermissions: number;
  hasChanges?: boolean;
  onClick: () => void;
}

const ROLE_CONFIGS = {
  MASTER: {
    icon: Crown,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600'
  },
  ADMIN: {
    icon: Shield,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600'
  },
  DOCTOR: {
    icon: Stethoscope,
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  PATIENT: {
    icon: Users,
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600'
  }
} as const;

export const RoleTab: React.FC<RoleTabProps> = ({
  role,
  label,
  description,
  isActive,
  permissionCount,
  totalPermissions,
  hasChanges = false,
  onClick
}) => {
  const config = ROLE_CONFIGS[role as keyof typeof ROLE_CONFIGS] || ROLE_CONFIGS.PATIENT;
  const IconComponent = config.icon;
  const progressPercentage = totalPermissions > 0 ? (permissionCount / totalPermissions) * 100 : 0;

  return (
    <button
      className={`
        relative w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left
        transform hover:scale-[1.02] hover:shadow-lg
        ${isActive 
          ? `border-${config.color}-300 bg-gradient-to-br ${config.gradient} text-white shadow-lg` 
          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
        }
      `}
      onClick={onClick}
    >
      {/* Efeito de fundo quando ativo */}
      {isActive && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      )}
      
      {/* Indicador de mudanças não salvas */}
      {hasChanges && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
      )}

      <div className="relative z-10">
        {/* Header com ícone e título */}
        <div className="flex items-center space-x-4 mb-4">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center shadow-md
            ${isActive ? 'bg-white/20' : `bg-${config.color}-100`}
          `}>
            <IconComponent className={`h-6 w-6 ${isActive ? 'text-white' : `text-${config.color}-600`}`} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold">
              {label}
            </h3>
            <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
              {description}
            </p>
          </div>
        </div>

        {/* Estatísticas de permissões */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                {permissionCount}
              </span>
              <span className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                de {totalPermissions} permissões
              </span>
            </div>
            <div className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-400'} mt-1`}>
              {Math.round(progressPercentage)}% configurado
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                isActive ? 'bg-white/60' : `bg-${config.color}-400`
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Badge de status */}
        <div className="mt-4 flex items-center justify-between">
          <div className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${isActive ? 'bg-white/20 text-white' : `bg-${config.color}-100 text-${config.color}-700`}
          `}>
            {role}
          </div>
          
          {hasChanges && (
            <div className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
              Não salvo
            </div>
          )}
        </div>
      </div>
    </button>
  );
}; 