export interface Consultation {
  id: string;
  date: string;
  doctor_name: string;
  specialty: string;
  reason?: string;
  diagnosis: string;
  prescription?: string;
  notes: string;
  follow_up?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  prescribed_by?: string;
  doctor_name?: string;
  instructions?: string;
  active?: boolean;
  status: 'active' | 'completed' | 'discontinued';
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  type?: string;
  lab?: string;
  laboratory?: string;
  result?: string;
  results?: string;
  doctor_name?: string;
  file_url?: string;
  status: 'scheduled' | 'pending' | 'completed' | 'cancelled';
}

export interface Document {
  id: string;
  name: string;
  type?: string; // ✅ CORRIGIDO: Aceita qualquer string
  date: string;
  description?: string;
  file_url: string; // ✅ CAMPO PRINCIPAL para URL do arquivo
  size?: string;
  added_by?: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_cpf?: string;
  patient_birth_date?: string;
  patient_gender?: string;
  patient_phone?: string;
  patient_email?: string;
  patient_address?: string;
  blood_type?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  chronic_diseases?: string[];
  health_summary?: string;
  consultations?: Consultation[];
  medications?: Medication[];
  exams?: Exam[];
  documents?: Document[];
  created_at: string;
  updated_at: string;
}

// Não usar export default para tipos quando verbatimModuleSyntax está habilitado
