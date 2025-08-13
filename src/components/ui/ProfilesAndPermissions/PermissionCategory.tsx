import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, CheckSquare, Square } from 'lucide-react';
import { PermissionCard } from './PermissionCard';
import type { PermissionCategory as PermissionCategoryType } from '../../../constants/permissionCategories';

interface PermissionCategoryProps {
  category: PermissionCategoryType;
  activePermissions: string[];
  onPermissionChange: (permission: string) => void;
  disabled?: boolean;
  defaultExpanded?: boolean;
}

export const PermissionCategory: React.FC<PermissionCategoryProps> = ({
  category,
  activePermissions,
  onPermissionChange,
  disabled = false,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Verificar quantas permissões da categoria estão ativas
  const categoryPermissions = category.permissions;
  const activeCount = categoryPermissions.filter(permission => 
    activePermissions.includes(permission)
  ).length;
  const totalCount = categoryPermissions.length;
  const allSelected = activeCount === totalCount;
  const noneSelected = activeCount === 0;
  const partiallySelected = activeCount > 0 && activeCount < totalCount;

  // Função para selecionar todas as permissões da categoria
  const selectAllCategory = () => {
    categoryPermissions.forEach(permission => {
      if (!activePermissions.includes(permission)) {
        onPermissionChange(permission);
      }
    });
  };

  // Função para desmarcar todas as permissões da categoria
  const deselectAllCategory = () => {
    categoryPermissions.forEach(permission => {
      if (activePermissions.includes(permission)) {
        onPermissionChange(permission);
      }
    });
  };

  // Função para alternar seleção da categoria (select/deselect all)
  const toggleCategorySelection = () => {
    if (allSelected) {
      deselectAllCategory();
    } else {
      selectAllCategory();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header da categoria com botões de ação */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-3 flex-1">
          {/* Ícone e checkbox da categoria */}
          <button
            onClick={toggleCategorySelection}
            disabled={disabled}
            className="flex items-center space-x-3 text-left hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${category.color}-100`}>
              <category.icon className={`h-4 w-4 text-${category.color}-600`} />
            </div>
            
            {/* Checkbox visual */}
            <div className="flex items-center space-x-2">
              {allSelected ? (
                <CheckSquare className={`h-5 w-5 text-${category.color}-600`} />
              ) : partiallySelected ? (
                <div className={`w-5 h-5 rounded border-2 border-${category.color}-600 bg-${category.color}-100 flex items-center justify-center`}>
                  <div className={`w-2 h-2 bg-${category.color}-600 rounded`} />
                </div>
              ) : (
                <Square className="h-5 w-5 text-gray-400" />
              )}
              
              <div>
                <h4 className="font-semibold text-gray-900">{category.name}</h4>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
            </div>
          </button>

          {/* Contador e botão de expandir/recolher */}
          <div className="flex items-center space-x-2 ml-auto sm:ml-0">
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              allSelected 
                ? `bg-${category.color}-100 text-${category.color}-700` 
                : partiallySelected
                ? `bg-yellow-100 text-yellow-700`
                : 'bg-gray-100 text-gray-600'
            }`}>
              {activeCount}/{totalCount}
            </span>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={selectAllCategory}
            disabled={disabled || allSelected}
            className={`
              inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap
              ${allSelected 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : `bg-${category.color}-100 text-${category.color}-700 hover:bg-${category.color}-200 hover:shadow-sm`
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <CheckCircle2 className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Selecionar Todos</span>
            <span className="sm:hidden">Todos</span>
          </button>
          
          <button
            onClick={deselectAllCategory}
            disabled={disabled || noneSelected}
            className={`
              inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap
              ${noneSelected 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-sm'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <Circle className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Desmarcar Todos</span>
            <span className="sm:hidden">Nenhum</span>
          </button>
        </div>
      </div>

             {/* Lista de permissões (expandível) */}
       {isExpanded && (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
           {category.permissions.map((permission) => {
             const isActive = activePermissions.includes(permission);
             
             return (
               <PermissionCard
                 key={permission}
                 permission={permission}
                 isActive={isActive}
                 onChange={onPermissionChange}
                 disabled={disabled}
                 size="sm"
               />
             );
           })}
         </div>
       )}
    </div>
  );
}; 