import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePermission } from '../../hooks/usePermission';
// import { PERMISSIONS } from '../../hooks/usePermission'; // Removido pois não está sendo usado
import { useAuthStore } from '../../store/authStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Pill, 
  TestTube, 
  Download, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Clock, 
  Heart, 
  // Thermometer, 
  Activity, 
  // Star, 
  // Image, 
  // File,
  ChevronRight,
  Printer,
  Stethoscope,
  RulerIcon,
  WeightIcon,
  AlertTriangle,
  ArrowLeft,
  Search,
  CheckCircle,
  Shield,
  Info,
  Activity as ActivityIcon,
  AlertCircle
} from 'lucide-react';

// Importar tipos centralizados
import type { 
  MedicalRecord as MedicalRecordType, 
  Consultation, 
  Medication, 
  Exam, 
  Document 
} from '../../types/medical-record';

interface Patient {
  id: string; // ✅ profile.id (usado como patient_id)
  userId?: string; // 💾 user.id (referência opcional)
  name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email: string;
  address: string;
  ubs_name?: string;
  doctor_name?: string;
}

// Componente principal
const MedicalRecord: React.FC = () => {
  const { user, hasRole, isPatient, isDoctor, isAdmin, isMaster } = usePermission();
  const { user: authUser, token } = useAuthStore();
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecordType | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Estados para edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecordType | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Debug: Log dos estados de edição
  console.log('Estados de edição:', { isEditModalOpen, editingRecord: editingRecord?.patient_name, editLoading });

  // Determinar contexto baseado no role (removido pois não é mais necessário)
  // const context = {
  //   role: user?.role,
  //   permissions: {
  //     canView: hasPermission(PERMISSIONS.MEDICAL_RECORD_VIEW),
  //     canEdit: hasPermission(PERMISSIONS.MEDICAL_RECORD_UPDATE),
  //     canCreate: hasPermission(PERMISSIONS.MEDICAL_RECORD_CREATE),
  //     canDelete: hasPermission(PERMISSIONS.MEDICAL_RECORD_DELETE),
  //     canList: hasPermission(PERMISSIONS.MEDICAL_RECORD_LIST)
  //   }
  // };

  // Debug: Log das permissões
          // console.log('Permissões do usuário:', context.permissions);

  // Determinar qual paciente visualizar
  const targetPatientId = hasRole('PATIENT') ? user?.id : patientId;

  useEffect(() => {
    if (targetPatientId) {
      fetchMedicalRecord(targetPatientId);
    } else if (hasRole('DOCTOR') || hasRole('ADMIN') || hasRole('MASTER')) {
      fetchPatients();
    }
  }, [targetPatientId, user?.role]);

  const fetchMedicalRecord = async (patientId: string) => {
    try {
      setLoading(true);
      
      // Log detalhado para diagnóstico
      console.log('=== INICIANDO FETCH DE PRONTUÁRIO MÉDICO ===');
      console.log('Patient ID recebido:', patientId);
      console.log('Token disponível:', !!token);
      console.log('AuthUser disponível:', !!authUser);
      
      // Tentar buscar dados reais da API primeiro
      try {
        if (!token) {
          console.error('❌ Erro: Token não encontrado');
          throw new Error('Token de autenticação não encontrado');
        }

        // Garantir que estamos usando o ID correto (profile.id)
        console.log('🔍 Buscando prontuário existente para paciente:', patientId);
        console.log('URL da API:', `${import.meta.env.VITE_API_URL}/medical-records/patient/${patientId}`);
        console.log('Headers:', { Authorization: `Bearer ${token?.substring(0, 20)}...` });
        
        let response = await fetch(`${import.meta.env.VITE_API_URL}/medical-records/patient/${patientId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Resposta da busca:', {
          status: response.status,
          statusText: response.statusText
        });

        // Se não encontrou prontuário (404), criar automaticamente
        if (response.status === 404) {
          console.log('📝 Prontuário não encontrado. Criando automaticamente...');
          
          const createResponse = await fetch(`${import.meta.env.VITE_API_URL}/medical-records/patient/${patientId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('Resposta da criação:', {
            status: createResponse.status,
            statusText: createResponse.statusText
          });

          if (!createResponse.ok) {
            console.error(`❌ Erro ao criar prontuário: ${createResponse.status} - ${createResponse.statusText}`);
            throw new Error(`Erro ao criar prontuário: ${createResponse.status}`);
          }

          response = createResponse;
          console.log('✅ Prontuário criado com sucesso!');
        } else if (!response.ok) {
          console.error(`❌ Erro na API: ${response.status} - ${response.statusText}`);
          throw new Error(`Erro na API: ${response.status}`);
        }

        const apiRecord = await response.json();
        console.log('✅ Prontuário carregado com sucesso da API:', apiRecord);
        console.log('🔍 DEBUG - Campos disponíveis:', Object.keys(apiRecord));
        console.log('🔍 DEBUG - Patient data:', apiRecord.patient);
        console.log('🔍 DEBUG - Patient user data:', apiRecord.patient?.user);
        console.log('🔍 DEBUG - Patient profile emails:', apiRecord.patient?.profile_emails);
        console.log('🔍 DEBUG - Patient user_id:', apiRecord.patient?.user_id);
        console.log('🔍 DEBUG - Email mapping debug:', {
          userEmail: apiRecord.patient?.user?.email,
          profileEmails: apiRecord.patient?.profile_emails,
          firstProfileEmail: apiRecord.patient?.profile_emails?.[0]?.email,
          user_id: apiRecord.patient?.user_id,
          finalEmail: apiRecord.patient?.user?.email || 
                     apiRecord.patient?.profile_emails?.[0]?.email || 
                     (apiRecord.patient?.user_id ? 'Email não encontrado' : ''),
          patientObject: apiRecord.patient,
          patientUserObject: apiRecord.patient?.user
        });
        console.log('🔍 DEBUG - Consultas:', apiRecord.consultations);
        console.log('🔍 DEBUG - Medicamentos:', apiRecord.medications);
        console.log('🔍 DEBUG - Exames:', apiRecord.exams);
        console.log('🔍 DEBUG - Exames detalhado:', apiRecord.exams?.map((exam: any) => ({
          id: exam.id,
          name: exam.name,
          lab: exam.lab,
          results: exam.results,
          doctor_name: exam.doctor_name,
          status: exam.status
        })));
        console.log('🔍 DEBUG - Documentos:', apiRecord.documents);
        
        // Transformar dados da API para o formato esperado pelo frontend
        const transformedRecord: MedicalRecordType = {
          id: apiRecord.id,
          patient_id: patientId,
          patient_name: apiRecord.patient?.name || 'Nome não informado',
          patient_cpf: apiRecord.patient?.user?.cpf || 'CPF não informado',
          patient_birth_date: apiRecord.patient?.birth_date ? 
            new Date(apiRecord.patient.birth_date).toISOString().split('T')[0] : '',
          patient_phone: apiRecord.patient?.profile_phones?.[0]?.phone || 'Telefone não informado',
          patient_email: apiRecord.patient?.user?.email || 
                         apiRecord.patient?.profile_emails?.[0]?.email || 
                         (apiRecord.patient?.user_id ? 'Email não encontrado' : ''),
          patient_address: apiRecord.patient?.profile_addresses?.[0] ? 
            `${apiRecord.patient.profile_addresses[0].address}, ${apiRecord.patient.profile_addresses[0].number || ''} - ${apiRecord.patient.profile_addresses[0].district || ''} - ${apiRecord.patient.profile_addresses[0].city}/${apiRecord.patient.profile_addresses[0].state}` : 'Endereço não informado',
          blood_type: apiRecord.blood_type || 'Não informado',
          height: apiRecord.height || 0,
          weight: apiRecord.weight || 0,
          allergies: apiRecord.allergies || [],
          chronic_diseases: apiRecord.chronic_diseases || [],

          // ✅ CORRIGIDO: Mapear medications do campo correto retornado pela API
          medications: apiRecord.medications?.map((medication: any) => ({
            id: medication.id || `med_${Date.now()}_${Math.random()}`,
            name: medication.name || 'Medicamento não informado',
            dosage: medication.dosage || 'Dosagem não informada',
            frequency: medication.frequency || 'Frequência não informada',
            start_date: medication.start_date ? new Date(medication.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            end_date: medication.end_date ? new Date(medication.end_date).toISOString().split('T')[0] : undefined,
            prescribed_by: medication.doctor_name || medication.doctor?.profile?.name || 'Médico não informado',
            status: medication.status || 'active',
            instructions: medication.instructions || 'Sem instruções'
          })) || [],
          // ✅ CORRIGIDO: Mapear consultations do campo correto retornado pela API
          consultations: apiRecord.consultations?.map((consultation: any) => ({
            id: consultation.id || `cons_${Date.now()}_${Math.random()}`,
            date: consultation.date ? new Date(consultation.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            doctor_name: consultation.doctor_name || consultation.doctor?.profile?.name || 'Médico não informado',
            specialty: consultation.specialty || 'Especialidade não informada',
            reason: consultation.reason || 'Motivo não informado',
            diagnosis: consultation.diagnosis || 'Diagnóstico não informado',
            prescription: consultation.prescription || 'Prescrição não informada',
            notes: consultation.notes || 'Sem observações',
            status: consultation.status || 'completed'
          })) || [],
          // ✅ CORRIGIDO: Mapear exams do campo correto retornado pela API
          exams: apiRecord.exams?.map((exam: any) => ({
            id: exam.id || `exam_${Date.now()}_${Math.random()}`,
            name: exam.name || 'Exame não informado',
            date: exam.date ? new Date(exam.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            type: exam.type || 'Tipo não informado',
            lab: exam.lab || 'Laboratório não informado',
            laboratory: exam.lab || 'Laboratório não informado', // ✅ Mantido para compatibilidade com interface
            results: exam.results || 'Resultado não informado',  // ✅ Campo principal para resultados
            doctor_name: exam.doctor_name || exam.doctor?.profile?.name || 'Médico não informado',
            file_url: exam.file_url || undefined,
            status: exam.status || 'completed'
          })) || [],
          // ✅ CORRIGIDO: Mapear documents do campo correto retornado pela API
          documents: apiRecord.documents?.map((doc: any) => ({
            id: doc.id || `doc_${Date.now()}_${Math.random()}`,
            name: doc.name || 'Documento não informado',
            type: doc.type || 'document',
            date: doc.date ? new Date(doc.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: doc.description || 'Sem descrição',
            file_url: doc.file_url || '#', // ✅ CORRIGIDO: Usar apenas file_url
            size: doc.size || 'Tamanho não informado',
            added_by: doc.added_by || doc.uploaded_by || 'Usuário não informado'
          })) || [],
          created_at: apiRecord.created_at ? new Date(apiRecord.created_at).toISOString().split('T')[0] : '',
          updated_at: apiRecord.updated_at ? new Date(apiRecord.updated_at).toISOString().split('T')[0] : ''
        };

        console.log('🔍 DEBUG - Dados transformados dos exames:', transformedRecord.exams);
        console.log('🔍 DEBUG - Email mapeado:', {
          fromUser: apiRecord.patient?.user?.email,
          fromProfileEmails: apiRecord.patient?.profile_emails?.[0]?.email,
          final: transformedRecord.patient_email
        });
        setMedicalRecord(transformedRecord);
        
      } catch (apiError) {
        console.warn('Falha ao buscar prontuário da API, usando dados mockados:', apiError);
        
        // Fallback para dados mockados
        const mockRecord: MedicalRecordType = {
          id: '1',
          patient_id: patientId,
          patient_name: 'Maria Silva Santos',
          patient_cpf: '123.456.789-00',
          patient_birth_date: '1985-03-15',
          patient_phone: '(11) 99999-9999',
          patient_email: 'maria.silva@email.com',
          patient_address: 'Rua das Flores, 123 - São Paulo/SP',
          blood_type: 'O+',
          height: 165,
          weight: 68,
          allergies: ['Penicilina', 'Dipirona'],
          chronic_diseases: ['Hipertensão', 'Diabetes tipo 2'],

          medications: [
            {
              id: '1',
              name: 'Losartana 50mg',
              dosage: '1 comprimido',
              frequency: '1x ao dia',
              start_date: '2024-01-15',
              prescribed_by: 'Dr. João Silva',
              status: 'active'
            },
            {
              id: '2',
              name: 'Metformina 500mg',
              dosage: '1 comprimido',
              frequency: '2x ao dia',
              start_date: '2024-02-01',
              prescribed_by: 'Dr. Ana Costa',
              status: 'active'
            }
          ],
          consultations: [
            {
              id: '1',
              date: '2024-03-15',
              doctor_name: 'Dr. João Silva',
              specialty: 'Clínico Geral',
              reason: 'Hipertensão controlada',
              diagnosis: 'Hipertensão arterial controlada',
              prescription: 'Continuar Losartana',
              notes: 'Paciente apresentou melhora significativa',
              status: 'completed'
            },
            {
              id: '2',
              date: '2024-04-20',
              doctor_name: 'Dr. Ana Costa',
              specialty: 'Endocrinologia',
              reason: 'Diabetes tipo 2',
              diagnosis: 'Diabetes mellitus tipo 2',
              prescription: 'Iniciar Metformina',
              notes: 'Primeira consulta endocrinológica',
              status: 'completed'
            }
          ],
          exams: [
            {
              id: '1',
              name: 'Hemograma Completo',
              date: '2024-03-10',
              type: 'Hemograma',
              lab: 'Laboratório Central',
              laboratory: 'Laboratório Central', // ✅ Mantido para compatibilidade
              results: 'Normal',                 // ✅ Campo principal
              doctor_name: 'Dr. João Silva',
              status: 'completed'
            },
            {
              id: '2',
              name: 'Glicemia em Jejum',
              date: '2024-04-15',
              type: 'Glicemia',
              lab: 'Laboratório Central',
              laboratory: 'Laboratório Central', // ✅ Mantido para compatibilidade
              results: '120 mg/dL',              // ✅ Campo principal
              doctor_name: 'Dr. João Silva',
              status: 'completed'
            }
          ],
          documents: [
            {
              id: '1',
              name: 'Prescrição - Dr. João Silva',
              type: 'prescription',
              date: '2024-03-15',
              description: 'Prescrição médica',
              file_url: '#',
              size: '245 KB',
              added_by: 'Dr. João Silva'
            },
            {
              id: '2',
              name: 'Resultado Hemograma',
              type: 'exam_result',
              date: '2024-03-10',
              description: 'Resultado do exame de hemograma',
              file_url: '#',
              size: '1.2 MB',
              added_by: 'Laboratório Central'
            }
          ],
          created_at: '2024-01-15',
          updated_at: '2024-04-20'
        };

        setMedicalRecord(mockRecord);
      }
    } catch (error) {
      console.error('Erro ao buscar prontuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // Debug: Log inicial
      console.log('=== INICIANDO FETCH DE PACIENTES ===');
      console.log('Token disponível:', !!token);
      console.log('AuthUser disponível:', !!authUser);
      console.log('User role:', user?.role);
      console.log('AuthUser completo:', authUser);
      
      // Tentar buscar dados reais da API primeiro
      try {
        if (!token || !authUser) {
          console.error('❌ Erro: Token ou dados do usuário não encontrados');
          console.log('Token:', token ? 'PRESENTE' : 'AUSENTE');
          console.log('AuthUser:', authUser ? 'PRESENTE' : 'AUSENTE');
          throw new Error('Token ou dados do usuário não encontrados');
        }

        // ✅ USAR ENDPOINT ÚNICO: O backend já filtra automaticamente baseado no usuário logado
        const apiUrl = `${import.meta.env.VITE_API_URL}/patients`;
        console.log('🏥 Usando endpoint único /patients - o backend filtra automaticamente por território');

        console.log('📡 URL da API:', apiUrl);
        console.log('🔑 Token (primeiros 20 chars):', token?.substring(0, 20) + '...');
        console.log('👤 User ID:', authUser.id);
        console.log('🏥 Health Unit ID:', authUser.health_unit_id);
        console.log('🔍 O backend filtrará automaticamente os pacientes baseado no território do usuário logado');
        
        const requestHeaders = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        
        console.log('📋 Headers da requisição:', requestHeaders);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: requestHeaders,
        });

        console.log('📥 Resposta recebida:');
        console.log('Status:', response.status);
        console.log('StatusText:', response.statusText);
        console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          console.error('❌ Erro na resposta da API:');
          console.error('Status:', response.status);
          console.error('StatusText:', response.statusText);
          
          // Tentar ler o corpo da resposta para mais detalhes
          try {
            const errorText = await response.text();
            console.error('Corpo da resposta de erro:', errorText);
          } catch (e) {
            console.error('Não foi possível ler o corpo da resposta de erro:', e);
          }
          
          throw new Error(`Erro na API: ${response.status}`);
        }

        const apiPatients = await response.json();
        
        // Transformar dados da API para o formato esperado pelo frontend
        // 🔄 PADRONIZAÇÃO: Usar profile.id para consistência com schema do banco
        const transformedPatients: Patient[] = apiPatients.map((patient: any) => ({
          id: patient.profile?.id || patient.id, // ✅ Usar profile.id (patient_id na tabela medical_record)
          userId: patient.id, // 💾 Manter referência ao user.id se necessário
          name: patient.profile?.name || 'Nome não informado',
          cpf: patient.cpf || 'CPF não informado',
          birth_date: patient.profile?.birth_date ? new Date(patient.profile.birth_date).toISOString().split('T')[0] : '',
          phone: patient.profile?.profile_phones?.[0]?.phone || 'Telefone não informado',
          email: patient.email || 'Email não informado',
          address: patient.profile?.profile_addresses?.[0] ? 
            `${patient.profile.profile_addresses[0].address}, ${patient.profile.profile_addresses[0].number} - ${patient.profile.profile_addresses[0].city}/${patient.profile.profile_addresses[0].state}` : 
            'Endereço não informado',
          ubs_name: 'UBS não informada', // ✅ Removido campo inexistente
          doctor_name: authUser.profile?.name || 'Médico não informado'
        }));

        setPatients(transformedPatients);
        console.log('Pacientes carregados da API:', transformedPatients);
        
      } catch (apiError) {
        console.warn('Falha ao buscar dados da API, usando dados mockados:', apiError);
        
        // Fallback para dados mockados
        let mockPatients: Patient[] = [
          {
            id: '1',
            name: 'Maria Silva Santos',
            cpf: '123.456.789-00',
            birth_date: '1985-03-15',
            phone: '(11) 99999-9999',
            email: 'maria.silva@email.com',
            address: 'Rua das Flores, 123 - São Paulo/SP',
            ubs_name: 'UBS Jardim das Flores',
            doctor_name: 'Dr. João Silva'
          },
          {
            id: '2',
            name: 'João Pedro Oliveira',
            cpf: '987.654.321-00',
            birth_date: '1978-07-22',
            phone: '(11) 88888-8888',
            email: 'joao.oliveira@email.com',
            address: 'Av. Paulista, 456 - São Paulo/SP',
            ubs_name: 'UBS Jardim das Flores',
            doctor_name: 'Dr. Ana Costa'
          },
          {
            id: '3',
            name: 'Ana Paula Ferreira',
            cpf: '456.789.123-00',
            birth_date: '1990-11-08',
            phone: '(11) 77777-7777',
            email: 'ana.ferreira@email.com',
            address: 'Rua Augusta, 789 - São Paulo/SP',
            ubs_name: 'UBS Jardim das Flores',
            doctor_name: 'Dr. João Silva'
          },
          {
            id: '4',
            name: 'Carlos Eduardo Lima',
            cpf: '789.123.456-00',
            birth_date: '1965-09-12',
            phone: '(11) 66666-6666',
            email: 'carlos.lima@email.com',
            address: 'Rua das Palmeiras, 321 - São Paulo/SP',
            ubs_name: 'UBS Centro',
            doctor_name: 'Dr. João Silva'
          },
          {
            id: '5',
            name: 'Fernanda Costa Silva',
            cpf: '321.654.987-00',
            birth_date: '1988-12-03',
            phone: '(11) 55555-5555',
            email: 'fernanda.costa@email.com',
            address: 'Av. Brigadeiro, 654 - São Paulo/SP',
            ubs_name: 'UBS Centro',
            doctor_name: 'Dr. Ana Costa'
          }
        ];

        // Se for médico, filtrar apenas pacientes das UBS onde ele está atrelado
        if (isDoctor()) {
          const doctorUBS = ['UBS Jardim das Flores', 'UBS Centro'];
          mockPatients = mockPatients.filter(patient => 
            doctorUBS.includes(patient.ubs_name || '')
          );
        }

        setPatients(mockPatients);
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funções para edição
  const handleEditRecord = (record: MedicalRecordType) => {
    console.log('handleEditRecord chamado com:', record);
    console.log('Abrindo modal de edição...');
    setEditingRecord({ ...record });
    setIsEditModalOpen(true);
    console.log('Modal aberto, editingRecord:', { ...record });
  };

  const handleSaveEdit = async (updatedRecord: MedicalRecordType) => {
    console.log('handleSaveEdit chamado com updatedRecord:', updatedRecord);
    if (!updatedRecord || !updatedRecord.id) return;
    
    try {
      setEditLoading(true);
      
      // Fazer requisição real para o backend
      const response = await axios.put(`medical-records/${updatedRecord.id}`, {
        patient_name: updatedRecord.patient_name || '',
        patient_email: updatedRecord.patient_email || '',
        patient_phone: updatedRecord.patient_phone || '',
        patient_address: updatedRecord.patient_address || '',
        allergies: updatedRecord.allergies || [],
        chronic_diseases: updatedRecord.chronic_diseases || [],
        // Campos adicionais de dados médicos - altura em cm
        height: updatedRecord.height || 0,
        weight: updatedRecord.weight || 0,
        blood_type: updatedRecord.blood_type || ''
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const updatedMedicalRecord = response.data;
      
      // Merge inteligente: preservar relações existentes se não vieram na resposta
      setMedicalRecord(prev => ({
        ...prev,
        ...updatedMedicalRecord,
        // Preservar arrays existentes se não vieram na resposta do backend
        medications: updatedMedicalRecord.medications || prev?.medications || [],
        exams: updatedMedicalRecord.exams || prev?.exams || [],
        documents: updatedMedicalRecord.documents || prev?.documents || [],
        consultations: updatedMedicalRecord.consultations || prev?.consultations || []
      }));
      
      // Fechar modal
      setIsEditModalOpen(false);
      setEditingRecord(null);
      
      // Feedback visual
      console.log('Prontuário atualizado com sucesso!');
      
    } catch (error: any) {
      console.error('Erro ao salvar prontuário:', error);
      console.error('Detalhes do erro:', error.response?.data);
      console.error('Status do erro:', error.response?.status);
      console.error('Mensagem do backend:', error.response?.data?.message);
      console.error('Payload enviado:', {
        patient_name: updatedRecord.patient_name || '',
        patient_email: updatedRecord.patient_email || '',
        patient_phone: updatedRecord.patient_phone || '',
        patient_address: updatedRecord.patient_address || '',
        allergies: updatedRecord.allergies || [],
        chronic_diseases: updatedRecord.chronic_diseases || [],
        height: updatedRecord.height || 0,
        weight: updatedRecord.weight || 0,
        blood_type: updatedRecord.blood_type || ''
      });
      
      // Mostrar mensagem de erro específica se disponível
      const errorMessage = error.response?.data?.message || 'Erro ao salvar prontuário. Tente novamente.';
      alert(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  // Função para selecionar um paciente e navegar para seu prontuário
  const handlePatientSelect = (patient: Patient) => {
    console.log('Selecionando paciente:', patient);
    console.log('🔍 ID do paciente (profile.id):', patient.id);
    console.log('📋 ID do usuário (user.id):', patient.userId);
    console.log('👤 Role do usuário:', user?.role);
    
    // ✅ PADRONIZADO: Usar profile.id (já está correto após padronização)
    const patientProfileId = patient.id; // Agora é profile.id
    console.log('✅ ID do perfil que será usado na busca:', patientProfileId);
    
    // Navegar para o prontuário específico baseado no role
    if (isPatient()) {
      navigate(`/patient/medical-record/${patientProfileId}`);
    } else if (isDoctor()) {
      navigate(`/doctor/medical-record/${patientProfileId}`);
    } else if (isMaster()) {
      // Verificar explicitamente se é MASTER antes de ADMIN
      navigate(`/master/medical-record/${patientProfileId}`);
    } else if (isAdmin()) {
      navigate(`/admin/medical-record/${patientProfileId}`);
    }
  };

  // Função para voltar para a lista de prontuários baseada no role
  const handleBackToList = () => {
    // Limpar o estado do prontuário médico antes de navegar
    setMedicalRecord(null);
    
    if (isPatient()) {
      navigate('/patient/medical-record');
    } else if (isDoctor()) {
      navigate('/doctor/medical-record');
    } else if (isMaster()) {
      // Verificar explicitamente se é MASTER antes de ADMIN
      navigate('/master/medical-record');
    } else if (isAdmin()) {
      navigate('/admin/medical-record');
    }
  };

  const handleDeleteRecord = async (patientId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este prontuário? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Mock: Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remover da lista local
      setPatients(prev => prev.filter(p => p.id !== patientId));
      
      // Se estava visualizando o prontuário excluído, voltar para a lista
      if (medicalRecord?.patient_id === patientId) {
        setMedicalRecord(null);
        handleBackToList();
      }
      
      console.log('Prontuário excluído com sucesso!');
      
    } catch (error) {
      console.error('Erro ao excluir prontuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar interface baseada no role
  if (isPatient()) {
    return <PatientMedicalRecord medicalRecord={medicalRecord} loading={loading} />;
  } else if (isDoctor()) {
    return <DoctorMedicalRecord 
      patients={patients} 
      medicalRecord={medicalRecord} 
      loading={loading} 
      onPatientSelect={handlePatientSelect}
      onEditRecord={handleEditRecord}
      onDeleteRecord={handleDeleteRecord}
      onBackToList={handleBackToList}
      isEditModalOpen={isEditModalOpen}
      editingRecord={editingRecord}
      onSaveEdit={handleSaveEdit}
      onCancelEdit={handleCancelEdit}
      editLoading={editLoading}
    />;
  } else if (isMaster()) {
    // Renderização específica para MASTER
    return <AdminMedicalRecord 
      patients={patients} 
      medicalRecord={medicalRecord} 
      loading={loading} 
      onPatientSelect={handlePatientSelect}
      onBackToList={handleBackToList}
    />;
  } else if (isAdmin()) {
    // Renderização específica para ADMIN
    return <AdminMedicalRecord 
      patients={patients} 
      medicalRecord={medicalRecord} 
      loading={loading} 
      onPatientSelect={handlePatientSelect}
      onBackToList={handleBackToList}
    />;
  }

  return <Unauthorized />;
};

// Interface para PATIENT
const PatientMedicalRecord: React.FC<{ 
  medicalRecord: MedicalRecordType | null;
  loading: boolean;
}> = ({ medicalRecord, loading }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!medicalRecord) {
    return <div className="p-6 text-center text-gray-500">Nenhum prontuário encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center text-xs md:text-sm text-gray-500 mb-2">
        <span className="hover:text-blue-600 cursor-pointer">Agenda Saúde</span>
        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1" />
        <span className="hover:text-blue-600 cursor-pointer">Prontuários</span>
        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1" />
        <span className="text-blue-600 font-medium truncate max-w-[150px] sm:max-w-xs">{medicalRecord.patient_name}</span>
      </div>

      {/* Header com informações do paciente */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 md:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="h-12 w-12 md:h-16 md:w-16 bg-white rounded-full flex items-center justify-center">
                <User className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold truncate max-w-[200px] sm:max-w-md">{medicalRecord.patient_name}</h1>
                <div className="flex flex-wrap items-center mt-1">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  <span className="text-xs md:text-sm">
                    {medicalRecord.patient_birth_date ? new Date(medicalRecord.patient_birth_date).toLocaleDateString('pt-BR') : 'Data não informada'} 
                    {medicalRecord.patient_birth_date ? `(${new Date().getFullYear() - new Date(medicalRecord.patient_birth_date).getFullYear()} anos)` : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 md:space-x-3">
              <button className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-blue-700 bg-opacity-30 rounded-lg hover:bg-opacity-40 transition-colors flex items-center">
                <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
                <span className="sm:hidden">PDF</span>
              </button>
              <button className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-blue-700 bg-opacity-30 rounded-lg hover:bg-opacity-40 transition-colors flex items-center">
                <Printer className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Imprimir</span>
                <span className="sm:hidden">Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Informações essenciais do paciente */}
        {/* Cards de Informações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
        {/* Card de Informações de Contato */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex items-center mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg mr-2 md:mr-3">
              <Phone className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Informações de Contato</h3>
          </div>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-start">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5 md:mt-1 mr-2 md:mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Telefone</p>
                <p className="font-medium text-sm md:text-base">{medicalRecord.patient_phone || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5 md:mt-1 mr-2 md:mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Email</p>
                <p className="font-medium text-sm md:text-base">{medicalRecord.patient_email || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 md:mt-1 mr-2 md:mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Endereço</p>
                <p className="font-medium text-sm md:text-base">{medicalRecord.patient_address || 'Não informado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Informações Médicas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex items-center mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-green-100 rounded-lg mr-2 md:mr-3">
              <Stethoscope className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Informações Médicas</h3>
          </div>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-start">
              <Heart className="w-4 h-4 text-gray-400 mt-0.5 md:mt-1 mr-2 md:mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Tipo Sanguíneo</p>
                <p className="font-medium text-sm md:text-base">{medicalRecord.blood_type || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <RulerIcon className="w-4 h-4 text-gray-400 mt-0.5 md:mt-1 mr-2 md:mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Altura</p>
                <p className="font-medium text-sm md:text-base">{medicalRecord.height ? `${medicalRecord.height} cm` : 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <WeightIcon className="w-4 h-4 text-gray-400 mt-0.5 md:mt-1 mr-2 md:mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Peso</p>
                <p className="font-medium text-sm md:text-base">{medicalRecord.weight ? `${medicalRecord.weight} kg` : 'Não informado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Alertas de Saúde */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-red-100 rounded-lg mr-2 md:mr-3">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Alertas de Saúde</h3>
          </div>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 md:mt-1 mr-2 md:mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Alergias</p>
                <p className="font-medium text-sm md:text-base truncate">
                  {medicalRecord.allergies && medicalRecord.allergies.length > 0 
                    ? medicalRecord.allergies.join(', ')
                    : 'Nenhuma alergia registrada'}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Activity className="w-4 h-4 text-yellow-500 mt-0.5 md:mt-1 mr-2 md:mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">Doenças Crônicas</p>
                <p className="font-medium text-sm md:text-base truncate">
                  {medicalRecord.chronic_diseases && medicalRecord.chronic_diseases.length > 0 
                    ? medicalRecord.chronic_diseases.join(', ')
                    : 'Nenhuma doença crônica registrada'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Tabs de conteúdo */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mt-6">
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Eye, count: null },
              { id: 'consultations', label: 'Consultas', icon: Calendar, count: medicalRecord.consultations?.length || 0 },
              { id: 'medications', label: 'Medicamentos', icon: Pill, count: medicalRecord.medications?.length || 0 },
              { id: 'exams', label: 'Exames', icon: TestTube, count: medicalRecord.exams?.length || 0 },
              { id: 'documents', label: 'Documentos', icon: FileText, count: medicalRecord.documents?.length || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-6 font-medium text-sm flex items-center transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <tab.icon className={`w-5 h-5 mr-2 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-500'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 md:p-8">
          <div className="animate-fadeIn">
            {activeTab === 'overview' && <OverviewTab medicalRecord={medicalRecord} />}
            {activeTab === 'consultations' && <ConsultationsTab consultations={medicalRecord.consultations || []} />}
            {activeTab === 'medications' && <MedicationsTab medications={medicalRecord.medications || []} />}
            {activeTab === 'exams' && <ExamsTab exams={medicalRecord.exams || []} />}
            {activeTab === 'documents' && <DocumentsTab documents={medicalRecord.documents || []} />}
          </div>
        </div>
      </div>
    </div>
  );
};



// Interface para ADMIN
const AdminMedicalRecord: React.FC<{ 
  patients: Patient[]; 
  medicalRecord: MedicalRecordType | null;
  loading: boolean;
  onPatientSelect: (patient: Patient) => void;
  onBackToList: () => void;
}> = ({ patients, medicalRecord, loading, onPatientSelect, onBackToList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm)
  );

  if (medicalRecord) {
    return (
      <div className="space-y-6">
        {/* Header com botão voltar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={onBackToList}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prontuário Médico</h1>
                <p className="text-gray-500">Visualização de prontuário (somente leitura)</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo do prontuário específico (somente visualização) */}
        <PatientMedicalRecord 
          medicalRecord={medicalRecord} 
          loading={loading} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prontuários - UBS</h1>
              <p className="text-gray-500">Pacientes da sua unidade de saúde</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos os pacientes</option>
            <option value="active">Pacientes ativos</option>
            <option value="recent">Consultas recentes</option>
          </select>
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pacientes da UBS</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onPatientSelect(patient)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{patient.name}</h4>
                    <p className="text-sm text-gray-500">CPF: {patient.cpf}</p>
                    <p className="text-xs text-gray-400">
                      {patient.ubs_name} • {patient.doctor_name}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componentes de Tabs
const OverviewTab: React.FC<{ medicalRecord: MedicalRecordType }> = ({ medicalRecord }) => (
  <div className="space-y-4 md:space-y-6">
    {/* Alergias - Destaque Crítico */}
    <div>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-4 flex items-center">
        <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 mr-2 text-red-600" />
        Alergias
      </h3>
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 md:p-4 border border-red-200">
        {medicalRecord.allergies && medicalRecord.allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2 md:gap-3">
            {medicalRecord.allergies.map((allergy, index) => (
              <span key={index} className="px-3 py-1 md:px-4 md:py-2 bg-red-200 text-red-800 text-xs md:text-sm rounded-full font-medium flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {allergy}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center text-gray-500">
            <CheckCircle className="w-4 h-4 mr-2" />
            <p className="text-sm">Nenhuma alergia registrada</p>
          </div>
        )}
      </div>
    </div>

    {/* Doenças Crônicas */}
    <div>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-4 flex items-center">
        <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2 text-yellow-600" />
        Doenças Crônicas
      </h3>
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 md:p-4 border border-yellow-200">
        {medicalRecord.chronic_diseases && medicalRecord.chronic_diseases.length > 0 ? (
          <div className="flex flex-wrap gap-2 md:gap-3">
            {medicalRecord.chronic_diseases.map((disease, index) => (
              <span key={index} className="px-3 py-1 md:px-4 md:py-2 bg-yellow-200 text-yellow-800 text-xs md:text-sm rounded-full font-medium flex items-center">
                <Info className="w-3 h-3 mr-1" />
                {disease}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center text-gray-500">
            <CheckCircle className="w-4 h-4 mr-2" />
            <p className="text-sm">Nenhuma doença crônica registrada</p>
          </div>
        )}
      </div>
    </div>

    {/* Resumo de Métricas */}
    <div>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-4 flex items-center">
        <ActivityIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-600" />
        Resumo de Saúde
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 md:p-4 border border-blue-200">
          <div className="flex items-center mb-2 md:mb-3">
            <Pill className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mr-2" />
            <span className="text-xs md:text-sm font-medium text-blue-700">Medicamentos Ativos</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {medicalRecord.medications?.filter(m => m.status === 'active')?.length || 0}
          </p>
          <p className="text-xs text-blue-600 mt-1">Em uso atualmente</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 md:p-4 border border-green-200">
          <div className="flex items-center mb-2 md:mb-3">
            <TestTube className="w-5 h-5 md:w-6 md:h-6 text-green-600 mr-2" />
            <span className="text-xs md:text-sm font-medium text-green-700">Exames Realizados</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {medicalRecord.exams?.filter(e => e.status === 'completed')?.length || 0}
          </p>
          <p className="text-xs text-green-600 mt-1">Resultados disponíveis</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 md:p-4 border border-purple-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center mb-2 md:mb-3">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-purple-600 mr-2" />
            <span className="text-xs md:text-sm font-medium text-purple-700">Documentos</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{medicalRecord.documents?.length || 0}</p>
          <p className="text-xs text-purple-600 mt-1">Arquivos médicos</p>
        </div>
      </div>
    </div>
  </div>
);

const ConsultationsTab: React.FC<{ consultations: Consultation[] }> = ({ consultations }) => (
  <div className="space-y-4 md:space-y-6">
    {consultations.length > 0 ? (
      consultations.map((consultation) => (
        <div key={consultation.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${{
                completed: 'bg-green-500',
                scheduled: 'bg-blue-500',
                cancelled: 'bg-red-500'
              }[consultation.status] || 'bg-gray-400'}`}></div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm md:text-base">{consultation.doctor_name}</h4>
                <span className="text-xs text-gray-500">{consultation.specialty}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-600">
                {new Date(consultation.date).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="w-4 h-4 text-blue-500" />
                  <h5 className="text-sm font-medium text-gray-700">Diagnóstico</h5>
                </div>
                <p className="text-sm text-gray-600">{consultation.diagnosis || "Não informado"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-4 h-4 text-green-500" />
                  <h5 className="text-sm font-medium text-gray-700">Prescrição</h5>
                </div>
                <p className="text-sm text-gray-600">{consultation.prescription || "Não informado"}</p>
              </div>
            </div>
            
            {consultation.notes && (
              <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-yellow-600" />
                  <h5 className="text-sm font-medium text-gray-700">Observações</h5>
                </div>
                <p className="text-sm text-gray-600">{consultation.notes}</p>
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-xl border border-gray-200">
        <Calendar className="w-12 h-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma consulta encontrada</h3>
        <p className="text-sm text-gray-500 max-w-md">Não há registros de consultas médicas para este paciente.</p>
      </div>
    )}
  </div>
);

const MedicationsTab: React.FC<{ medications: Medication[] }> = ({ medications }) => (
  <div className="space-y-4 md:space-y-6">
    {medications.length > 0 ? (
      medications.map((medication) => (
        <div key={medication.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                medication.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm md:text-base">{medication.name}</h4>
                <span className="text-xs text-gray-500">{medication.dosage}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              medication.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {medication.status === 'active' ? 'Em uso' : 'Descontinuado'}
            </span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <h5 className="text-sm font-medium text-gray-700">Frequência</h5>
                </div>
                <p className="text-sm text-gray-600">{medication.frequency}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <h5 className="text-sm font-medium text-gray-700">Período</h5>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Início:</span>
                    <p className="text-gray-600">{new Date(medication.start_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Término:</span>
                    <p className="text-gray-600">{medication.end_date ? new Date(medication.end_date).toLocaleDateString('pt-BR') : 'Contínuo'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {medication.instructions && (
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h5 className="text-sm font-medium text-gray-700">Instruções</h5>
                </div>
                <p className="text-sm text-gray-600">{medication.instructions}</p>
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-xl border border-gray-200">
        <Pill className="w-12 h-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum medicamento encontrado</h3>
        <p className="text-sm text-gray-500 max-w-md">Não há registros de medicamentos para este paciente.</p>
      </div>
    )}
  </div>
);

const ExamsTab: React.FC<{ exams: Exam[] }> = ({ exams }) => (
  <div className="space-y-4 md:space-y-6">
    {exams.length > 0 ? (
      exams.map((exam) => (
        <div key={exam.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${{
                completed: 'bg-green-500',
                scheduled: 'bg-blue-500',
                pending: 'bg-yellow-500',
                cancelled: 'bg-red-500'
              }[exam.status] || 'bg-gray-400'}`}></div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm md:text-base">{exam.name}</h4>
                <span className="text-xs text-gray-500">{exam.lab}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${{
              completed: 'bg-green-100 text-green-800',
              scheduled: 'bg-blue-100 text-blue-800',
              pending: 'bg-yellow-100 text-yellow-800',
              cancelled: 'bg-red-100 text-red-800'
            }[exam.status] || 'bg-gray-100 text-gray-600'}`}>
              {{
                completed: 'Concluído',
                scheduled: 'Agendado',
                pending: 'Pendente',
                cancelled: 'Cancelado'
              }[exam.status] || 'Desconhecido'}
            </span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <h5 className="text-sm font-medium text-gray-700">Data do Exame</h5>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(exam.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TestTube className="w-4 h-4 text-green-500" />
                  <h5 className="text-sm font-medium text-gray-700">Resultado</h5>
                </div>
                <p className="text-sm text-gray-600">{exam.results || "Não informado"}</p>
              </div>
            </div>
            

            
            {exam.results && (
              <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-green-600" />
                  <h5 className="text-sm font-medium text-gray-700">Resultado</h5>
                </div>
                <p className="text-sm text-gray-600">{exam.results}</p>
              </div>
            )}
            
            {exam.lab && (
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  Laboratório: {exam.lab}
                </div>
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-xl border border-gray-200">
        <TestTube className="w-12 h-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum exame encontrado</h3>
        <p className="text-sm text-gray-500 max-w-md">Não há registros de exames médicos para este paciente.</p>
      </div>
    )}
  </div>
);

const DocumentsTab: React.FC<{ documents: Document[] }> = ({ documents }) => (
  <div className="space-y-4 md:space-y-6">
    {documents.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((document) => (
          <div key={document.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded">
                  {document.type === 'medical_report' ? (
                    <FileText className="w-4 h-4 text-red-600" />
                  ) : document.type === 'exam_result' ? (
                    <FileText className="w-4 h-4 text-green-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-600">{document.type?.toUpperCase() || 'DOC'}</span>
              </div>
              <span className="text-xs text-gray-500">{document.size}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm md:text-base mb-1">{document.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(document.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <a 
                    href={document.file_url || '#'} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                    title="Baixar documento"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              {document.description && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Descrição</p>
                  <p className="text-sm text-gray-700">{document.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-xl border border-gray-200">
        <FileText className="w-12 h-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum documento encontrado</h3>
        <p className="text-sm text-gray-500 max-w-md">Não há documentos médicos disponíveis para este paciente.</p>
      </div>
    )}
  </div>
);

// Componente específico para DOCTOR
interface DoctorMedicalRecordProps {
  patients: Patient[];
  medicalRecord: MedicalRecordType | null;
  loading: boolean;
  onPatientSelect: (patient: Patient) => void;
  onEditRecord: (record: MedicalRecordType) => void;
  onDeleteRecord: (patientId: string) => void;
  onBackToList: () => void;
  isEditModalOpen: boolean;
  editingRecord: MedicalRecordType | null;
  onSaveEdit: (updatedRecord: MedicalRecordType) => void;
  onCancelEdit: () => void;
  editLoading: boolean;
}

const DoctorMedicalRecord: React.FC<DoctorMedicalRecordProps> = ({
  patients,
  medicalRecord,
  loading,
  onPatientSelect,
  onEditRecord,
  onDeleteRecord,
  onBackToList,
  isEditModalOpen,
  editingRecord,
  onSaveEdit,
  onCancelEdit,
  editLoading
}) => {
  const isMobile = useIsMobile();
  if (medicalRecord) {
    return (
      <div className="space-y-6">
        {/* Header com botão voltar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackToList}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prontuário Médico</h1>
                <p className="text-gray-500">Paciente: {medicalRecord.patient_name}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className={`text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center ${
                isMobile ? 'px-2 py-1' : 'px-4 py-2'
              }`}>
                <Plus className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
                Nova Consulta
              </button>
              <button 
                onClick={() => {
                  console.log('Botão Editar clicado, medicalRecord:', medicalRecord);
                  if (medicalRecord) {
                    onEditRecord(medicalRecord);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button 
                onClick={() => medicalRecord && onDeleteRecord(medicalRecord.patient_id)}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo do prontuário específico */}
        <PatientMedicalRecord 
          medicalRecord={medicalRecord} 
          loading={loading} 
        />
        
        {/* Modal de Edição - Adicionado aqui para funcionar quando um prontuário está selecionado */}
        <EditMedicalRecordModal
          isOpen={isEditModalOpen}
          record={editingRecord}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          loading={editLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prontuários Médicos</h1>
              <p className="text-gray-500">Pacientes das UBS onde você está atrelado</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Prontuário
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar paciente por nome, CPF..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todas as UBS</option>
            <option value="ubs1">UBS Centro</option>
            <option value="ubs2">UBS Jardim das Flores</option>
          </select>
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Pacientes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Carregando pacientes...</p>
            </div>
          ) : patients.length > 0 ? (
            patients.map((patient) => (
              <div key={patient.id} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => onPatientSelect(patient)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">CPF: {patient.cpf}</p>
                      <p className="text-sm text-gray-500">Nascimento: {new Date(patient.birth_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{patient.ubs_name}</p>
                      <p className="text-sm text-gray-500">{patient.doctor_name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Selecionar o paciente e depois abrir modal de edição
                          console.log('Clicou no botão de edição da lista, paciente:', patient.name);
                          onPatientSelect(patient);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Visualizar e editar prontuário"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRecord(patient.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Excluir prontuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum paciente encontrado</h3>
              <p className="text-gray-500">Não há pacientes cadastrados para suas UBS.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Unauthorized: React.FC = () => (
  <div className="text-center py-8">
    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
    <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
  </div>
);

// Importando o modal de edição de um arquivo separado
import EditMedicalRecordModal from './EditMedicalRecordModal';

export default MedicalRecord;
