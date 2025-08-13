import React from 'react';
import { Search, Filter, RefreshCw, Save, X } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  hasChanges?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: IconComponent,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  actions,
  hasChanges = false,
  onSave,
  onCancel,
  saving = false,
  className = ""
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-6 py-4">
        {/* Título e ações principais */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {IconComponent && (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <IconComponent className="h-7 w-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Ações do cabeçalho */}
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <>
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </button>
                )}
                
                {onSave && (
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                )}
              </>
            )}
            
            {actions}
          </div>
        </div>

        {/* Barra de busca e filtros */}
        {onSearchChange && (
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
            
            <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}

        {/* Indicador de mudanças não salvas */}
        {hasChanges && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-3" />
              <p className="text-sm text-amber-700 font-medium">
                Você tem alterações não salvas. Lembre-se de salvar antes de sair da página.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 