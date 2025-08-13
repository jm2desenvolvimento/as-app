import React from 'react';
import { Save, Loader2, X } from 'lucide-react';

interface FloatingSaveButtonProps {
  isVisible: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel?: () => void;
  saveText?: string;
  className?: string;
}

export const FloatingSaveButton: React.FC<FloatingSaveButtonProps> = ({
  isVisible,
  isSaving,
  onSave,
  onCancel,
  saveText = "Salvar Alterações",
  className = ""
}) => {
  if (!isVisible) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
      max-w-xs sm:max-w-sm md:max-w-md
      ${className}
    `}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4 backdrop-blur-sm">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-3">
          {/* Texto de alterações pendentes */}
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-gray-600 font-medium">
              <span className="hidden sm:inline">Você tem alterações não salvas</span>
              <span className="sm:hidden">Alterações pendentes</span>
            </span>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isSaving}
                className="
                  inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 
                  bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 flex-1 sm:flex-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">Cancelar</span>
              </button>
            )}
            
            <button
              onClick={onSave}
              disabled={isSaving}
              className="
                inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white 
                bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                flex-1 sm:flex-none min-w-0
              "
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin flex-shrink-0" />
                  <span className="hidden xs:inline sm:hidden">Salvando</span>
                  <span className="hidden sm:inline">Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden xs:inline sm:hidden">Salvar</span>
                  <span className="hidden sm:inline">{saveText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 