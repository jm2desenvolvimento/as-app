import React, { useState, useEffect, useCallback } from 'react';
import type { MedicalRecord } from '../../../types/medical-record';

interface ValidationErrors {
  height?: string;
  weight?: string;
  blood_type?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
}

interface EditOverviewTabProps {
  formData: Partial<MedicalRecord>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<MedicalRecord>>>;
  onValidationChange?: (isValid: boolean) => void;
}

const EditOverviewTab: React.FC<EditOverviewTabProps> = ({ formData, setFormData, onValidationChange }) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [allergiesText, setAllergiesText] = useState('');
  const [chronicDiseasesText, setChronicDiseasesText] = useState('');

  // Tipos sanguíneos válidos
  const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Função para validar altura
  const validateHeight = (value: number | string): string | undefined => {
    if (!value) return undefined;
    const num = Number(value);
    if (isNaN(num)) return 'Altura deve ser um número válido';
    if (num < 50) return 'Altura deve ser pelo menos 50cm';
    if (num > 300) return 'Altura não pode exceder 300cm';
    return undefined;
  };

  // Função para validar peso
  const validateWeight = (value: number | string): string | undefined => {
    if (!value) return undefined;
    const num = Number(value);
    if (isNaN(num)) return 'Peso deve ser um número válido';
    if (num < 1) return 'Peso deve ser pelo menos 1kg';
    if (num > 500) return 'Peso não pode exceder 500kg';
    return undefined;
  };

  // Função para validar tipo sanguíneo
  const validateBloodType = (value: string): string | undefined => {
    if (!value) return undefined;
    if (!validBloodTypes.includes(value.toUpperCase())) {
      return 'Tipo sanguíneo deve ser: A+, A-, B+, B-, AB+, AB-, O+, O-';
    }
    return undefined;
  };

  // Função para validar email
  const validateEmail = (value: string): string | undefined => {
    if (!value) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Email deve ter um formato válido';
    if (value.length > 100) return 'Email não pode exceder 100 caracteres';
    return undefined;
  };

  // Função para validar nome
  const validateName = (value: string): string | undefined => {
    if (!value) return 'Nome é obrigatório';
    if (value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (value.length > 200) return 'Nome não pode exceder 200 caracteres';
    return undefined;
  };

  // Função para validar telefone
  const validatePhone = (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length > 20) return 'Telefone não pode exceder 20 caracteres';
    return undefined;
  };

  // Função para atualizar erros e notificar validação
  const updateErrors = useCallback((newErrors: ValidationErrors) => {
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('🔍 [EditOverviewTab] Validação:', { newErrors, isValid });
    onValidationChange?.(isValid);
  }, [onValidationChange]);

  // Função para validar o formulário
  const validateForm = useCallback(() => {
    console.log('🔍 [EditOverviewTab] Validando formulário com dados:', {
      patient_name: formData.patient_name,
      patient_email: formData.patient_email,
      patient_phone: formData.patient_phone
    });
    
    const newErrors: ValidationErrors = {};
    
    // Validar nome (obrigatório)
    const nameError = validateName(formData.patient_name || '');
    if (nameError) newErrors.patient_name = nameError;
    
    // Validar email (opcional)
    const emailError = validateEmail(formData.patient_email || '');
    if (emailError) newErrors.patient_email = emailError;
    
    // Validar telefone (opcional)
    const phoneError = validatePhone(formData.patient_phone || '');
    if (phoneError) newErrors.patient_phone = phoneError;
    
    // Validar altura (opcional)
    const heightError = validateHeight(formData.height || '');
    if (heightError) newErrors.height = heightError;
    
    // Validar peso (opcional)
    const weightError = validateWeight(formData.weight || '');
    if (weightError) newErrors.weight = weightError;
    
    // Validar tipo sanguíneo (opcional)
    const bloodTypeError = validateBloodType(formData.blood_type || '');
    if (bloodTypeError) newErrors.blood_type = bloodTypeError;
    
    updateErrors(newErrors);
  }, [formData.patient_name, formData.patient_email, formData.patient_phone, formData.height, formData.weight, formData.blood_type, updateErrors]);

  // Sincronizar estados de texto com formData quando formData mudar
  useEffect(() => {
    setAllergiesText(formData.allergies?.join(', ') || '');
    setChronicDiseasesText(formData.chronic_diseases?.join(', ') || '');
  }, [formData.allergies, formData.chronic_diseases]);

  // Validar formulário quando formData for carregado
  useEffect(() => {
    if (formData.patient_name) {
      console.log('🔍 [EditOverviewTab] Validando formulário inicial...');
      validateForm();
    }
  }, [formData.patient_name, validateForm]);

  // ✅ NOVO: Monitorar quando formData é carregado para debug
  useEffect(() => {
    console.log('🔍 [EditOverviewTab] FormData recebido:', {
      patient_name: formData.patient_name,
      patient_email: formData.patient_email,
      patient_phone: formData.patient_phone,
      formData_keys: Object.keys(formData)
    });
  }, [formData]);

  // Handler para processar alergias quando sair do campo
  const handleAllergiesBlur = () => {
    const allergiesArray = allergiesText
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    setFormData(prev => ({ ...prev, allergies: allergiesArray }));
  };

  // Handler para processar doenças crônicas quando sair do campo
  const handleChronicDiseasesBlur = () => {
    const diseasesArray = chronicDiseasesText
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    setFormData(prev => ({ ...prev, chronic_diseases: diseasesArray }));
  };

  // Validar todos os campos quando formData mudar
  useEffect(() => {
    const newErrors: ValidationErrors = {};
    
    const heightError = validateHeight(formData.height || '');
    if (heightError) newErrors.height = heightError;
    
    const weightError = validateWeight(formData.weight || '');
    if (weightError) newErrors.weight = weightError;
    
    const bloodTypeError = validateBloodType(formData.blood_type || '');
    if (bloodTypeError) newErrors.blood_type = bloodTypeError;
    
    const nameError = validateName(formData.patient_name || '');
    if (nameError) newErrors.patient_name = nameError;
    
    const emailError = validateEmail(formData.patient_email || '');
    if (emailError) newErrors.patient_email = emailError;
    
    const phoneError = validatePhone(formData.patient_phone || '');
    if (phoneError) newErrors.patient_phone = phoneError;
    
    updateErrors(newErrors);
  }, [formData, onValidationChange]);

  // Função para obter classes CSS do input baseado no erro
  const getInputClasses = (hasError: boolean) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md focus:ring-2 focus:outline-none';
    if (hasError) {
      return `${baseClasses} border-red-500 focus:ring-red-500 focus:border-red-500`;
    }
    return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
  };
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Visão Geral</h3>
        <p className="text-sm text-gray-500 mt-1">Dados básicos do paciente (nome, endereço, etc.) - use "Salvar Dados do Paciente" para salvar</p>
      </div>
      {/* Dados Pessoais */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.patient_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
              className={getInputClasses(!!errors.patient_name)}
              placeholder="Nome completo do paciente"
            />
            {errors.patient_name && (
              <p className="text-red-500 text-xs mt-1">{errors.patient_name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.patient_email || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, patient_email: e.target.value }))}
              className={getInputClasses(!!errors.patient_email)}
              placeholder="Digite o email do paciente"
            />
            {errors.patient_email && (
              <p className="text-red-500 text-xs mt-1">{errors.patient_email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.patient_phone || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, patient_phone: e.target.value }))}
              className={getInputClasses(!!errors.patient_phone)}
              placeholder="(11) 99999-9999"
            />
            {errors.patient_phone && (
              <p className="text-red-500 text-xs mt-1">{errors.patient_phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            <input
              type="text"
              value={formData.patient_address || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, patient_address: e.target.value }))}
              className={getInputClasses(false)}
              placeholder="Endereço completo"
            />
          </div>
        </div>
      </div>

      {/* Informações Médicas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Médicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo Sanguíneo
            </label>
            <select
              value={formData.blood_type || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, blood_type: e.target.value }))}
              className={getInputClasses(!!errors.blood_type)}
            >
              <option value="">Selecione...</option>
              {validBloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.blood_type && (
              <p className="text-red-500 text-xs mt-1">{errors.blood_type}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Altura (cm)
            </label>
            <input
              type="number"
              min="50"
              max="300"
              value={formData.height || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, height: Number(e.target.value) || undefined }))}
              className={getInputClasses(!!errors.height)}
              placeholder="175"
            />
            {errors.height && (
              <p className="text-red-500 text-xs mt-1">{errors.height}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Entre 50 e 300 cm</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Peso (kg)
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={formData.weight || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) || undefined }))}
              className={getInputClasses(!!errors.weight)}
              placeholder="70"
            />
            {errors.weight && (
              <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Entre 1 e 500 kg</p>
          </div>
        </div>
      </div>

      {/* Alergias */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alergias</h3>
        <textarea
          value={allergiesText}
          onChange={(e) => setAllergiesText(e.target.value)}
          onBlur={handleAllergiesBlur}
          placeholder="Digite as alergias separadas por vírgula..."
          className={getInputClasses(false)}
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Separe cada alergia por vírgula (ex: Penicilina, Látex, Amendoim)
        </p>
        <p className="text-xs text-blue-600 mt-1">
          ℹ️ As alergias serão processadas quando você sair do campo
        </p>
      </div>

      {/* Doenças Crônicas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doenças Crônicas</h3>
        <textarea
          value={chronicDiseasesText}
          onChange={(e) => setChronicDiseasesText(e.target.value)}
          onBlur={handleChronicDiseasesBlur}
          placeholder="Digite as doenças crônicas separadas por vírgula..."
          className={getInputClasses(false)}
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Separe cada doença por vírgula (ex: Hipertensão, Diabetes, Asma)
        </p>
        <p className="text-xs text-blue-600 mt-1">
          ℹ️ As doenças serão processadas quando você sair do campo
        </p>
      </div>

      {/* Resumo de Saúde */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Saúde</h3>
        <textarea
          value={formData.health_summary || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, health_summary: e.target.value }))}
          placeholder="Digite um resumo sobre a saúde do paciente..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={5}
        />
      </div>
    </div>
  );
};

export default EditOverviewTab;
