import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { MedicalRecord, Consultation } from '../../../types/medical-record';
import { Plus, Edit2, Trash2, Calendar, User, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

interface EditConsultationsTabProps {
  formData: Partial<MedicalRecord>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<MedicalRecord>>>;
  onValidationChange?: (isValid: boolean) => void;
}

const EditConsultationsTab: React.FC<EditConsultationsTabProps> = ({ formData, setFormData }) => {
  const { token, user } = useAuthStore();

  // ✅ DEBUG: Log dos dados recebidos
  console.log('🔄 [EditConsultationsTab] FormData recebido:', formData);
  console.log('🏥 [EditConsultationsTab] Consultations:', formData.consultations);
  console.log('📊 [EditConsultationsTab] Consultations length:', formData.consultations?.length || 0);
  console.log('🔍 [EditConsultationsTab] FormData keys:', Object.keys(formData));

  // ✅ CORRIGIDO: Usar formData.consultations diretamente em vez de estado local
  const consultations = formData.consultations || [];
  
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [newConsultation, setNewConsultation] = useState<Partial<Consultation>>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    doctor_name: user?.profile?.name || 'Médico',
    specialty: user?.profile?.profile_doctor?.specialty || 'Clínico Geral',
    reason: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    status: 'completed'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para obter headers com token de autenticação
  const getAuthHeaders = () => {
    // Busca o token primeiro do estado do Zustand, depois do localStorage
    // Isso garante que o token seja compartilhado entre abas
    const currentToken = token || localStorage.getItem('token');
    console.log('[EditConsultationsTab] Token disponível:', currentToken ? 'SIM' : 'NÃO');
    if (!currentToken) {
      console.warn('[EditConsultationsTab] Token não encontrado no estado nem no localStorage');
    }
    return {
      'Content-Type': 'application/json',
      ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
    };
  };

  // ✅ PREENCHIMENTO AUTOMÁTICO: Preencher campos do médico quando o componente montar
  useEffect(() => {
    if (user?.profile?.name || user?.profile?.profile_doctor?.name) {
      const doctorName = user.profile?.name || user.profile?.profile_doctor?.name || 'Médico';
      const doctorSpecialty = user.profile?.profile_doctor?.specialty || 'Clínico Geral';
      
      console.log('[EditConsultationsTab] Preenchendo campos automaticamente:', {
        doctorName,
        doctorSpecialty,
        user: user
      });
      
      setNewConsultation(prev => ({
        ...prev,
        doctor_name: doctorName,
        specialty: doctorSpecialty
      }));
    }
  }, [user]);

  // ✅ CORRIGIDO: Remover fetchConsultations pois agora usamos formData diretamente
  // useEffect(() => {
  //   if (formData?.id) {
  //     fetchConsultations(formData.id);
  //   }
  // }, [formData?.id]);

  // ✅ CORRIGIDO: Função simplificada que não busca da API
  // const fetchConsultations = async (medicalRecordId: string) => {
  //   // Removido pois agora usamos formData.consultations diretamente
  // };

  const handleAddConsultation = async () => {
    if (!formData?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Mapear dados do frontend para o formato esperado pelo backend (DTO)
      const consultationData = {
        medical_record_id: formData.id,
        doctor_id: user?.id || '83c6a0c7-d4e0-4c19-ba42-fea3d014d0df', // ID do médico logado
        consultation_date: newConsultation.date,
        reason: newConsultation.reason || 'Consulta de rotina',
        // Corrigido: campo 'observations' para corresponder ao DTO do backend
        observations: newConsultation.notes,
        prescriptions: newConsultation.prescription,
        status: newConsultation.status || 'completed',
        // Adicionando campos opcionais que podem ser necessários
        doctor_name: newConsultation.doctor_name || user?.profile?.name || 'Médico',
        specialty: newConsultation.specialty || 'Clínica Geral',
        diagnosis: newConsultation.diagnosis
      };
      
      console.log('[EditConsultationsTab] Payload mapeado para DTO:', consultationData);
      console.log('[EditConsultationsTab] Headers:', getAuthHeaders());
      
      console.log('[EditConsultationsTab] Criando consulta:', consultationData);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/medical-records/consultations`, consultationData, {
        headers: getAuthHeaders()
      });
      
      console.log('[EditConsultationsTab] Resposta da API:', response.data);
      const newConsultationFromAPI = response.data;
      
      // ✅ CORRIGIDO: Atualizar formData diretamente
      setFormData(prev => ({
        ...prev,
        consultations: [...(prev.consultations || []), newConsultationFromAPI]
      }));
      
      // Reset form
      setNewConsultation({
        id: '',
        date: new Date().toISOString().split('T')[0],
        doctor_name: '',
        specialty: '',
        reason: '',
        diagnosis: '',
        prescription: '',
        notes: '',
        status: 'completed'
      });
      
      setIsAdding(false);
    } catch (err: any) {
      console.error('[EditConsultationsTab] Erro ao adicionar consulta:', err);
      console.error('[EditConsultationsTab] Detalhes do erro:', err.response?.data);
      console.error('[EditConsultationsTab] Status do erro:', err.response?.status);
      
      // Mensagem de erro mais específica baseada no status
      if (err.response?.status === 400) {
        setError(`Erro 400: Dados inválidos. Verifique os campos obrigatórios. ${err.response?.data?.message || ''}`);
      } else if (err.response?.status === 403) {
        setError('Erro 403: Sem permissão para criar consultas.');
      } else {
        setError(`Erro ao adicionar consulta: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConsultation = async () => {
    if (!editingConsultation) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/medical-records/consultations/${editingConsultation.id}`, editingConsultation);
      const updatedConsultation = response.data;
      
      // ✅ CORRIGIDO: Atualizar formData diretamente
      setFormData(prev => ({
        ...prev,
        consultations: (prev.consultations || []).map(c => 
          c.id === editingConsultation.id ? updatedConsultation : c
        )
      }));
      
      setEditingConsultation(null);
    } catch (err: any) {
      console.error('[EditConsultationsTab] Erro ao atualizar consulta:', err);
      setError('Erro ao atualizar consulta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConsultation = async (consultationId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta consulta?')) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/medical-records/consultations/${consultationId}`, {
        headers: getAuthHeaders()
      });
      
      // ✅ CORRIGIDO: Atualizar formData diretamente
      setFormData(prev => ({
        ...prev,
        consultations: (prev.consultations || []).filter(c => c.id !== consultationId)
      }));
    } catch (err: any) {
      console.error('[EditConsultationsTab] Erro ao excluir consulta:', err);
      setError('Erro ao excluir consulta');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Realizada';
      case 'cancelled': return 'Cancelada';
      case 'scheduled': return 'Agendada';
      default: return 'Desconhecido';
    }
  };

  const renderConsultationForm = (consultation: Partial<Consultation>, isNew: boolean = false) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (isNew) {
        setNewConsultation(prev => ({ ...prev, [name]: value }));
      } else {
        setEditingConsultation(prev => prev ? { ...prev, [name]: value } : null);
      }
    };

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isNew ? 'Nova Consulta' : 'Editar Consulta'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                name="date"
                value={consultation.date?.toString().split('T')[0] || ''}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={consultation.status || 'completed'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="completed">Realizada</option>
              <option value="cancelled">Cancelada</option>
              <option value="scheduled">Agendada</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Médico <span className="text-xs text-gray-500">(preenchido automaticamente)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="doctor_name"
                value={consultation.doctor_name || ''}
                onChange={handleChange}
                placeholder="Nome do médico"
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                readOnly
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidade <span className="text-xs text-gray-500">(preenchida automaticamente)</span>
            </label>
            <input
              type="text"
              name="specialty"
              value={consultation.specialty || ''}
              onChange={handleChange}
              placeholder="Especialidade médica"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              readOnly
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo da Consulta
          </label>
          <textarea
            name="reason"
            value={consultation.reason || ''}
            onChange={handleChange}
            placeholder="Descreva o motivo da consulta"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diagnóstico
          </label>
          <textarea
            name="diagnosis"
            value={consultation.diagnosis || ''}
            onChange={handleChange}
            placeholder="Diagnóstico do médico"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prescrição
          </label>
          <textarea
            name="prescription"
            value={consultation.prescription || ''}
            onChange={handleChange}
            placeholder="Medicamentos prescritos"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            name="notes"
            value={consultation.notes || ''}
            onChange={handleChange}
            placeholder="Observações adicionais"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => isNew ? setIsAdding(false) : setEditingConsultation(null)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={isNew ? handleAddConsultation : handleUpdateConsultation}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isNew ? 'Adicionar Consulta' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Consultas</h3>
          <p className="text-sm text-gray-500 mt-1">Consultas salvam automaticamente quando você clica em "Nova Consulta"</p>
        </div>
        {!isAdding && !editingConsultation && (
          <button
            onClick={() => setIsAdding(true)}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Adiciona e salva a consulta imediatamente no banco de dados"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nova Consulta
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdding && renderConsultationForm(newConsultation, true)}
      
      {editingConsultation && renderConsultationForm(editingConsultation)}
      
      {/* Loading State */}
      {isLoading && !isAdding && !editingConsultation && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Carregando consultas...</span>
        </div>
      )}
      
      {!isAdding && !editingConsultation && !isLoading && (
        <div className="space-y-4">
          {consultations && consultations.length > 0 ? (
            consultations.map((consultation) => (
              <div 
                key={consultation.id} 
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-medium text-gray-900">
                          {consultation.specialty || 'Consulta Médica'}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                          {getStatusText(consultation.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(consultation.date).toLocaleDateString('pt-BR')} • Dr. {consultation.doctor_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingConsultation(consultation)}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Editar consulta"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteConsultation(consultation.id)}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Excluir consulta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {consultation.reason && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Motivo</p>
                    <p className="text-sm text-gray-700">{consultation.reason}</p>
                  </div>
                )}
                
                {consultation.diagnosis && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Diagnóstico</p>
                    <p className="text-sm text-gray-700">{consultation.diagnosis}</p>
                  </div>
                )}
                
                {consultation.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Observações</p>
                    <p className="text-sm text-gray-700">{consultation.notes}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-xl border border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma consulta registrada</h3>
              <p className="text-sm text-gray-500 max-w-md">Adicione consultas médicas para este paciente.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditConsultationsTab;
