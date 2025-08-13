import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export type ErrorType = 'error' | 'warning' | 'info' | 'success';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: ErrorType;
  details?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'error',
  details,
  showCloseButton = true,
  closeOnOverlayClick = true,
  size = 'md',
}) => {
  // Configurações por tipo de erro
  const typeConfig = {
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      headerBg: 'bg-red-800',
      headerBorder: 'border-red-600',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      headerBg: 'bg-yellow-800',
      headerBorder: 'border-yellow-600',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      headerBg: 'bg-blue-800',
      headerBorder: 'border-blue-600',
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      headerBg: 'bg-green-800',
      headerBorder: 'border-green-600',
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  // Tamanhos do modal
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`bg-white rounded-lg shadow-2xl w-full ${sizeClasses[size]} border ${config.borderColor}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'error-modal-title' : undefined}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${config.headerBorder} ${config.headerBg} rounded-t-lg`}>
              <div className="flex items-center gap-3">
                <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
                {title && (
                  <h2
                    id="error-modal-title"
                    className="text-lg sm:text-xl font-semibold text-white"
                  >
                    {title}
                  </h2>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-black/20 transition-colors duration-200 text-white hover:text-gray-100"
                  aria-label="Fechar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className={`p-4 sm:p-6 ${config.bgColor}`}>
              <div className="space-y-4">
                {/* Mensagem principal */}
                <div className="flex items-start gap-3">
                  <IconComponent className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{message}</p>
                  </div>
                </div>

                {/* Detalhes adicionais (se houver) */}
                {details && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium mb-2">Detalhes:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{details}</p>
                  </div>
                )}

                {/* Botão de fechar */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={onClose}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      type === 'error' || type === 'warning'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : type === 'success'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Entendi
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ErrorModal;
