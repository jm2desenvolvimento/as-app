import React from 'react';
import { Search, Filter, RefreshCw, Save, X } from 'lucide-react';
import { useIsMobile } from '../../../hooks/useIsMobile';

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
  const isMobile = useIsMobile();
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className={`${isMobile ? 'px-3 py-3' : 'px-6 py-4'}`}>
        {/* Título e ações principais */}
        <div className={`flex items-center ${isMobile ? 'flex-col space-y-3' : 'justify-between'} mb-4`}>
          <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
            {IconComponent && (
              <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg`}>
                <IconComponent className={`${isMobile ? 'h-4 w-4' : 'h-7 w-7'} text-white`} />
              </div>
            )}
            <div>
              <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-600 mt-1`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Ações do cabeçalho */}
          <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
            {hasChanges && (
              <>
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className={`inline-flex items-center border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 ${
                      isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'
                    }`}
                  >
                    <X className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                    {isMobile ? 'Cancelar' : 'Cancelar'}
                  </button>
                )}
                
                {onSave && (
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className={`inline-flex items-center border border-transparent rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                      isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'
                    }`}
                  >
                    {saving ? (
                      <RefreshCw className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'} animate-spin`} />
                    ) : (
                      <Save className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                    )}
                    {saving ? (isMobile ? 'Salvando...' : 'Salvando...') : (isMobile ? 'Salvar' : 'Salvar Alterações')}
                  </button>
                )}
              </>
            )}
            
            {actions}
          </div>
        </div>

        {/* Barra de busca e filtros */}
        {onSearchChange && (
          <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full pl-10 pr-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                  isMobile ? 'py-2 text-sm' : 'py-3'
                }`}
              />
            </div>
            
            <button className={`border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 ${
              isMobile ? 'p-2' : 'p-3'
            }`}>
              <Filter className={`text-gray-600 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </button>
          </div>
        )}

        {/* Indicador de mudanças não salvas */}
        {hasChanges && (
          <div className={`mt-4 bg-amber-50 border border-amber-200 rounded-xl ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center">
              <div className={`bg-amber-500 rounded-full animate-pulse ${isMobile ? 'w-1.5 h-1.5 mr-2' : 'w-2 h-2 mr-3'}`} />
              <p className={`text-amber-700 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile ? 'Alterações não salvas' : 'Você tem alterações não salvas. Lembre-se de salvar antes de sair da página.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 