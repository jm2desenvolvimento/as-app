import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { MedicalRecord, Medication } from '../../../types/medical-record';
import { Plus, Edit2, Trash2, Calendar, Pill, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

interface EditMedicationsTabProps {
  formData: Partial<MedicalRecord>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<MedicalRecord>>>;
}

const EditMedicationsTab: React.FC<EditMedicationsTabProps> = ({ formData, setFormData }) => {
  const { token } = useAuthStore();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    id: '',
    name: '',
    dosage: '',
    frequency: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    instructions: '',
    status: 'active'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para obter headers com token de autenticação
  const getAuthHeaders = () => {
    const currentToken = token || localStorage.getItem('token');
    console.log('[EditMedicationsTab] Token disponível:', currentToken ? 'SIM' : 'NÃO');
    return {
      'Content-Type': 'application/json',
      ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
    };
  };

  // Fetch medications when component mounts or formData.id changes
  useEffect(() => {
    if (formData?.id) {
      fetchMedications(formData.id);
    }
  }, [formData?.id]);

  const fetchMedications = async (medicalRecordId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[EditMedicationsTab] Buscando medicamentos para prontuário:', medicalRecordId);
      console.log('[EditMedicationsTab] URL:', `http://localhost:3000/api/medical-records/${medicalRecordId}/medications`);
      console.log('[EditMedicationsTab] Headers:', getAuthHeaders());
      
      const response = await axios.get(`http://localhost:3000/api/medical-records/${medicalRecordId}/medications`, {
        headers: getAuthHeaders()
      });
      
      console.log('[EditMedicationsTab] Medicamentos carregados com sucesso:', response.data);
      setMedications(response.data);
      // Update formData to keep it in sync
      setFormData(prev => ({
        ...prev,
        medications: response.data
      }));
    } catch (err: any) {
      console.error('[EditMedicationsTab] Error fetching medications:', err);
      setError('Erro ao carregar medicamentos');
      // Fallback to existing data if available
      if (formData.medications) {
        setMedications(formData.medications);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMedication = async () => {
    if (!formData?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const medicationData = {
        ...newMedication,
        medical_record_id: formData.id
      };
      
      const response = await axios.post('/api/medical-records/medications', medicationData);
      const newMedicationFromAPI = response.data;
      
      // Update local state
      setMedications(prev => [...prev, newMedicationFromAPI]);
      
      // Update formData to keep it in sync
      setFormData(prev => ({
        ...prev,
        medications: [...(prev.medications || []), newMedicationFromAPI]
      }));
      
      // Reset form
      setNewMedication({
        id: '',
        name: '',
        dosage: '',
        frequency: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        instructions: '',
        prescribed_by: '',
        active: true
      });
      
      setIsAdding(false);
    } catch (err: any) {
      console.error('Error adding medication:', err);
      setError('Erro ao adicionar medicamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMedication = async () => {
    if (!editingMedication) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/medical-records/medications/${editingMedication.id}`, editingMedication);
      const updatedMedication = response.data;
      
      // Update local state
      setMedications(prev => prev.map(m => 
        m.id === editingMedication.id ? updatedMedication : m
      ));
      
      // Update formData to keep it in sync
      setFormData(prev => ({
        ...prev,
        medications: prev.medications?.map(m => 
          m.id === editingMedication.id ? updatedMedication : m
        )
      }));
      
      setEditingMedication(null);
    } catch (err: any) {
      console.error('Error updating medication:', err);
      setError('Erro ao atualizar medicamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este medicamento?')) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/medical-records/medications/${id}`);
      
      // Update local state
      setMedications(prev => prev.filter(m => m.id !== id));
      
      // Update formData to keep it in sync
      setFormData(prev => ({
        ...prev,
        medications: prev.medications?.filter(m => m.id !== id)
      }));
    } catch (err: any) {
      console.error('Error deleting medication:', err);
      setError('Erro ao excluir medicamento');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMedicationForm = (medication: Partial<Medication>, isNew: boolean = false) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      
      if (name === 'active') {
        const isActive = value === 'true';
        if (isNew) {
          setNewMedication(prev => ({ ...prev, active: isActive }));
        } else {
          setEditingMedication(prev => prev ? { ...prev, active: isActive } : null);
        }
        return;
      }
      
      if (isNew) {
        setNewMedication(prev => ({ ...prev, [name]: value }));
      } else {
        setEditingMedication(prev => prev ? { ...prev, [name]: value } : null);
      }
    };

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isNew ? 'Novo Medicamento' : 'Editar Medicamento'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Medicamento*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Pill className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={medication.name || ''}
                onChange={handleChange}
                placeholder="Nome do medicamento"
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
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
              placeholder="Ex: 500mg, 10ml, etc."
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
              placeholder="Ex: 2x ao dia, a cada 8h, etc."
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
              value={medication.prescribed_by || ''}
              onChange={handleChange}
              placeholder="Nome do médico"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              name="active"
              value={medication.active?.toString() || 'true'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
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
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isNew ? 'Adicionar' : 'Atualizar'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Medicamentos</h3>
        {!isAdding && !editingMedication && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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
      
      {editingMedication && renderMedicationForm(editingMedication)}
      
      {/* Loading State */}
      {isLoading && !isAdding && !editingMedication && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Carregando medicamentos...</span>
        </div>
      )}
      
      {!isAdding && !editingMedication && !isLoading && (
        <div className="space-y-4">
          {medications && medications.length > 0 ? (
            medications.map((medication) => (
              <div 
                key={medication.id} 
                className={`bg-white p-4 rounded-lg border ${medication.active ? 'border-green-200' : 'border-gray-200'} shadow-sm`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${medication.active ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <Pill className={`w-5 h-5 ${medication.active ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-medium text-gray-900">
                          {medication.name}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          medication.active 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {medication.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {medication.dosage && `${medication.dosage} • `}
                        {medication.frequency}
                      </p>
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
                      onClick={() => handleDeleteMedication(medication.id)}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Excluir medicamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {medication.start_date && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      <span>Início: {new Date(medication.start_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  
                  {medication.end_date && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      <span>Término: {new Date(medication.end_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
                
                {medication.instructions && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Instruções</p>
                    <p className="text-sm text-gray-700">{medication.instructions}</p>
                  </div>
                )}
                
                {medication.prescribed_by && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Prescrito por</p>
                    <p className="text-sm text-gray-700">Dr. {medication.prescribed_by}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-xl border border-gray-200">
              <Pill className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum medicamento registrado</h3>
              <p className="text-sm text-gray-500 max-w-md">Adicione medicamentos para este paciente.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditMedicationsTab;
