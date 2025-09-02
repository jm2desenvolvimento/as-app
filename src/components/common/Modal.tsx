import React, { useEffect, useRef } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, FileText, Download } from 'lucide-react';

// Componente para detalhes de consulta
const AppointmentDetailsModal: React.FC<{ appointment: any }> = ({ appointment }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Realizada';
      case 'cancelled': return 'Cancelada';
      case 'no_show': return 'Não compareceu';
      default: return 'Agendada';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-3">Informações Gerais</h5>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Médico:</span>
              <span className="text-gray-900">{appointment.doctor_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Especialidade:</span>
              <span className="text-gray-900">{appointment.specialty}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Data:</span>
              <span className="text-gray-900">{formatDate(appointment.date)} às {formatTime(appointment.time)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Duração:</span>
              <span className="text-gray-900">{appointment.duration} minutos</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Tipo:</span>
              <span className="text-gray-900">{appointment.is_online ? 'Online' : 'Presencial'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Unidade:</span>
              <span className="text-gray-900">{appointment.health_unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {getStatusText(appointment.status)}
              </span>
            </div>
          </div>
        </div>
        
        {appointment.status === 'completed' && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Resultados</h5>
            <div className="space-y-3 text-sm">
              {appointment.notes && (
                <div>
                  <span className="font-medium text-gray-600 block mb-1">Observações:</span>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.notes}</p>
                </div>
              )}
              {appointment.feedback && (
                <div>
                  <span className="font-medium text-gray-600 block mb-1">Seu Feedback:</span>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.feedback}</p>
                </div>
              )}
              {appointment.rating && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Avaliação:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-gray-900">{appointment.rating}/5</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {appointment.status === 'completed' && appointment.documents && appointment.documents.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-3">Documentos</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {appointment.documents.map((doc: any) => (
              <button
                key={doc.id}
                className="flex items-center justify-between gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors duration-150 border border-blue-200"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">{doc.name}</span>
                </div>
                {doc.file_url && (
                  <Download className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  showOverlay?: boolean;
  // Props para dados específicos
  appointment?: any; // Appointment data
  appointmentId?: string; // ID para buscar appointment
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  showOverlay = true,
  appointment,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Previne scroll do body
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Foco automático no modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Tamanhos do modal
  const sizeClasses = {
    sm: isMobile ? 'max-w-sm mx-4' : 'max-w-sm',
    md: isMobile ? 'max-w-md mx-4' : 'max-w-md',
    lg: isMobile ? 'max-w-lg mx-4' : 'max-w-lg',
    xl: isMobile ? 'max-w-xl mx-4' : 'max-w-xl',
    full: isMobile ? 'max-w-full mx-4' : 'max-w-4xl',
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
          className={`fixed inset-0 z-50 flex items-center justify-center ${isMobile ? 'p-2' : 'p-4'} ${
            showOverlay ? 'bg-black/50 backdrop-blur-sm' : ''
          }`}
          onClick={handleOverlayClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`bg-white rounded-lg shadow-2xl w-full ${sizeClasses[size]} ${isMobile ? 'max-h-[95vh]' : 'max-h-[90vh]'} ${className}`}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4 sm:p-6'} border-b border-blue-600 bg-blue-800 rounded-t-lg`}>
                {title && (
                  <h2
                    id="modal-title"
                    className={`${isMobile ? 'text-base' : 'text-lg sm:text-xl'} font-semibold text-white`}
                  >
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-blue-900 transition-colors duration-200 text-white hover:text-blue-100"
                    aria-label="Fechar modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

                         {/* Content */}
             <div className={`${isMobile ? 'p-3' : 'p-4 sm:p-6'} ${isMobile ? 'max-h-[80vh]' : 'max-h-[70vh]'} overflow-y-auto`}>
               {children || (appointment && <AppointmentDetailsModal appointment={appointment} />)}
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal; 