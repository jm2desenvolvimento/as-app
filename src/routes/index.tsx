import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LayoutPage from '../pages/layoutpage/LayoutPage';
import ProfileAndPermissions from '../components/common/ProfileAndPermissions.tsx/ProfileAndPermissions';
import Home from '../pages/landingpage/Home';
import { Home as HomeIcon, Users, Calendar, FileText, Settings, User, Shield, Landmark, Building2, Stethoscope, CalendarIcon } from 'lucide-react';
import { PERMISSIONS, usePermission } from '../hooks/usePermission';
import CityHall from '../components/admin/municipalManagement/CityHall';
import HealthUnit from '../components/admin/municipalManagement/HealthUnit';
import MedicalSchedules from '../components/admin/municipalManagement/MedicalSchedules';
import HealthUnitDetails from '../components/admin/municipalManagement/HealthUnitDetails';
import Doctors from '../components/common/Doctors';
import Patients from '../components/common/Patients';
import MasterDashboard from '../components/master/Dashboard';
import MasterUsers from '../components/master/MasterUsers';
import PatientDashboard from '../components/patient/Dashboard';
import DoctorDashboard from '../components/doctor/Dashboard';
import DoctorSchedule from '../components/doctor/Schedule';
import History from '../components/patient/History';
import MedicalRecord from '../components/common/MedicalRecord';
import Profile from '../components/patient/Profile';
import Reports from '../components/common/Reports/Reports';
import SettingsView from '../components/common/Settings/Settings';

// Dashboards de exemplo
function AdminDashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center gap-4">
        <div className="text-blue-600 text-3xl">📊</div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500 text-base">Painel de controle administrativo</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unidades de Saúde</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Médicos</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Consultas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividades Recentes</h2>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">Nova unidade de saúde cadastrada</span>
            <span className="ml-auto text-xs text-gray-400">2 min atrás</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">Usuário admin criado</span>
            <span className="ml-auto text-xs text-gray-400">15 min atrás</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">Relatório mensal gerado</span>
            <span className="ml-auto text-xs text-gray-400">1 hora atrás</span>
          </div>
        </div>
      </div>
    </div>
  );
}


// PatientDashboard agora é importado do componente dedicado

// Páginas placeholder para outras funcionalidades
function UnitsPage() {
  return <div className="text-xl">Gestão de Unidades</div>;
}
function SchedulePage() {
  return <div className="text-xl">Agenda Médica</div>;
}
function PatientsPage() {
  return <div className="text-xl">Pacientes</div>;
}
function RecordsPage() {
  return <div className="text-xl">Prontuários</div>;
}
// Removido AppointmentsPage - funcionalidade unificada no History

