import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Trash2, Plus, Pill, Edit2, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import type { Medication } from '../../../types/medical-record';

interface EditMedicationsTabProps {
  formData: any;
  setFormData: (data: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}

interface MedicationWithIndex extends Partial<Medication> {
  index: number;
}

const EditMedicationsTab: React.FC<EditMedicationsTabProps> = ({ formData, setFormData, onValidationChange }) => {
  const { token, user } = useAuthStore();

  // ✅ DEBUG: Log dos dados recebidos
  console.log('🔄 [EditMedicationsTab] FormData recebido:', formData);
  console.log('💊 [EditMedicationsTab] Medications:', formData.medications);
  console.log('📊 [EditMedicationsTab] Medications length:', formData.medications?.length || 0);
  console.log('🔍 [EditMedicationsTab] FormData keys:', Object.keys(formData));
  console.log('✅ [EditMedicationsTab] onValidationChange disponível:', !!onValidationChange);

  // ✅ CORRIGIDO: Usar formData.medications diretamente em vez de estado local
  const medications = formData.medications || [];
  
  const [editingMedication, setEditingMedication] = useState<MedicationWithIndex | null>(null);
  const [newMedication, setNewMedication] = useState<MedicationWithIndex>({
    id: '',
    name: '',
    dosage: '',
    frequency: '',
    prescribed_by: user?.profile?.name || '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: undefined,
    status: 'active',
    instructions: '',
    index: 0
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para obter headers com token de autenticação
  const getAuthHeaders = () => {
    const currentToken = token || localStorage.getItem('token');
    console.log('[EditMedicationsTab] Token disponível:', currentToken ? 'SIM' : 'NÃO');
    if (!currentToken) {
      console.warn('[EditMedicationsTab] Token não encontrado no estado nem no localStorage');
    }
    return {
      'Content-Type': 'application/json',
      ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
    };
  };

  // ✅ FUNÇÃO UTILITÁRIA: Converter datas para formato ISO-8601
  const convertToISO = (dateString: string | undefined) => {
    if (!dateString) return undefined;
    // Se já é formato ISO, retorna como está
    if (dateString.includes('T')) return dateString;
    // Se é formato YYYY-MM-DD, converte para ISO
    return new Date(dateString + 'T00:00:00.000Z').toISOString();
  };

  // ✅ FUNÇÃO DE VALIDAÇÃO: Validar se há medicamentos válidos
  const validateMedications = () => {
    const medications = formData.medications || [];
    const isValid = medications.length > 0; // Considera válido se houver pelo menos um medicamento
    
    console.log('[EditMedicationsTab] Validação de medicamentos:', { 
      count: medications.length, 
      isValid 
    });
    
    // Notificar mudança de validação para o modal pai
    if (onValidationChange) {
      console.log('[EditMedicationsTab] Chamando onValidationChange com:', isValid);
      onValidationChange(isValid);
    } else {
      console.warn('[EditMedicationsTab] onValidationChange não está disponível');
    }
  };

  // ✅ PREENCHIMENTO AUTOMÁTICO: Preencher campos do médico quando o componente montar
  useEffect(() => {
    if (user?.profile?.name) {
      const doctorName = user.profile.name;
      
      console.log('[EditMedicationsTab] Preenchendo campos automaticamente:', {
        doctorName,
        user: user
      });
      
      setNewMedication(prev => ({
        ...prev,
        prescribed_by: doctorName
      }));
    }
  }, [user]);

  // ✅ VALIDAÇÃO AUTOMÁTICA: Validar sempre que os medicamentos mudarem
  useEffect(() => {
    console.log('[EditMedicationsTab] Medicamentos mudaram, validando...');
    validateMedications();
  }, [formData.medications]);

  // ✅ VALIDAÇÃO INICIAL: Validar quando o componente montar
  useEffect(() => {
    console.log('[EditMedicationsTab] Componente montou, validando medicamentos iniciais...');
    validateMedications();
  }, []);

  const handleAddMedication = async () => {
    if (!formData?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Mapear dados do frontend para o formato esperado pelo backend (DTO)
      const medicationData = {
        medical_record_id: formData.id,
        doctor_id: user?.id || '83c6a0c7-d4e0-4c19-ba42-fea3d014d0df', // ID do médico logado
        name: newMedication.name,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        start_date: convertToISO(newMedication.start_date),
        end_date: convertToISO(newMedication.end_date),
        instructions: newMedication.instructions,
        active: true, // ✅ CORRIGIDO: campo 'active' para corresponder ao schema
        doctor_name: user?.profile?.name || 'Médico', // ✅ ADICIONADO: nome do médico
        // ✅ REMOVIDO: campos não existentes no DTO (status, prescribed_by)
      };

      console.log('[EditMedicationsTab] Adicionando medicamento:', medicationData);
      console.log('[EditMedicationsTab] Datas convertidas:', {
        start_date: medicationData.start_date,
        end_date: medicationData.end_date
      });

      const response = await axios.post('/medical-records/medications', medicationData, {
        headers: getAuthHeaders()
      });

      console.log('[EditMedicationsTab] Medicamento adicionado com sucesso:', response.data);

      // Adicionar o novo medicamento ao formData
      const newMedicationWithId = {
        ...newMedication,
        id: response.data.id,
        index: medications.length
      };

      setFormData((prev: any) => ({
        ...prev,
        medications: [...(prev.medications || []), newMedicationWithId]
      }));

      // ✅ VALIDAR: Após adicionar medicamento
      console.log('[EditMedicationsTab] Medicamento adicionado, validando em 100ms...');
      setTimeout(() => {
        console.log('[EditMedicationsTab] Executando validação após adicionar medicamento...');
        validateMedications();
      }, 100);

      // Resetar formulário
      setNewMedication({
        id: '',
        name: '',
        dosage: '',
        frequency: '',
        prescribed_by: user?.profile?.name || '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: undefined,
        status: 'active',
        instructions: '',
        index: 0
      });
      setIsAdding(false);
      
    } catch (err: any) {
      console.error('[EditMedicationsTab] Erro ao adicionar medicamento:', err);
      setError('Erro ao adicionar medicamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMedication = async () => {
    if (!editingMedication?.id || !formData?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const medicationData = {
        name: editingMedication.name,
        dosage: editingMedication.dosage,
        frequency: editingMedication.frequency,
        start_date: convertToISO(editingMedication.start_date),
        end_date: convertToISO(editingMedication.end_date),
        instructions: editingMedication.instructions,
        active: true, // ✅ CORRIGIDO: campo 'active' para corresponder ao schema
        doctor_name: user?.profile?.name || 'Médico', // ✅ ADICIONADO: nome do médico
        // ✅ REMOVIDO: campos não existentes no DTO (status, prescribed_by)
      };

      console.log('[EditMedicationsTab] Atualizando medicamento:', medicationData);

      await axios.put(`/medical-records/medications/${editingMedication.id}`, medicationData, {
        headers: getAuthHeaders()
      });

      console.log('[EditMedicationsTab] Medicamento atualizado com sucesso');

      // Atualizar o medicamento no formData
      setFormData((prev: any) => ({
        ...prev,
        medications: prev.medications.map((med: any) => 
          med.id === editingMedication.id ? { ...med, ...medicationData } : med
        )
      }));

      // ✅ VALIDAR: Após atualizar medicamento
      console.log('[EditMedicationsTab] Medicamento atualizado, validando em 100ms...');
      setTimeout(() => {
        console.log('[EditMedicationsTab] Executando validação após atualizar medicamento...');
        validateMedications();
      }, 100);

      setEditingMedication(null);
      
    } catch (err: any) {
      console.error('[EditMedicationsTab] Erro ao atualizar medicamento:', err);
      setError('Erro ao atualizar medicamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedication = async (medicationId: string) => {
    if (!medicationId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      console.log('[EditMedicationsTab] Excluindo medicamento:', medicationId);

      await axios.delete(`/medical-records/medications/${medicationId}`, {
        headers: getAuthHeaders()
      });

      console.log('[EditMedicationsTab] Medicamento excluído com sucesso');

      // Remover o medicamento do formData
      setFormData((prev: any) => ({
        ...prev,
        medications: prev.medications.filter((med: any) => med.id !== medicationId)
      }));

      // ✅ VALIDAR: Após excluir medicamento
      console.log('[EditMedicationsTab] Medicamento excluído, validando em 100ms...');
      setTimeout(() => {
        console.log('[EditMedicationsTab] Executando validação após excluir medicamento...');
        validateMedications();
      }, 100);
      
    } catch (err: any) {
      console.error('[EditMedicationsTab] Erro ao excluir medicamento:', err);
      setError('Erro ao excluir medicamento');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMedicationForm = (medication: MedicationWithIndex, isNew: boolean = false) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      
      if (isNew) {
        setNewMedication(prev => ({ ...prev, [name]: value }));
      } else {
        setEditingMedication(prev => prev ? { ...prev, [name]: value } : null);
      }
    };

    return (
      <div key={medication.index} className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-700 flex items-center">
            <Pill className="w-4 h-4 mr-2 text-blue-500" />
            Medicamento {medication.index + 1}
          </h4>
          {!isNew && (
            <button
              type="button"
              onClick={() => removeMedication(medication.id || '')}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Medicamento *
            </label>
            <input
              type="text"
              name="name"
              value={medication.name || ''}
              onChange={handleChange}
              placeholder="Nome do medicamento"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosagem
            </label>
            <input
              type="text"
              name="dosage"
              value={medication.dosage || ''}
              onChange={handleChange}
              placeholder="Ex: 1 comprimido"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequência
            </label>
            <input
              type="text"
              name="frequency"
              value={medication.frequency || ''}
              onChange={handleChange}
              placeholder="Ex: 2x ao dia"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prescrito por
            </label>
            <input
              type="text"
              name="prescribed_by"
              value={medication.prescribed_by || user?.profile?.name || ''}
              onChange={handleChange}
              placeholder="Nome do médico"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                name="start_date"
                value={medication.start_date?.toString().split('T')[0] || ''}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Término
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                name="end_date"
                value={medication.end_date?.toString().split('T')[0] || ''}
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
              value={medication.status || 'active'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
              <option value="discontinued">Descontinuado</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instruções
          </label>
          <textarea
            name="instructions"
            value={medication.instructions || ''}
            onChange={handleChange}
            placeholder="Instruções de uso do medicamento"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
        
        {/* Botões de ação */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => isNew ? setIsAdding(false) : setEditingMedication(null)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={isNew ? handleAddMedication : handleUpdateMedication}
            disabled={isLoading || !medication.name}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isNew ? 'Adicionar Medicamento' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    );
  };

  // const addMedication = () => {
  //   setIsAdding(true);
  //   setEditingMedication(null);
  // };

  const removeMedication = (medicationId: string) => {
    if (medicationId) {
      handleDeleteMedication(medicationId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
        <h3 className="text-lg font-medium text-gray-900">Medicamentos</h3>
          <p className="text-sm text-gray-500 mt-1">Medicamentos salvam automaticamente quando você clica em "Novo Medicamento"</p>
        </div>
        {!isAdding && !editingMedication && (
        <button
            onClick={() => setIsAdding(true)}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Adiciona e salva o medicamento imediatamente no banco de dados"
          >
            <Plus className="w-4 h-4 mr-1" />
          Novo Medicamento
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

      {isAdding && renderMedicationForm(newMedication, true)}
      
      {editingMedication && renderMedicationForm(editingMedication, false)}
      
      {/* Loading State */}
      {isLoading && !isAdding && !editingMedication && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Carregando medicamentos...</span>
        </div>
      )}
      
      {!isAdding && !editingMedication && !isLoading && (
        <div className="space-y-4">
      {formData.medications.length === 0 ? (
        <div className="text-center py-8">
          <Pill className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum medicamento</h3>
          <p className="mt-1 text-sm text-gray-500">Comece adicionando um medicamento.</p>
        </div>
      ) : (
            formData.medications.map((medication: any) => (
              <div 
                key={medication.id} 
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Pill className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-medium text-gray-900">
                          {medication.name || 'Medicamento'}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          medication.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                          medication.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {medication.status === 'active' ? 'Ativo' :
                           medication.status === 'completed' ? 'Concluído' :
                           'Descontinuado'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {medication.dosage} • {medication.frequency} • Dr. {medication.prescribed_by}
                      </p>
                      {medication.start_date && (
                        <p className="text-xs text-gray-400">
                          Início: {new Date(medication.start_date).toLocaleDateString('pt-BR')}
                          {medication.end_date && ` • Fim: ${new Date(medication.end_date).toLocaleDateString('pt-BR')}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingMedication(medication)}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Editar medicamento"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeMedication(medication.id || '')}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Excluir medicamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {medication.instructions && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Instruções</p>
                    <p className="text-sm text-gray-700">{medication.instructions}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EditMedicationsTab;
