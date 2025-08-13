import React, { useState, useEffect } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { PERMISSIONS } from '../../hooks/usePermission';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X, 
  Camera, 
  Key, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Settings,
  Bell,
  Globe,
  Heart,
  Activity,
  FileText,
  Download,
  Upload,
  Eye as EyeIcon,
  Smartphone,
  Monitor,
  Globe2,
  Shield as ShieldIcon,
  History,
  LogOut,
  Check,
  X as XIcon,
  Clock,
  AlertTriangle,
  Info,
  Zap,
  Moon,
  Sun,
  Languages,
  Volume2,
  VolumeX,
  TrendingUp
} from 'lucide-react';
import Modal from '../common/Modal';

// Interfaces
interface UserProfile {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birth_date: string;
  address: string;
  blood_type: string;
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: {
    notifications: boolean;
    language: string;
    theme: string;
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    appointment_reminders: boolean;
    result_notifications: boolean;
    privacy_share_data: boolean;
    two_factor_auth: boolean;
  };
  created_at: string;
  updated_at: string;
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface SystemSettings {
  language: string;
  theme: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  appointment_reminders: boolean;
  result_notifications: boolean;
  privacy_share_data: boolean;
  two_factor_auth: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  ip_address: string;
  device: string;
}

// Componente principal
const Profile: React.FC = () => {
  const { user, hasPermission } = usePermission();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    language: 'pt-BR',
    theme: 'light',
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    appointment_reminders: true,
    result_notifications: true,
    privacy_share_data: true,
    two_factor_auth: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Login realizado',
      timestamp: '2024-04-20T10:30:00Z',
      ip_address: '192.168.1.100',
      device: 'Chrome - Windows 10'
    },
    {
      id: '2',
      action: 'Perfil atualizado',
      timestamp: '2024-04-19T15:45:00Z',
      ip_address: '192.168.1.100',
      device: 'Chrome - Windows 10'
    },
    {
      id: '3',
      action: 'Senha alterada',
      timestamp: '2024-04-18T09:20:00Z',
      ip_address: '192.168.1.100',
      device: 'Chrome - Windows 10'
    }
  ]);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockProfile: UserProfile = {
        id: user?.id || '1',
        name: 'Maria Silva Santos',
        email: 'maria.silva@email.com',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birth_date: '1985-03-15',
        address: 'Rua das Flores, 123 - São Paulo/SP',
        blood_type: 'O+',
        emergency_contact: {
          name: 'João Silva Santos',
          phone: '(11) 88888-8888',
          relationship: 'Cônjuge'
        },
        preferences: {
          notifications: true,
          language: 'pt-BR',
          theme: 'light',
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          appointment_reminders: true,
          result_notifications: true,
          privacy_share_data: true,
          two_factor_auth: false
        },
        created_at: '2024-01-15',
        updated_at: '2024-04-20'
      };

      setProfile(mockProfile);
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone,
        address: mockProfile.address,
        emergency_contact: { ...mockProfile.emergency_contact }
      });
      setSystemSettings({
        language: mockProfile.preferences.language,
        theme: mockProfile.preferences.theme,
        email_notifications: mockProfile.preferences.email_notifications,
        sms_notifications: mockProfile.preferences.sms_notifications,
        push_notifications: mockProfile.preferences.push_notifications,
        appointment_reminders: mockProfile.preferences.appointment_reminders,
        result_notifications: mockProfile.preferences.result_notifications,
        privacy_share_data: mockProfile.preferences.privacy_share_data,
        two_factor_auth: mockProfile.preferences.two_factor_auth
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        emergency_contact: {
          ...prev.emergency_contact,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!formData.emergency_contact.name.trim()) {
      newErrors['emergency_contact.name'] = 'Nome do contato de emergência é obrigatório';
    }

    if (!formData.emergency_contact.phone.trim()) {
      newErrors['emergency_contact.phone'] = 'Telefone do contato de emergência é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Mock API call - substituir por chamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(prev => prev ? {
        ...prev,
        ...formData,
        updated_at: new Date().toISOString()
      } : null);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        emergency_contact: { ...profile.emergency_contact }
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('As senhas não coincidem');
      return;
    }

    if (passwordData.new_password.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      // Mock API call - substituir por chamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      alert('Senha alterada com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingChange = (setting: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSystemSettings = async () => {
    try {
      setLoading(true);
      // Mock API call - substituir por chamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      setLoading(true);
      // Mock API call - substituir por chamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSystemSettings(prev => ({
        ...prev,
        two_factor_auth: !prev.two_factor_auth
      }));
      
      alert(systemSettings.two_factor_auth ? '2FA desativado!' : '2FA ativado!');
    } catch (error) {
      console.error('Erro ao alterar 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Perfil não encontrado</h2>
          <p className="text-gray-600">Não foi possível carregar seu perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-16">
      {/* Header moderno seguindo padrão do Dashboard */}
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <TrendingUp className="text-blue-600" size={36} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Meu Perfil
            </h1>
            <p className="text-gray-500 text-base">
              Gerencie suas informações e configurações pessoais
            </p>
          </div>
        </div>

        {/* Cards de Informações Principais - Design moderno */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-blue-500`} style={{ borderLeftWidth: 6 }}>
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 mr-4`}>
              <User className={`h-7 w-7 text-blue-500`} />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Nome</div>
              <div className="text-lg font-bold text-gray-900">{profile.name}</div>
            </div>
          </div>
          
          <div className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-green-500`} style={{ borderLeftWidth: 6 }}>
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-green-50 mr-4`}>
              <Mail className={`h-7 w-7 text-green-500`} />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Email</div>
              <div className="text-lg font-bold text-gray-900">{profile.email}</div>
            </div>
          </div>
          
          <div className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-purple-500`} style={{ borderLeftWidth: 6 }}>
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-purple-50 mr-4`}>
              <Calendar className={`h-7 w-7 text-purple-500`} />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Nascimento</div>
              <div className="text-lg font-bold text-gray-900">
                {new Date(profile.birth_date).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
          
          <div className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[220px] relative overflow-hidden border-red-500`} style={{ borderLeftWidth: 6 }}>
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-red-50 mr-4`}>
              <Heart className={`h-7 w-7 text-red-500`} />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Tipo Sanguíneo</div>
              <div className="text-lg font-bold text-gray-900">{profile.blood_type}</div>
            </div>
          </div>
        </div>

        {/* Sistema de Tabs - Design moderno */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Navegação das Tabs - Design moderno */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'personal', label: 'Pessoal', icon: User },
                { id: 'security', label: 'Segurança', icon: Shield },
                { id: 'notifications', label: 'Notificações', icon: Bell },
                { id: 'privacy', label: 'Privacidade', icon: EyeIcon },
                { id: 'preferences', label: 'Preferências', icon: Settings },
                { id: 'history', label: 'Histórico', icon: History }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="p-6">
            {activeTab === 'personal' && <PersonalTab profile={profile} isEditing={isEditing} formData={formData} handleInputChange={handleInputChange} errors={errors} setIsEditing={setIsEditing} handleSave={handleSave} handleCancel={handleCancel} loading={loading} />}
            {activeTab === 'security' && <SecurityTab showPasswordModal={showPasswordModal} setShowPasswordModal={setShowPasswordModal} passwordData={passwordData} setPasswordData={setPasswordData} handlePasswordChange={handlePasswordChange} loading={loading} systemSettings={systemSettings} handleTwoFactorToggle={handleTwoFactorToggle} />}
            {activeTab === 'notifications' && <NotificationsTab systemSettings={systemSettings} handleSystemSettingChange={handleSystemSettingChange} />}
            {activeTab === 'privacy' && <PrivacyTab systemSettings={systemSettings} handleSystemSettingChange={handleSystemSettingChange} />}
            {activeTab === 'preferences' && <PreferencesTab systemSettings={systemSettings} handleSystemSettingChange={handleSystemSettingChange} />}
            {activeTab === 'history' && <HistoryTab activityLogs={activityLogs} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componentes das Tabs
const PersonalTab: React.FC<{
  profile: UserProfile | null;
  isEditing: boolean;
  formData: ProfileFormData;
  handleInputChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  setIsEditing: (editing: boolean) => void;
  handleSave: () => void;
  handleCancel: () => void;
  loading: boolean;
}> = ({ profile, isEditing, formData, handleInputChange, errors, setIsEditing, handleSave, handleCancel, loading }) => {
  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Botões de ação */}
      <div className="flex justify-end mb-6">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Informações
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        // Modo de visualização - Design moderno
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              Informações Pessoais
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Nome Completo</span>
                </div>
                <span className="text-gray-900 font-medium">{profile.name}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Email</span>
                </div>
                <span className="text-gray-900 font-medium">{profile.email}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-purple-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Telefone</span>
                </div>
                <span className="text-gray-900 font-medium">{profile.phone}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-red-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Endereço</span>
                </div>
                <span className="text-gray-900 font-medium text-right max-w-xs">{profile.address}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Heart className="w-5 h-5 text-red-600 mr-2" />
              Contato de Emergência
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Nome do Contato</span>
                </div>
                <span className="text-gray-900 font-medium">{profile.emergency_contact.name}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Telefone do Contato</span>
                </div>
                <span className="text-gray-900 font-medium">{profile.emergency_contact.phone}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Heart className="w-4 h-4 text-red-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Relacionamento</span>
                </div>
                <span className="text-gray-900 font-medium">{profile.emergency_contact.relationship}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Modo de edição - Design moderno
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              Informações Pessoais
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Digite seu nome completo"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Digite seu email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Digite seu telefone"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phone}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Digite seu endereço completo"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.address}
                </p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Heart className="w-5 h-5 text-red-600 mr-2" />
              Contato de Emergência
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Contato
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact.name}
                  onChange={(e) => handleInputChange('emergency_contact.name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors['emergency_contact.name'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Nome do contato de emergência"
                />
                {errors['emergency_contact.name'] && <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors['emergency_contact.name']}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone do Contato
                </label>
                <input
                  type="tel"
                  value={formData.emergency_contact.phone}
                  onChange={(e) => handleInputChange('emergency_contact.phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors['emergency_contact.phone'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Telefone do contato de emergência"
                />
                {errors['emergency_contact.phone'] && <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors['emergency_contact.phone']}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relacionamento
                </label>
                <select
                  value={formData.emergency_contact.relationship}
                  onChange={(e) => handleInputChange('emergency_contact.relationship', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Selecione o relacionamento...</option>
                  <option value="Cônjuge">Cônjuge</option>
                  <option value="Pai">Pai</option>
                  <option value="Mãe">Mãe</option>
                  <option value="Filho(a)">Filho(a)</option>
                  <option value="Irmão(ã)">Irmão(ã)</option>
                  <option value="Amigo(a)">Amigo(a)</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SecurityTab: React.FC<{
  showPasswordModal: boolean;
  setShowPasswordModal: (show: boolean) => void;
  passwordData: any;
  setPasswordData: (data: any) => void;
  handlePasswordChange: () => void;
  loading: boolean;
  systemSettings: SystemSettings;
  handleTwoFactorToggle: () => void;
}> = ({ showPasswordModal, setShowPasswordModal, passwordData, setPasswordData, handlePasswordChange, loading, systemSettings, handleTwoFactorToggle }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Key className="w-6 h-6 text-yellow-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Alterar Senha</h4>
                <p className="text-sm text-gray-600">Mantenha sua senha segura</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Alterar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldIcon className="w-6 h-6 text-purple-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Autenticação 2FA</h4>
                <p className="text-sm text-gray-600">Segurança adicional</p>
              </div>
            </div>
            <button
              onClick={handleTwoFactorToggle}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                systemSettings.two_factor_auth
                  ? 'text-red-700 bg-red-100 hover:bg-red-200'
                  : 'text-green-700 bg-green-100 hover:bg-green-200'
              }`}
            >
              {systemSettings.two_factor_auth ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Alteração de Senha usando componente Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Alterar Senha"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha Atual
            </label>
            <input
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData((prev: any) => ({ ...prev, current_password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Digite sua senha atual"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData((prev: any) => ({ ...prev, new_password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Digite a nova senha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData((prev: any) => ({ ...prev, confirm_password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Confirme a nova senha"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handlePasswordChange}
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const NotificationsTab: React.FC<{
  systemSettings: SystemSettings;
  handleSystemSettingChange: (setting: keyof SystemSettings, value: any) => void;
}> = ({ systemSettings, handleSystemSettingChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Bell className="w-5 h-5 text-blue-600 mr-2" />
            Canais de Notificação
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <h5 className="font-medium text-gray-900">Email</h5>
                  <p className="text-sm text-gray-600">Notificações por email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.email_notifications}
                  onChange={(e) => handleSystemSettingChange('email_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Smartphone className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <h5 className="font-medium text-gray-900">SMS</h5>
                  <p className="text-sm text-gray-600">Notificações por SMS</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.sms_notifications}
                  onChange={(e) => handleSystemSettingChange('sms_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <h5 className="font-medium text-gray-900">Push</h5>
                  <p className="text-sm text-gray-600">Notificações push</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.push_notifications}
                  onChange={(e) => handleSystemSettingChange('push_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <FileText className="w-5 h-5 text-green-600 mr-2" />
            Tipos de Notificação
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <h5 className="font-medium text-gray-900">Lembretes de Consulta</h5>
                  <p className="text-sm text-gray-600">Lembretes de agendamentos</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.appointment_reminders}
                  onChange={(e) => handleSystemSettingChange('appointment_reminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <h5 className="font-medium text-gray-900">Resultados de Exames</h5>
                  <p className="text-sm text-gray-600">Notificações de resultados</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.result_notifications}
                  onChange={(e) => handleSystemSettingChange('result_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrivacyTab: React.FC<{
  systemSettings: SystemSettings;
  handleSystemSettingChange: (setting: keyof SystemSettings, value: any) => void;
}> = ({ systemSettings, handleSystemSettingChange }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Controle de Privacidade</h4>
            <p className="text-sm text-blue-700 mt-1">
              Gerencie como seus dados são compartilhados com médicos e unidades de saúde.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <EyeIcon className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <h5 className="font-medium text-gray-900">Compartilhar Dados</h5>
              <p className="text-sm text-gray-600">Permitir acesso aos dados médicos</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={systemSettings.privacy_share_data}
              onChange={(e) => handleSystemSettingChange('privacy_share_data', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

const PreferencesTab: React.FC<{
  systemSettings: SystemSettings;
  handleSystemSettingChange: (setting: keyof SystemSettings, value: any) => void;
}> = ({ systemSettings, handleSystemSettingChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Idioma</h4>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Languages className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h5 className="font-medium text-gray-900">Idioma do Sistema</h5>
                <p className="text-sm text-gray-600">Escolha o idioma preferido</p>
              </div>
            </div>
            <select
              value={systemSettings.language}
              onChange={(e) => handleSystemSettingChange('language', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pt-BR">Português (BR)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Tema</h4>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {systemSettings.theme === 'light' ? <Sun className="w-5 h-5 text-yellow-600 mr-3" /> : <Moon className="w-5 h-5 text-purple-600 mr-3" />}
              <div>
                <h5 className="font-medium text-gray-900">Tema do Sistema</h5>
                <p className="text-sm text-gray-600">Escolha o tema preferido</p>
              </div>
            </div>
            <select
              value={systemSettings.theme}
              onChange={(e) => handleSystemSettingChange('theme', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="auto">Automático</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryTab: React.FC<{
  activityLogs: ActivityLog[];
}> = ({ activityLogs }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <History className="w-5 h-5 text-blue-600 mr-2" />
          Atividade Recente
        </h4>
        <p className="text-sm text-gray-600 mb-6">
          Histórico das suas últimas atividades no sistema.
        </p>

        <div className="space-y-4">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                <div>
                  <h5 className="font-medium text-gray-900">{log.action}</h5>
                  <p className="text-sm text-gray-600">
                    {new Date(log.timestamp).toLocaleString('pt-BR')} • {log.device}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-mono">{log.ip_address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