// Wrapper simples para proteger rotas por role e/ou permissões
function RequireAccess({
  roles,
  permissions,
  requireAllPermissions = false,
  children,
}: {
  roles?: string[];
  permissions?: string[];
  requireAllPermissions?: boolean;
  children: React.ReactNode;
}) {
  const { hasAnyPermission, hasAllPermissions, hasRole } = usePermission();

  const roleOk = roles ? roles.some((r) => hasRole(r)) : true;
  const permOk = permissions
    ? requireAllPermissions
      ? hasAllPermissions(permissions as any)
      : hasAnyPermission(permissions as any)
    : true;

  if (!roleOk || !permOk) {
    return (
      <div className="p-8">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso negado</h2>
          <p className="text-gray-600">Você não possui permissões para acessar esta página.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function RoleSettingsRoute() {
  const { isMaster, isAdmin, isDoctor } = usePermission();
  const sidebar = isMaster() ? masterSidebar : isAdmin() ? adminSidebar : isDoctor() ? doctorSidebar : patientSidebar;
  return (
    <LayoutPage sidebarItems={sidebar}>
      <SettingsView />
    </LayoutPage>
  );
}

// Menus por role
const adminMunicipalManagementSubItems = [
  {
    label: 'Prefeituras',
    path: '/admin/municipal-management/city-hall',
    icon: <Landmark className="w-4 h-4" />,
    permissions: [PERMISSIONS.CITY_HALL_VIEW],
  },
  {
    label: 'Unidades de Saúde',
    path: '/admin/municipal-management/health-units',
    icon: <Building2 className="w-4 h-4" />,
    permissions: [PERMISSIONS.HEALTH_UNIT_VIEW],
  },
  {
    label: 'Escalas Médicas',
    path: '/admin/municipal-management/medical-schedules',
    icon: <Stethoscope className="w-4 h-4" />,
    permissions: [PERMISSIONS.MEDICAL_SCHEDULE_VIEW],
  },
];

const masterMunicipalManagementSubItems = [
  {
    label: 'Prefeituras',
    path: '/master/municipal-management/city-hall',
    icon: <Landmark className="w-4 h-4" />,
    permissions: [PERMISSIONS.CITY_HALL_VIEW]
  },
  {
    label: 'Unidades de Saúde',
    path: '/master/municipal-management/health-units',
    icon: <Building2 className="w-4 h-4" />,
    permissions: [PERMISSIONS.HEALTH_UNIT_VIEW],
  },
  {
    label: 'Escalas Médicas',
    path: '/master/municipal-management/medical-schedules',
    icon: <Stethoscope className="w-4 h-4" />,
    permissions: [PERMISSIONS.MEDICAL_SCHEDULE_VIEW],
  },
];

const masterSidebar = [
  { label: 'Dashboard', path: '/master/dashboard', icon: <HomeIcon /> },
  {
    label: 'Gestão Municipal',
    path: '/master/municipal-management',
    icon: <Landmark />,
    roles: ['ADMIN', 'MASTER'],
    subItems: masterMunicipalManagementSubItems,
  },
  { 
    label: 'Gestão de Usuários', 
    path: '/master/users', 
    icon: <Users />, 
    permissions: [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_LIST]
  },
  {
    label: 'Médicos',
    path: '/master/municipal-management/doctors',
    icon: <Stethoscope />,
    permissions: [PERMISSIONS.DOCTOR_VIEW, PERMISSIONS.DOCTOR_LIST],
  },
  {
    label: 'Pacientes',
    path: '/master/municipal-management/patients',
    icon: <Users />,
    permissions: [PERMISSIONS.PATIENT_VIEW, PERMISSIONS.PATIENT_LIST],
  },
  { 
    label: 'Prontuários', 
    path: '/master/medical-record', 
    icon: <FileText />, 
    permissions: [PERMISSIONS.MEDICAL_RECORD_VIEW, PERMISSIONS.MEDICAL_RECORD_LIST]
  },
  { 
    label: 'Perfis e Permissões', 
    path: '/master/permissions', 
    icon: <Shield />
  },
  { 
    label: 'Relatórios', 
    path: '/master/reports', 
    icon: <FileText />, 
    permissions: [PERMISSIONS.REPORT_VIEW, PERMISSIONS.REPORT_GENERATE]
  },
  { 
    label: 'Configurações', 
    path: '/settings', 
    icon: <Settings />,
    group: 'system',
    permissions: [PERMISSIONS.CONFIG_VIEW]
  },
];

const adminSidebar = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <HomeIcon /> },
  {
    label: 'Gestão Municipal',
    path: '/admin/municipal-management',
    icon: <Landmark />,
    roles: ['ADMIN', 'MASTER'],
    subItems: adminMunicipalManagementSubItems,
  },
  {
    label: 'Médicos',
    path: '/admin/municipal-management/doctors',
    icon: <Stethoscope />,
    permissions: [PERMISSIONS.DOCTOR_VIEW, PERMISSIONS.DOCTOR_LIST],
  },
  {
    label: 'Pacientes',
    path: '/admin/municipal-management/patients',
    icon: <Users />,
    permissions: [PERMISSIONS.PATIENT_VIEW, PERMISSIONS.PATIENT_LIST],
  },
  { 
    label: 'Prontuários', 
    path: '/admin/medical-record', 
    icon: <FileText />, 
    permissions: [PERMISSIONS.MEDICAL_RECORD_VIEW, PERMISSIONS.MEDICAL_RECORD_LIST]
  },
  { 
    label: 'Perfis e Permissões', 
    path: '/admin/permissions', 
    icon: <Shield />, 
    permissions: [PERMISSIONS.USER_PERMISSION_MANAGE, PERMISSIONS.ROLE_VIEW]
  },
  { 
    label: 'Relatórios', 
    path: '/admin/reports', 
    icon: <FileText />, 
    permissions: [PERMISSIONS.REPORT_VIEW, PERMISSIONS.REPORT_GENERATE]
  },
  { 
    label: 'Configurações', 
    path: '/settings', 
    icon: <Settings />,
    group: 'system',
    permissions: [PERMISSIONS.CONFIG_VIEW]
  },
];

const doctorSidebar = [
  { 
    label: 'Dashboard', 
    path: '/doctor/dashboard', 
    icon: <HomeIcon />,
    permissions: [PERMISSIONS.DASHBOARD_DOCTOR_VIEW]
  },
  { 
    label: 'Agenda', 
    path: '/doctor/schedule', 
    icon: <CalendarIcon />,
    permissions: [PERMISSIONS.DOCTOR_SCHEDULE_VIEW]
  },
  { 
    label: 'Prontuários', 
    path: '/doctor/medical-record', 
    icon: <FileText />, 
    permissions: [PERMISSIONS.MEDICAL_RECORD_VIEW, PERMISSIONS.MEDICAL_RECORD_LIST]
  },
  { 
    label: 'Relatórios', 
    path: '/doctor/reports', 
    icon: <FileText />, 
    permissions: [PERMISSIONS.REPORT_VIEW]
  },
  { 
    label: 'Configurações', 
    path: '/settings', 
    icon: <Settings />, 
    permissions: [PERMISSIONS.CONFIG_VIEW]
  },
];

const patientSidebar = [
  { label: 'Dashboard', path: '/patient/dashboard', icon: <HomeIcon /> },
  { 
    label: 'Minhas Consultas', 
    path: '/patient/history', 
    icon: <Calendar />, 
    permissions: [PERMISSIONS.PATIENT_HISTORY_VIEW]
  },
  { 
    label: 'Prontuário Médico', 
    path: '/patient/medical-record', 
    icon: <FileText />, 
    permissions: [PERMISSIONS.MEDICAL_RECORD_VIEW]
  },
  { 
    label: 'Relatórios', 
    path: '/patient/reports', 
    icon: <FileText />, 
    permissions: [PERMISSIONS.REPORT_VIEW]
  },
  { 
    label: 'Meu Perfil', 
    path: '/patient/profile', 
    icon: <User />, 
    permissions: [PERMISSIONS.PROFILE_VIEW, PERMISSIONS.PROFILE_UPDATE]
  },
];

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Redirecionamentos raiz */}
        <Route path="/master" element={<Navigate to="/master/dashboard" replace />} />
        <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
        {/* Rota para a página inicial */}
        <Route path="/" element={<Home />} />
        
        <Route path="/settings" element={<RoleSettingsRoute />} />
        {/* Dashboards de cada role */}
        <Route path="/master/dashboard" element={
          <LayoutPage sidebarItems={masterSidebar}>
            <MasterDashboard />
          </LayoutPage>
        } />
        <Route path="/admin/dashboard" element={
          <LayoutPage sidebarItems={adminSidebar}>
            <AdminDashboard />
          </LayoutPage>
        } />
        <Route path="/doctor/dashboard" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <DoctorDashboard />
          </LayoutPage>
        } />
        <Route path="/doctor/schedule" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <DoctorSchedule />
          </LayoutPage>
        } />
        <Route path="/patient/dashboard" element={
          <LayoutPage sidebarItems={patientSidebar}>
            <PatientDashboard />
          </LayoutPage>
        } />
        
        {/* Páginas RBAC */}
        <Route path="/master/permissions" element={
          <LayoutPage sidebarItems={masterSidebar}>
            <ProfileAndPermissions />
          </LayoutPage>
        } />
        <Route path="/master/medical-record" element={
          <LayoutPage sidebarItems={masterSidebar}>
            <MedicalRecord />
          </LayoutPage>
        } />
        <Route path="/master/medical-record/:patientId" element={
          <LayoutPage sidebarItems={masterSidebar}>
            <MedicalRecord />
          </LayoutPage>
        } />
        <Route path="/admin/permissions" element={
          <LayoutPage sidebarItems={adminSidebar}>
            <ProfileAndPermissions />
          </LayoutPage>
        } />
        
        {/* Outras páginas do Master */}
        <Route path="/master/users" element={
          <LayoutPage sidebarItems={masterSidebar}>
            <RequireAccess roles={['MASTER']} permissions={[PERMISSIONS.USER_VIEW, PERMISSIONS.USER_LIST]}>
              <MasterUsers />
            </RequireAccess>
          </LayoutPage>
        } />
        <Route path="/master/reports" element={
          <LayoutPage sidebarItems={masterSidebar}>
            <Reports />
          </LayoutPage>
        } />
        <Route path="/master/settings" element={<Navigate to="/settings" replace />} />
        
        {/* Outras páginas do Admin */}
        <Route path="/admin/units" element={
          <LayoutPage sidebarItems={adminSidebar}>
            <UnitsPage />
          </LayoutPage>
        } />
        <Route path="/admin/medical-record" element={
          <LayoutPage sidebarItems={adminSidebar}>
            <MedicalRecord />
          </LayoutPage>
        } />
        <Route path="/admin/medical-record/:patientId" element={
          <LayoutPage sidebarItems={adminSidebar}>
            <MedicalRecord />
          </LayoutPage>
        } />
        <Route path="/admin/reports" element={
          <LayoutPage sidebarItems={adminSidebar}>
            <Reports />
          </LayoutPage>
        } />
        <Route path="/admin/settings" element={<Navigate to="/settings" replace />} />
        
        {/* Páginas do Doctor */}
        <Route path="/doctor/schedule" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <SchedulePage />
          </LayoutPage>
        } />
        <Route path="/doctor/patients" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <PatientsPage />
          </LayoutPage>
        } />
        <Route path="/doctor/medical-record" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <MedicalRecord />
          </LayoutPage>
        } />
        <Route path="/doctor/medical-record/:patientId" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <MedicalRecord />
          </LayoutPage>
        } />
        <Route path="/doctor/records" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <RecordsPage />
          </LayoutPage>
        } />
        <Route path="/doctor/appointments" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <SchedulePage />
          </LayoutPage>
        } />
        <Route path="/doctor/appointments/new" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <SchedulePage />
          </LayoutPage>
        } />
        <Route path="/doctor/telemedicine" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <SchedulePage />
          </LayoutPage>
        } />
        <Route path="/doctor/medical-records" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <MedicalRecord />
          </LayoutPage>
        } />
        <Route path="/doctor/chat" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <SchedulePage />
          </LayoutPage>
        } />
        <Route path="/doctor/reports" element={
          <LayoutPage sidebarItems={doctorSidebar}>
            <Reports />
          </LayoutPage>
        } />
        <Route path="/doctor/settings" element={<Navigate to="/settings" replace />} />
        
        {/* Páginas do Patient */}
        <Route path="/patient/history" element={
          <LayoutPage sidebarItems={patientSidebar}>
            <History />
          </LayoutPage>
        } />
        <Route path="/patient/medical-record" element={
          <LayoutPage sidebarItems={patientSidebar}>
            <MedicalRecord />
          </LayoutPage>
        } />
        <Route path="/patient/medical-record/:patientId" element={
          <LayoutPage sidebarItems={patientSidebar}>
            <MedicalRecord />
          </LayoutPage>
        } />
        <Route path="/patient/profile" element={
          <LayoutPage sidebarItems={patientSidebar}>
            <Profile />
          </LayoutPage>
        } />
        <Route path="/patient/reports" element={
          <LayoutPage sidebarItems={patientSidebar}>
            <Reports />
          </LayoutPage>
        } />
        
        {/* Rotas para as abas de Gestão Municipal */}
        <Route path="/admin/municipal-management/city-hall" element={
          <LayoutPage sidebarItems={adminSidebar}>
            <CityHall />
          </LayoutPage>
        } />
        <Route path="/admin/municipal-management/health-units" element={
          <LayoutPage sidebarItems={adminSidebar}>
            <HealthUnit />
          </LayoutPage>
        } />
        <Route path="/admin/municipal-management/medical-schedules" element={
          <LayoutPage sidebarItems={adminSidebar}>
            <MedicalSchedules />
          </LayoutPage>
        } />
        <Route path="/master/municipal-management/medical-schedules" element={
          <LayoutPage sidebarItems={masterSidebar}>
            <MedicalSchedules />
          </LayoutPage>
        } />
        <Route path="/admin/municipal-management/doctors" element={
          <LayoutPage sidebarItems={adminSidebar}>
            <Doctors />
          </LayoutPage>
        } />
        <Route path="/admin/municipal-management/patients" element={
          <LayoutPage sidebarItems={adminSidebar}>
            <Patients />
          </LayoutPage>
        } />
        <Route path="/admin/municipal-management/health-unit/:id" element={
          <LayoutPage sidebarItems={adminSidebar}>
            <HealthUnitDetails />
          </LayoutPage>
        } />
        <Route path="/master/municipal-management/doctors" element={
          <LayoutPage sidebarItems={masterSidebar}>
            <Doctors />
          </LayoutPage>
        } />
        <Route path="/master/municipal-management/patients" element={
          <LayoutPage sidebarItems={masterSidebar}>
            <Patients />
          </LayoutPage>
        } />
        <Route path="/master/municipal-management/health-unit/:id" element={
          <LayoutPage sidebarItems={masterSidebar}>
            <HealthUnitDetails />
          </LayoutPage>
        } />
        {/* Para o master, pode-se repetir as rotas se desejar acesso total */}
        <Route path="/master/municipal-management/city-hall" element={
          <LayoutPage sidebarItems={masterSidebar}>
            <CityHall />
          </LayoutPage>
        } />
        <Route path="/master/municipal-management/health-units" element={
          <LayoutPage sidebarItems={masterSidebar}>
            <HealthUnit />
          </LayoutPage>
        } />
        
        {/* Outras rotas públicas ou de fallback podem ser adicionadas aqui */}
      </Routes>
    </Router>
  );
} 