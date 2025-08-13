import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import Modal from './Modal';
import type { MedicalRecord } from '../../types/medical-record';
import { 
  Edit, 
  CheckCircle, 
  User, 
  Stethoscope, 
  Pill, 
  FileText, 
  FlaskConical
} from 'lucide-react';

// Componentes para cada aba de edição
import EditOverviewTab from '../common/EditMedicalRecordTabs/EditOverviewTab';
import EditConsultationsTab from '../common/EditMedicalRecordTabs/EditConsultationsTab';
import EditMedicationsTab from '../common/EditMedicalRecordTabs/EditMedicationsTab';
import EditExamsTab from '../common/EditMedicalRecordTabs/EditExamsTab';
import EditDocumentsTab from '../common/EditMedicalRecordTabs/EditDocumentsTab';

interface EditMedicalRecordModalProps {
  isOpen: boolean;
  record: MedicalRecord | null;
  onSave: (updatedRecord: MedicalRecord) => void;
  onCancel: () => void;
  loading: boolean;
}

const EditMedicalRecordModal: React.FC<EditMedicalRecordModalProps> = ({ 
  isOpen, 
  record, 
  onSave, 
  onCancel, 
  loading 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState<Partial<MedicalRecord>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    }
  }, [record]);

  const handleSave = () => {
    if (record && isFormValid) {
      onSave({ ...record, ...formData });
    }
  };

  const handleValidationChange = (isValid: boolean) => {
    setIsFormValid(isValid);
  };

  if (!isOpen || !record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Editar Prontuário"
      size="full"
      className="max-h-[90vh]"
    >
      <div className="flex flex-col h-full">
        {/* Cabeçalho com informações do paciente */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Prontuário</h2>
              <p className="text-gray-500">Paciente: {record.patient_name}</p>
            </div>
          </div>
        </div>

        {/* Sistema de abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid grid-cols-5 gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="consultations" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              <span className="hidden sm:inline">Consultas</span>
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Medicamentos</span>
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              <span className="hidden sm:inline">Exames</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documentos</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="overview">
              <EditOverviewTab 
                formData={formData} 
                setFormData={setFormData}
                onValidationChange={handleValidationChange}
              />
            </TabsContent>
            
            <TabsContent value="consultations">
              <EditConsultationsTab 
                formData={formData} 
                setFormData={setFormData} 
              />
            </TabsContent>
            
            <TabsContent value="medications">
              <EditMedicationsTab 
                formData={formData} 
                setFormData={setFormData} 
              />
            </TabsContent>
            
            <TabsContent value="exams">
              <EditExamsTab 
                formData={formData} 
                setFormData={setFormData} 
              />
            </TabsContent>
            
            <TabsContent value="documents">
              <EditDocumentsTab 
                formData={formData} 
                setFormData={setFormData} 
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Botões de ação */}
        <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !isFormValid}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-colors ${
              loading || !isFormValid
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={!isFormValid ? 'Corrija os erros antes de salvar' : ''}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </button>
          {!isFormValid && (
            <p className="text-red-500 text-xs mt-2">
              ⚠️ Corrija os erros nos campos destacados antes de salvar
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EditMedicalRecordModal;
