import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { MedicalRecord, Exam } from '../../../types/medical-record';
import { Plus, Edit2, Trash2, Calendar, FlaskConical, Download, Loader2, ChevronLeft, ChevronRight, Upload, FileText } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

interface EditExamsTabProps {
  formData: Partial<MedicalRecord>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<MedicalRecord>>>;
}

const EditExamsTab: React.FC<EditExamsTabProps> = ({ formData, setFormData }) => {
  const { token } = useAuthStore();
  const [exams, setExams] = useState<Exam[]>([]);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [newExam, setNewExam] = useState<Partial<Exam>>({
    id: '',
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    lab: '',
    results: '',
    doctor_name: '',
    file_url: '',
    status: 'completed'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Função para obter headers com token de autenticação
  const getAuthHeaders = () => {
    const currentToken = token || localStorage.getItem('token');
    console.log('[EditExamsTab] Token disponível:', currentToken ? 'SIM' : 'NÃO');
    return {
      'Content-Type': 'application/json',
      ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
    };
  };

  // Função para obter headers para upload de arquivos
  const getAuthHeadersForUpload = () => {
    const currentToken = token || localStorage.getItem('token');
    return {
      ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
    };
  };
  const steps = ['Informações Básicas', 'Resultados', 'Anexos', 'Revisão'];

  // Fetch exams when component mounts or formData.id changes
  useEffect(() => {
    if (formData?.id) {
      fetchExams(formData.id);
    }
  }, [formData?.id]);

  const fetchExams = async (medicalRecordId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/medical-records/${medicalRecordId}/exams`);
      setExams(response.data);
      // Update formData to keep it in sync
      setFormData(prev => ({
        ...prev,
        exams: response.data
      }));
    } catch (err: any) {
      console.error('Error fetching exams:', err);
      setError('Erro ao carregar exames');
      // Fallback to existing data if available
      if (formData.exams) {
        setExams(formData.exams);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post('/api/medical-records/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.file_url;
  };

  const handleAddExam = async () => {
    if (!formData?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      let fileUrl = newExam.file_url;
      
      // Upload file if selected
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }
      
      const examData = {
        ...newExam,
        medical_record_id: formData.id,
        file_url: fileUrl
      };
      
      const response = await axios.post('/api/medical-records/exams', examData);
      const newExamFromAPI = response.data;
      
      // Update local state
      setExams(prev => [...prev, newExamFromAPI]);
      
      // Update formData to keep it in sync
      setFormData(prev => ({
        ...prev,
        exams: [...(prev.exams || []), newExamFromAPI]
      }));
      
      // Reset form
      setNewExam({
        id: '',
        name: '',
        date: new Date().toISOString().split('T')[0],
        type: '',
        lab: '',
        results: '',
        doctor_name: '',
        file_url: '',
        status: 'completed'
      });
      
      setSelectedFile(null);
      setCurrentStep(0);
      setIsAdding(false);
    } catch (err: any) {
      console.error('Error adding exam:', err);
      setError('Erro ao adicionar exame');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateExam = async () => {
    if (!editingExam) return;
    
    setIsLoading(true);
    setError(null);
    try {
      let fileUrl = editingExam.file_url;
      
      // Upload file if selected
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }
      
      const examData = {
        ...editingExam,
        file_url: fileUrl
      };
      
      const response = await axios.put(`/api/medical-records/exams/${editingExam.id}`, examData);
      const updatedExam = response.data;
      
      // Update local state
      setExams(prev => prev.map(e => 
        e.id === editingExam.id ? updatedExam : e
      ));
      
      // Update formData to keep it in sync
      setFormData(prev => ({
        ...prev,
        exams: prev.exams?.map(e => 
          e.id === editingExam.id ? updatedExam : e
        )
      }));
      
      setEditingExam(null);
      setSelectedFile(null);
      setCurrentStep(0);
    } catch (err: any) {
      console.error('Error updating exam:', err);
      setError('Erro ao atualizar exame');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este exame?')) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/medical-records/exams/${id}`);
      
      // Update local state
      setExams(prev => prev.filter(e => e.id !== id));
      
      // Update formData to keep it in sync
      setFormData(prev => ({
        ...prev,
        exams: prev.exams?.filter(e => e.id !== id)
      }));
    } catch (err: any) {
      console.error('Error deleting exam:', err);
      setError('Erro ao excluir exame');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return 'Agendado';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (editingExam) {
      setEditingExam(prev => ({ ...prev, [name]: value }));
    } else {
      setNewExam(prev => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = (exam: Partial<Exam>, isNew: boolean = false) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (isNew) {
        setNewExam(prev => ({ ...prev, [name]: value }));
      } else {
        setEditingExam(prev => prev ? { ...prev, [name]: value } : null);
      }
    };

    switch (currentStep) {
      case 0: // Informações Básicas
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Exame*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FlaskConical className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={exam.name || ''}
                    onChange={handleChange}
                    placeholder="Nome do exame"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Exame
                </label>
                <input
                  type="text"
                  name="type"
                  value={exam.type || ''}
                  onChange={handleChange}
                  placeholder="Ex: Sangue, Imagem, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data do Exame
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={exam.date?.toString().split('T')[0] || ''}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Laboratório
                </label>
                <input
                  type="text"
                  name="lab"
                  value={exam.lab || ''}
                  onChange={handleChange}
                  placeholder="Nome do laboratório"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Médico Responsável
              </label>
              <input
                type="text"
                name="doctor_name"
                value={exam.doctor_name || ''}
                onChange={handleChange}
                placeholder="Nome do médico"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );
        
      case 1: // Resultados
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={exam.status || 'completed'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="completed">Concluído</option>
                <option value="pending">Pendente</option>
                <option value="cancelled">Cancelado</option>
                <option value="scheduled">Agendado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resultados
              </label>
              <textarea
                name="results"
                value={exam.results || ''}
                onChange={handleChange}
                placeholder="Descreva os resultados do exame"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );
        
      case 2: // Anexos
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anexar Arquivo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Clique para selecionar um arquivo ou arraste aqui
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG, DOC até 10MB
                  </p>
                </label>
              </div>
              
              {selectedFile && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-800">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-auto text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {exam.file_url && !selectedFile && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">Arquivo atual</span>
                  <a
                    href={exam.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-green-600 hover:text-green-800"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        );
        
      case 3: // Revisão
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Revisão dos Dados</h4>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Nome:</span>
                  <p className="text-sm text-gray-900">{exam.name || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Tipo:</span>
                  <p className="text-sm text-gray-900">{exam.type || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Data:</span>
                  <p className="text-sm text-gray-900">
                    {exam.date ? new Date(exam.date).toLocaleDateString('pt-BR') : 'Não informado'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Laboratório:</span>
                  <p className="text-sm text-gray-900">{exam.lab || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Médico:</span>
                  <p className="text-sm text-gray-900">{exam.doctor_name || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <p className="text-sm text-gray-900">{getStatusText(exam.status || 'completed')}</p>
                </div>
              </div>
              
              {exam.results && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Resultados:</span>
                  <p className="text-sm text-gray-900 mt-1">{exam.results}</p>
                </div>
              )}
              
              {(selectedFile || exam.file_url) && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Arquivo:</span>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedFile ? `Novo arquivo: ${selectedFile.name}` : 'Arquivo existente'}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const renderExamForm = (exam: Partial<Exam>, isNew: boolean = false) => {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {isNew ? 'Novo Exame' : 'Editar Exame'}
          </h3>
          <span className="text-sm text-gray-500">
            Etapa {currentStep + 1} de {steps.length}
          </span>
        </div>
        
        {/* Stepper */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={`ml-4 w-8 h-0.5 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStepContent(exam, isNew)}
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0 || isLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </button>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(0);
                setSelectedFile(null);
                if (isNew) {
                  setIsAdding(false);
                } else {
                  setEditingExam(null);
                }
              }}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={isNew ? handleAddExam : handleUpdateExam}
                disabled={isLoading || !exam.name}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isNew ? 'Adicionar Exame' : 'Atualizar Exame'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Exames</h3>
        {!isAdding && !editingExam && (
          <button
            onClick={() => {
              setCurrentStep(0);
              setSelectedFile(null);
              setIsAdding(true);
            }}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Novo Exame
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

      {isAdding && renderExamForm(newExam, true)}
      
      {editingExam && renderExamForm(editingExam)}
      
      {/* Loading State */}
      {isLoading && !isAdding && !editingExam && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Carregando exames...</span>
        </div>
      )}
      
      {!isAdding && !editingExam && !isLoading && (
        <div className="space-y-4">
          {exams && exams.length > 0 ? (
            exams.map((exam) => (
              <div 
                key={exam.id} 
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FlaskConical className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-medium text-gray-900">
                          {exam.name}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                          {getStatusText(exam.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {exam.type && `${exam.type} • `}
                        {new Date(exam.date).toLocaleDateString('pt-BR')}
                        {exam.lab && ` • ${exam.lab}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {exam.file_url && (
                      <a
                        href={exam.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Baixar arquivo"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setCurrentStep(0);
                        setSelectedFile(null);
                        setEditingExam(exam);
                      }}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Editar exame"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Excluir exame"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {exam.results && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Resultados</p>
                    <p className="text-sm text-gray-700">{exam.results}</p>
                  </div>
                )}
                
                {exam.doctor_name && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Médico Responsável</p>
                    <p className="text-sm text-gray-700">Dr. {exam.doctor_name}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-xl border border-gray-200">
              <FlaskConical className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum exame registrado</h3>
              <p className="text-sm text-gray-500 max-w-md">Adicione exames médicos para este paciente.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditExamsTab;
