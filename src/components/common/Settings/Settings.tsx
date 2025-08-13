import React, { useMemo, useState } from 'react';
import { PageHeader } from '../../ui';
import { PERMISSIONS, usePermission } from '../../../hooks/usePermission';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Building2,
  Hospital,
  UserCog,
  CalendarClock,
  Lock,
  KeyRound,
  Globe,
  Trash2,
  User,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react';
import Modal from '../Modal';

type Section = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  canView: boolean;
  canEdit: boolean;
};

const Settings: React.FC = () => {
  const { user, hasPermission, isMaster, isAdmin, isDoctor, isPatient } = usePermission();

  // Estado de formulário mock (por seção)
  const [form, setForm] = useState({
    // master/admin comuns
    systemName: 'agendaSaude3',
    locale: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    maintenance: false,
    passwordMinLen: 8,
    twoFA: false,
    sessionTimeout: 30,
    webhookUrl: '',
    apiKeyMasked: '---1234',
    // conta do usuário
    email: user?.email || '',
    phone: '',
    twoFAEnabled: false,
    // admin
    unitName: 'Unidade Central',
    unitHours: '08:00 - 18:00',
    allowOverbooking: false,
    notifyEmail: true,
    notifySms: false,
    // doctor
    defaultSlotMins: 20,
    acceptsTelemed: true,
    // patient
    preferredName: (user as any)?.profile?.name || '',
    marketingOptIn: true,
    privacyConsent: true,
  });

  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Estado do modal de alteração de senha (mock)
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [pwdShow, setPwdShow] = useState({ current: false, next: false, confirm: false });

  const passwordStrength = (v: string) => {
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[a-z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    if (score <= 2) return { label: 'Fraca', color: 'text-red-600' };
    if (score === 3) return { label: 'Média', color: 'text-yellow-600' };
    return { label: 'Forte', color: 'text-green-600' };
  };

  const setField = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  // Seções por role com checagem de permissão
  const sections = useMemo<Section[]>(() => {
    const canView = hasPermission(PERMISSIONS.CONFIG_VIEW);
    const canEdit = hasPermission(PERMISSIONS.CONFIG_UPDATE);

    if (isMaster()) {
      return [
        { id: 'conta', label: 'Conta', icon: User, canView: true, canEdit: true },
        { id: 'sistema', label: 'Sistema', icon: SettingsIcon, canView, canEdit },
        { id: 'seguranca', label: 'Segurança', icon: Shield, canView, canEdit },
        { id: 'integracoes', label: 'Integrações', icon: KeyRound, canView, canEdit },
        { id: 'prefeituras', label: 'Prefeituras/Unidades', icon: Building2, canView, canEdit },
        { id: 'auditoria', label: 'Auditoria', icon: Shield, canView, canEdit: false },
      ];
    }

    if (isAdmin()) {
      return [
        { id: 'conta', label: 'Conta', icon: User, canView: true, canEdit: true },
        { id: 'unidade', label: 'Unidade', icon: Hospital, canView, canEdit },
        { id: 'agendamento', label: 'Agendamento', icon: CalendarClock, canView, canEdit },
        { id: 'notificacoes', label: 'Notificações', icon: Bell, canView, canEdit },
      ];
    }

    if (isDoctor()) {
      return [
        { id: 'conta', label: 'Conta', icon: User, canView: true, canEdit: true },
        { id: 'agenda', label: 'Agenda Pessoal', icon: CalendarClock, canView, canEdit },
        { id: 'disponibilidade', label: 'Disponibilidade', icon: Globe, canView, canEdit },
        { id: 'notificacoes', label: 'Notificações', icon: Bell, canView, canEdit },
      ];
    }

    if (isPatient()) {
      return [
        { id: 'conta', label: 'Conta', icon: User, canView: true, canEdit: true },
        { id: 'perfil', label: 'Perfil', icon: UserCog, canView: true, canEdit: true },
        { id: 'preferencias', label: 'Preferências', icon: SettingsIcon, canView: true, canEdit: true },
        { id: 'privacidade', label: 'Privacidade', icon: Lock, canView: true, canEdit: true },
      ];
    }

    // fallback genérico
    return [
      { id: 'perfil', label: 'Perfil', icon: UserCog, canView: true, canEdit: true },
    ];
  }, [hasPermission, isAdmin, isDoctor, isMaster, isPatient]);

  const [active, setActive] = useState(sections[0]?.id || 'perfil');

  const handleSave = async () => {
    setSaving(true);
    // Simula persistência; integrar futuramente com service/API
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setDirty(false);
    alert('Configurações salvas com sucesso (mock).');
  };

  const handleCancel = () => {
    // Reset parcial simples (mock)
    setForm(f => ({ ...f }));
    setDirty(false);
  };

  // Proteção de acesso à página de configurações
  const canViewSettings = useMemo(() => {
    if (isPatient()) return true; // pacientes sempre podem ver seu próprio perfil/preferências
    return hasPermission(PERMISSIONS.CONFIG_VIEW);
  }, [hasPermission, isPatient]);

  if (!canViewSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow p-8 text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso negado</h2>
          <p className="text-gray-600">Você não possui permissão para visualizar as configurações.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-16">
      <PageHeader
        title="Configurações do Sistema"
        subtitle={user?.role ? `Ajustes para o perfil ${user.role}` : 'Ajustes do sistema'}
        icon={SettingsIcon}
        hasChanges={dirty}
        onSave={sections.find(s => s.id === active)?.canEdit ? handleSave : undefined}
        onCancel={sections.find(s => s.id === active)?.canEdit ? handleCancel : undefined}
        saving={saving}
        className="mb-2 py-1 px-4 rounded-xl shadow bg-white border border-gray-100"
      />

      <div className="px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
        {/* Navegação lateral */}
        <aside className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-3">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto">
              {sections.filter(s => s.canView).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap transition-all text-sm font-medium ${
                    active === s.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <s.icon className="h-5 w-5" />
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Conteúdo da seção ativa */}
        <main className="lg:col-span-9">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            {active === 'conta' && (
              <div className="space-y-6">
                <SectionTitle title="Conta do Usuário" description="Gerencie seus dados de acesso e segurança (mock)." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="E-mail"
                    value={form.email}
                    onChange={v => setField('email', v)}
                    disabled={saving}
                  />
                  <TextField
                    label="Telefone"
                    value={form.phone}
                    onChange={v => setField('phone', v)}
                    placeholder="(11) 99999-9999"
                    disabled={saving}
                  />
                </div>
                <ToggleField
                  label="Ativar 2FA na minha conta"
                  description="Recomendado para aumentar a segurança do login."
                  checked={form.twoFAEnabled}
                  onChange={v => setField('twoFAEnabled', v)}
                  disabled={saving}
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => setShowPwdModal(true)}
                    disabled={saving}
                  >
                    Alterar senha
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                    onClick={() => alert('Sessões encerradas em todos os dispositivos (mock).')}
                    disabled={saving}
                  >
                    <LogOut className="h-4 w-4" />
                    Encerrar sessões
                  </button>
                </div>
              </div>
            )}
            {active === 'sistema' && (
              <div className="space-y-6">
                <SectionTitle title="Preferências do Sistema" description="Defina idioma, fuso e exiba informações básicas do sistema." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Nome do sistema"
                    value={form.systemName}
                    onChange={v => setField('systemName', v)}
                    disabled={!sections.find(s => s.id === 'sistema')?.canEdit || saving}
                  />
                  <TextField
                    label="Localização (locale)"
                    value={form.locale}
                    onChange={v => setField('locale', v)}
                    disabled={!sections.find(s => s.id === 'sistema')?.canEdit || saving}
                  />
                  <TextField
                    label="Fuso horário"
                    value={form.timezone}
                    onChange={v => setField('timezone', v)}
                    disabled={!sections.find(s => s.id === 'sistema')?.canEdit || saving}
                  />
                </div>
                <ToggleField
                  label="Modo de manutenção"
                  description="Coloca o sistema em modo restrito temporariamente."
                  checked={form.maintenance}
                  onChange={v => setField('maintenance', v)}
                  disabled={!sections.find(s => s.id === 'sistema')?.canEdit || saving}
                />
              </div>
            )}

            {active === 'seguranca' && (
              <div className="space-y-6">
                <SectionTitle title="Políticas de Segurança" description="Defina requisitos mínimos e autenticação." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <NumberField
                    label="Tamanho mínimo da senha"
                    value={form.passwordMinLen}
                    onChange={v => setField('passwordMinLen', v)}
                    min={6}
                    max={64}
                    disabled={!sections.find(s => s.id === 'seguranca')?.canEdit || saving}
                  />
                  <NumberField
                    label="Tempo de sessão (min)"
                    value={form.sessionTimeout}
                    onChange={v => setField('sessionTimeout', v)}
                    min={5}
                    max={240}
                    disabled={!sections.find(s => s.id === 'seguranca')?.canEdit || saving}
                  />
                </div>
                <ToggleField
                  label="Autenticação em duas etapas (2FA)"
                  description="Requer um segundo fator de autenticação no login."
                  checked={form.twoFA}
                  onChange={v => setField('twoFA', v)}
                  disabled={!sections.find(s => s.id === 'seguranca')?.canEdit || saving}
                />
              </div>
            )}

            {active === 'integracoes' && (
              <div className="space-y-6">
                <SectionTitle title="Integrações e API" description="Gerencie webhooks e credenciais de API." />
                <TextField
                  label="Webhook URL"
                  value={form.webhookUrl}
                  onChange={v => setField('webhookUrl', v)}
                  placeholder="https://exemplo.com/webhook"
                  disabled={!sections.find(s => s.id === 'integracoes')?.canEdit || saving}
                />
                <div className="flex items-center gap-3">
                  <TextField label="API Key" value={form.apiKeyMasked} disabled />
                  <button
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    disabled={!sections.find(s => s.id === 'integracoes')?.canEdit || saving}
                    onClick={() => alert('Regerar chave (mock)')}
                  >
                    Regerar
                  </button>
                </div>
              </div>
            )}

            {active === 'prefeituras' && (
              <div className="space-y-6">
                <SectionTitle title="Prefeituras e Unidades" description="Parâmetros globais e cadastro básico (mock)." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Prefeitura padrão"
                    value={'Prefeitura Municipal'}
                    onChange={() => {}}
                    disabled
                  />
                  <TextField
                    label="Unidade padrão"
                    value={'Unidade Central'}
                    onChange={() => {}}
                    disabled
                  />
                </div>
                <p className="text-sm text-gray-500">Gestão detalhada disponível em módulos específicos.</p>
              </div>
            )}

            {active === 'auditoria' && (
              <div className="space-y-4">
                <SectionTitle title="Auditoria" description="Acompanhe logs e exporte registros (mock)." />
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 text-gray-600 text-sm">
                  Logs de auditoria serão exibidos aqui. Utilize filtros por período e usuário. Exportação exigirá permissão adequada.
                </div>
              </div>
            )}

            {/* Admin */}
            {active === 'unidade' && (
              <div className="space-y-6">
                <SectionTitle title="Configurações da Unidade" description="Nome e horários de funcionamento." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Nome da unidade"
                    value={form.unitName}
                    onChange={v => setField('unitName', v)}
                    disabled={!sections.find(s => s.id === 'unidade')?.canEdit || saving}
                  />
                  <TextField
                    label="Horário de atendimento"
                    value={form.unitHours}
                    onChange={v => setField('unitHours', v)}
                    placeholder="08:00 - 18:00"
                    disabled={!sections.find(s => s.id === 'unidade')?.canEdit || saving}
                  />
                </div>
              </div>
            )}

            {active === 'agendamento' && (
              <div className="space-y-6">
                <SectionTitle title="Agendamento" description="Regras gerais e capacidade." />
                <ToggleField
                  label="Permitir overbooking controlado"
                  description="Autoriza exceções em casos de urgência."
                  checked={form.allowOverbooking}
                  onChange={v => setField('allowOverbooking', v)}
                  disabled={!sections.find(s => s.id === 'agendamento')?.canEdit || saving}
                />
              </div>
            )}

            {active === 'notificacoes' && (
              <div className="space-y-6">
                <SectionTitle title="Notificações" description="Canais e preferências de envio." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ToggleField
                    label="E-mail"
                    checked={form.notifyEmail}
                    onChange={v => setField('notifyEmail', v)}
                    disabled={!sections.find(s => s.id === 'notificacoes')?.canEdit || saving}
                  />
                  <ToggleField
                    label="SMS"
                    checked={form.notifySms}
                    onChange={v => setField('notifySms', v)}
                    disabled={!sections.find(s => s.id === 'notificacoes')?.canEdit || saving}
                  />
                </div>
              </div>
            )}

            {/* Doctor */}
            {active === 'agenda' && (
              <div className="space-y-6">
                <SectionTitle title="Agenda Pessoal" description="Slots e modalidades de atendimento." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <NumberField
                    label="Duração padrão (min)"
                    value={form.defaultSlotMins}
                    onChange={v => setField('defaultSlotMins', v)}
                    min={10}
                    max={120}
                    disabled={!sections.find(s => s.id === 'agenda')?.canEdit || saving}
                  />
                  <ToggleField
                    label="Aceitar Telemedicina"
                    checked={form.acceptsTelemed}
                    onChange={v => setField('acceptsTelemed', v)}
                    disabled={!sections.find(s => s.id === 'agenda')?.canEdit || saving}
                  />
                </div>
              </div>
            )}

            {active === 'disponibilidade' && (
              <div className="space-y-6">
                <SectionTitle title="Disponibilidade" description="Configure períodos e bloqueios (mock)." />
                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-gray-500 text-sm">
                  A configuração detalhada de disponibilidade pode ser feita na Agenda. Esta seção terá atalhos e presets no futuro.
                </div>
              </div>
            )}

            {/* Patient */}
            {active === 'perfil' && (
              <div className="space-y-6">
                <SectionTitle title="Perfil" description="Informações básicas do paciente." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Nome preferido"
                    value={form.preferredName}
                    onChange={v => setField('preferredName', v)}
                    disabled={saving}
                  />
                </div>
              </div>
            )}

            {active === 'preferencias' && (
              <div className="space-y-6">
                <SectionTitle title="Preferências" description="Idioma, comunicações e gerais." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField
                    label="Idioma"
                    value={form.locale}
                    onChange={v => setField('locale', v)}
                    disabled={saving}
                  />
                  <ToggleField
                    label="Receber comunicações"
                    checked={form.marketingOptIn}
                    onChange={v => setField('marketingOptIn', v)}
                    disabled={saving}
                  />
                </div>
              </div>
            )}

            {active === 'privacidade' && (
              <div className="space-y-6">
                <SectionTitle title="Privacidade (LGPD)" description="Consentimento e portabilidade (mock)." />
                <ToggleField
                  label="Aceito o tratamento dos meus dados"
                  checked={form.privacyConsent}
                  onChange={v => setField('privacyConsent', v)}
                  disabled={saving}
                />
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => alert('Download de dados (mock)')}>Baixar meus dados</button>
                  <button className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2" onClick={() => alert('Solicitar exclusão (mock)')}>
                    <Trash2 className="h-4 w-4" />
                    Solicitar exclusão
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Modal de alteração de senha */}
      <Modal
        isOpen={showPwdModal}
        onClose={() => setShowPwdModal(false)}
        title="Alterar senha"
        size="md"
      >
        <p className="text-sm text-gray-600">Preencha os campos para alterar sua senha (mock).</p>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Senha atual</span>
            <div className="mt-1 relative">
              <input
                type={pwdShow.current ? 'text' : 'password'}
                value={pwdForm.current}
                onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                aria-label={pwdShow.current ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setPwdShow(s => ({ ...s, current: !s.current }))}
              >
                {pwdShow.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Nova senha</span>
            <div className="mt-1 relative">
              <input
                type={pwdShow.next ? 'text' : 'password'}
                value={pwdForm.next}
                onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                aria-label={pwdShow.next ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setPwdShow(s => ({ ...s, next: !s.next }))}
              >
                {pwdShow.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwdForm.next && (
              <span className={`text-xs mt-1 inline-block ${passwordStrength(pwdForm.next).color}`}>
                Força: {passwordStrength(pwdForm.next).label}
              </span>
            )}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Confirmar nova senha</span>
            <div className="mt-1 relative">
              <input
                type={pwdShow.confirm ? 'text' : 'password'}
                value={pwdForm.confirm}
                onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                aria-label={pwdShow.confirm ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setPwdShow(s => ({ ...s, confirm: !s.confirm }))}
              >
                {pwdShow.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwdForm.confirm && pwdForm.next !== pwdForm.confirm && (
              <span className="text-xs text-red-600 mt-1 inline-block">As senhas não coincidem.</span>
            )}
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => setShowPwdModal(false)}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={async () => {
              if (!pwdForm.current || pwdForm.next.length < 8 || pwdForm.next !== pwdForm.confirm) return;
              setSaving(true);
              await new Promise(r => setTimeout(r, 900));
              setSaving(false);
              setShowPwdModal(false);
              setPwdForm({ current: '', next: '', confirm: '' });
              alert('Senha alterada com sucesso (mock).');
            }}
            disabled={!pwdForm.current || pwdForm.next.length < 8 || pwdForm.next !== pwdForm.confirm || saving}
          >
            Salvar
          </button>
        </div>
      </Modal>
    </div>
  );
};

// Subcomponentes simples e padronizados (mock)
const SectionTitle: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
  </div>
);

const TextField: React.FC<{
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ label, value, onChange, placeholder, disabled }) => (
  <label className="block">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
    />
  </label>
);

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange?: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}> = ({ label, value, onChange, min, max, disabled }) => (
  <label className="block">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange?.(Number(e.target.value))}
      min={min}
      max={max}
      disabled={disabled}
      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
    />
  </label>
);

const ToggleField: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}> = ({ label, description, checked, onChange, disabled }) => (
  <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-xl">
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
    </div>
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full relative transition-all disabled:opacity-50">
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? 'translate-x-5' : ''}`} />
      </div>
    </label>
  </div>
);

// Modal simples de alteração de senha (injetado ao final para manter o JSX organizado)
// OBS: por simplicidade, usamos o estado local deste arquivo.

export default Settings;
