import React from 'react';
import { Shield, Users } from 'lucide-react';

interface ModeToggleProps {
  mode: 'roles' | 'users';
  onModeChange: (mode: 'roles' | 'users') => void;
  className?: string;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
  mode,
  onModeChange,
  className = ""
}) => {
  return (
    <div className={`flex items-center space-x-1 bg-gray-100 p-1 rounded-xl ${className}`}>
      <button
        onClick={() => onModeChange('roles')}
        className={`
          flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200
          ${mode === 'roles' 
            ? 'bg-white text-blue-600 shadow-md' 
            : 'text-gray-600 hover:text-gray-800'
          }
        `}
      >
        <Shield className="h-4 w-4" />
        <span>Gestão por Roles</span>
      </button>
      
      <button
        onClick={() => onModeChange('users')}
        className={`
          flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200
          ${mode === 'users' 
            ? 'bg-white text-blue-600 shadow-md' 
            : 'text-gray-600 hover:text-gray-800'
          }
        `}
      >
        <Users className="h-4 w-4" />
        <span>Gestão por Usuários</span>
      </button>
    </div>
  );
}; 