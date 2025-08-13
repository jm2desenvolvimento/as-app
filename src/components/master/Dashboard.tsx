import React from "react";
import StatCard from "./StatCard";
import { Users, UserCheck, Hospital, GraduationCap, TrendingUp, Calendar, CheckCircle, AlertCircle, Building2, Edit, Trash2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useState } from 'react';
import { BarChart as BarChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import { usePermission, PERMISSIONS } from '../../hooks/usePermission';

const stats = [
  {
    icon: <Users size={28} />, label: "Pacientes Cadastrados", value: 5, colorClass: "text-blue-500 bg-blue-100 border-b-4 border-blue-400"
  },
  {
    icon: <UserCheck size={28} />, label: "Profissionais Ativos", value: 5, colorClass: "text-green-500 bg-green-100 border-b-4 border-green-400"
  },
  {
    icon: <Hospital size={28} />, label: "Unidades de Saúde", value: 7, colorClass: "text-purple-500 bg-purple-100 border-b-4 border-purple-400"
  },
  {
    icon: <GraduationCap size={28} />, label: "Especialidades", value: 8, colorClass: "text-yellow-500 bg-yellow-100 border-b-4 border-yellow-400"
  },
];

const activities = [
  {
    type: "success",
    title: "Nova Consulta Agendada",
    desc: "Paciente Maria Silva agendou consulta com Dr. Carlos",
    date: "11 de abril às 12:32",
  },
  {
    type: "warning",
    title: "Alerta do Sistema",
    desc: "Alto volume de consultas detectado",
    date: "11 de abril às 11:15",
  },
  {
    type: "info",
    title: "Nova Unidade",
    desc: "UBS Vila Nova foi cadastrada",
    date: "11 de abril às 10:22",
  },
];

type StatusType = "Aguardando" | "Confirmado" | "Cancelado";
interface Appointment {
  time: string;
  patient: string;
  service: string;
  professional: string;
  status: StatusType;
}
const nextAppointments: Appointment[] = [
  { time: "09:00", patient: "João Silva", service: "Clínica Geral", professional: "Dra. Maria Santos", status: "Aguardando" },
  { time: "10:30", patient: "Ana Souza", service: "Pediatria", professional: "Dr. Paulo Lima", status: "Confirmado" },
  { time: "11:15", patient: "Carlos Mendes", service: "Cardiologia", professional: "Dra. Fernanda Alves", status: "Cancelado" },
];
const statusColors: Record<StatusType, string> = {
  Aguardando: "bg-blue-100 text-blue-600",
  Confirmado: "bg-green-100 text-green-600",
  Cancelado: "bg-red-100 text-red-600",
};

const ActivityIcon = ({ type }: { type: string }) => {
  if (type === "success") return <CheckCircle className="text-green-500" size={20} />;
  if (type === "warning") return <AlertCircle className="text-yellow-500" size={20} />;
  return <Building2 className="text-blue-500" size={20} />;
};

const MasterDashboard: React.FC = () => {
  const { hasPermission, hasRole, user } = usePermission();
  
  // Log para debug
  console.log('[MasterDashboard] User:', user);
  console.log('[MasterDashboard] User permissions:', user?.permissions);
  console.log('[MasterDashboard] User role:', user?.role);
  
  // Verificar se é MASTER ou tem a permissão específica
  if (!hasRole('MASTER') && !hasPermission('dashboard_master_view')) {
    console.log('[MasterDashboard] Acesso negado - não é MASTER nem tem permissão');
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        Você não tem permissão para acessar este dashboard.
      </div>
    );
  }
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const chartData = [
    { month: 'Jan', agendadas: 80, realizadas: 70, canceladas: 10, taxa: 87.5 },
    { month: 'Feb', agendadas: 90, realizadas: 85, canceladas: 5, taxa: 94.4 },
    { month: 'Mar', agendadas: 100, realizadas: 95, canceladas: 5, taxa: 95.0 },
    { month: 'Apr', agendadas: 110, realizadas: 100, canceladas: 10, taxa: 90.9 },
    { month: 'May', agendadas: 120, realizadas: 110, canceladas: 10, taxa: 91.7 },
    { month: 'Jun', agendadas: 130, realizadas: 120, canceladas: 10, taxa: 92.3 },
  ];
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <TrendingUp className="text-blue-600" size={36} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-base">Visão geral do sistema e principais indicadores</p>
        </div>
      </div>

      {/* Cards Estatísticos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className={`flex items-center bg-white rounded-xl shadow p-5 min-w-[220px] border-b-4 ${stat.colorClass} transition hover:scale-105 hover:shadow-lg`}>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 text-2xl ${stat.colorClass.replace('border-b-4', '')}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico de Desempenho */}
        <div className="col-span-2 bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-500" size={20} /> Desempenho Geral das Consultas
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded text-sm text-gray-600 border border-gray-200 hover:bg-gray-200">
                Últimos 6 Meses
              </button>
              <button
                className={`ml-2 p-2 rounded ${chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} hover:bg-blue-200`}
                title="Gráfico de Linhas"
                onClick={() => setChartType('line')}
              >
                <LineChartIcon size={20} />
              </button>
              <button
                className={`ml-1 p-2 rounded ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} hover:bg-blue-200`}
                title="Gráfico de Barras"
                onClick={() => setChartType('bar')}
              >
                <BarChartIcon size={20} />
              </button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="agendadas" stroke="#3b82f6" name="Agendadas" />
                  <Line type="monotone" dataKey="realizadas" stroke="#22c55e" name="Realizadas" />
                  <Line type="monotone" dataKey="canceladas" stroke="#ef4444" name="Canceladas" />
                  <Line type="monotone" dataKey="taxa" stroke="#facc15" name="Taxa de Realização" dot={false} strokeDasharray="5 5" />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="agendadas" fill="#3b82f6" name="Consultas Agendadas" />
                  <Bar dataKey="realizadas" fill="#22c55e" name="Consultas Realizadas" />
                  <Bar dataKey="canceladas" fill="#ef4444" name="Consultas Canceladas" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4">
            <span className="flex items-center gap-1 text-blue-500 text-xs font-medium"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span>Agendadas</span>
            <span className="flex items-center gap-1 text-green-500 text-xs font-medium"><span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>Realizadas</span>
            <span className="flex items-center gap-1 text-red-500 text-xs font-medium"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>Canceladas</span>
            <span className="flex items-center gap-1 text-yellow-500 text-xs font-medium"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>Taxa de Realização</span>
          </div>
        </div>
        {/* Atividades Recentes */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-500" size={20} /> Atividades Recentes
            </span>
            <a href="#" className="text-blue-600 text-sm font-medium hover:underline">Ver todas →</a>
          </div>
          <ul className="space-y-4">
            {activities.map((a, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <ActivityIcon type={a.type} />
                <div>
                  <div className="font-medium text-gray-700">{a.title}</div>
                  <div className="text-gray-500 text-sm">{a.desc}</div>
                  <div className="text-gray-400 text-xs mt-1">{a.date}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Próximas Consultas */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-lg text-gray-800 flex items-center gap-2">
            <Calendar className="text-blue-500" size={20} /> Próximas Consultas
          </span>
          <a href="#" className="text-blue-600 text-sm font-medium hover:underline">Ver todas →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-2 px-3 text-left">HORA</th>
                <th className="py-2 px-3 text-left">PACIENTE</th>
                <th className="py-2 px-3 text-left">SERVIÇO</th>
                <th className="py-2 px-3 text-left">PROFISSIONAL</th>
                <th className="py-2 px-3 text-left">STATUS</th>
                <th className="py-2 px-3 text-left">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {nextAppointments.map((a, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{a.time}</td>
                  <td className="py-2 px-3">{a.patient}</td>
                  <td className="py-2 px-3">{a.service}</td>
                  <td className="py-2 px-3">{a.professional}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="py-2 px-3 flex gap-2">
                    <button className="p-1 rounded hover:bg-blue-100"><Edit className="w-4 h-4 text-blue-500" /></button>
                    <button className="p-1 rounded hover:bg-red-100"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
