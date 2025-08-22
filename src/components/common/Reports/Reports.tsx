import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { FileDown, CalendarCheck2, Users, Activity, ShieldAlert, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { PERMISSIONS, usePermission } from '../../../hooks/usePermission';
import { PageHeader } from '../../ui';

type Role = 'MASTER' | 'ADMIN' | 'DOCTOR' | 'PATIENT' | string | undefined;

type Filters = {
  range: '7d' | '30d' | '90d';
  from: Date;
  to: Date;
  vision: 'global' | 'city' | 'unit';
  cityId?: string | null;
  healthUnitId?: string | null;
  doctorId?: string | null;
  specialtyId?: string | null;
  status?: 'CONCLUIDA' | 'CANCELADA' | 'FALTA' | string | null;
  kind?: 'PRESENCIAL' | 'TELEMEDICINA' | string | null;
};

type KpiItem = {
  key: string;
  label: string;
  value: number;
  delta?: number; // variação absoluta
  icon?: React.ReactNode;
};

type SeriesPoint = { x: string; y: number };

type ChartSeries = { name: string; color?: string; data: SeriesPoint[] };

type ChartBlock = { id: string; title: string; type: 'line' | 'bar' | 'pie'; series: ChartSeries[] };

type OverviewResponse = {
  kpis: KpiItem[];
  charts: ChartBlock[];
  lists?: {
    topDiagnoses?: { name: string; count: number }[];
    upcomingAppointments?: { id: string; patient: string; date: string; status: string }[];
  };
};

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6'];

// Formatadores e helpers visuais
const NF = new Intl.NumberFormat('pt-BR');
const PERCENT_KEYS = new Set(['attendanceRate', 'cancellationsRate', 'noShowRate', 'growthPct']);

// Mock de opções de filtro (substituir por chamadas reais quando disponíveis)
const MOCK_CITIES = [
  { id: '1', name: 'Município A' },
  { id: '2', name: 'Município B' },
  { id: '3', name: 'Município C' },
];
const MOCK_UNITS: Record<string, { id: string; name: string }[]> = {
  '1': [
    { id: 'u1', name: 'UBS Centro' },
    { id: 'u2', name: 'Policlínica Norte' },
  ],
  '2': [
    { id: 'u3', name: 'Hospital Municipal' },
  ],
  '3': [
    { id: 'u4', name: 'UBS Sul' },
  ],
};
const MOCK_SPECIALTIES = [
  { id: 'clin', name: 'Clínica Geral' },
  { id: 'cardio', name: 'Cardiologia' },
  { id: 'derm', name: 'Dermatologia' },
  { id: 'pedia', name: 'Pediatria' },
];
const MOCK_DOCTORS = [
  { id: 'd1', name: 'Dr. João Silva' },
  { id: 'd2', name: 'Dra. Maria Souza' },
  { id: 'd3', name: 'Dr. Carlos Lima' },
];

function toLabel(d: Date) {
  return format(d, 'dd/MM');
}

function buildDefaultFilters(role: Role, scope: { city_id?: string | null; health_unit_id?: string | null; id?: string | null }): Filters {
  const to = new Date();
  const from = subDays(to, 29);
  const vision: Filters['vision'] = role === 'MASTER' ? 'global' : role === 'ADMIN' ? 'city' : role === 'DOCTOR' ? 'unit' : 'global';
  return {
    range: '30d',
    from,
    to,
    vision,
    cityId: role === 'MASTER' || role === 'ADMIN' ? scope.city_id ?? null : null,
    healthUnitId: role === 'MASTER' || role === 'ADMIN' || role === 'DOCTOR' ? scope.health_unit_id ?? null : null,
    doctorId: role === 'DOCTOR' ? (scope?.id ?? null) : null,
    specialtyId: null,
    status: null,
    kind: null,
  };
}

function mockOverview(role: Role, filters: Filters): OverviewResponse {
  const days = 1 + Math.round((filters.to.getTime() - filters.from.getTime()) / (1000 * 60 * 60 * 24));
  const labels: string[] = Array.from({ length: days }, (_, i) => toLabel(subDays(filters.to, days - 1 - i)));
  const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1));

  const baseKpis: KpiItem[] = [
    { key: 'appointments', label: 'Atendimentos', value: rand(80, 240), delta: rand(-12, 18), icon: <CalendarCheck2 className="h-5 w-5 text-blue-600" /> },
    { key: 'patients', label: 'Pacientes Ativos', value: rand(120, 520), delta: rand(-10, 22), icon: <Users className="h-5 w-5 text-emerald-600" /> },
    { key: 'records', label: 'Prontuários Criados', value: rand(20, 110), delta: rand(-15, 25), icon: <Activity className="h-5 w-5 text-violet-600" /> },
    { key: 'noshow', label: 'Faltas (No-show)', value: rand(3, 25), delta: rand(-10, 20), icon: <Activity className="h-5 w-5 text-amber-600" /> },
  ];

  const doctorKpis: KpiItem[] = [
    { key: 'my_appointments', label: 'Minhas Consultas', value: rand(30, 90), delta: rand(-12, 18), icon: <CalendarCheck2 className="h-5 w-5 text-blue-600" /> },
    { key: 'my_patients', label: 'Pacientes Atendidos', value: rand(20, 70), delta: rand(-10, 22), icon: <Users className="h-5 w-5 text-emerald-600" /> },
    { key: 'my_prescriptions', label: 'Prescrições Emitidas', value: rand(10, 40), delta: rand(-15, 25), icon: <FileDown className="h-5 w-5 text-violet-600" /> },
    { key: 'my_noshow', label: 'Faltas (meus)', value: rand(2, 10), delta: rand(-10, 20), icon: <Activity className="h-5 w-5 text-amber-600" /> },
  ];

  const patientKpis: KpiItem[] = [
    { key: 'next_appointments', label: 'Próximas Consultas', value: rand(1, 3), icon: <CalendarCheck2 className="h-5 w-5 text-blue-600" /> },
    { key: 'past_appointments', label: 'Consultas Passadas', value: rand(3, 8), icon: <Users className="h-5 w-5 text-emerald-600" /> },
    { key: 'exams_available', label: 'Exames Disponíveis', value: rand(0, 5), icon: <FileDown className="h-5 w-5 text-violet-600" /> },
  ];

  let kpis = baseKpis;
  if (role === 'DOCTOR') kpis = doctorKpis;
  if (role === 'PATIENT') kpis = patientKpis;
  if (role === 'MASTER') {
    kpis = [
      { key: 'scheduled', label: 'Consultas agendadas', value: rand(500, 3000), delta: rand(-8, 18), icon: <CalendarCheck2 className="h-5 w-5 text-blue-600" /> },
      { key: 'attendanceRate', label: 'Comparecimento (%)', value: rand(70, 95), delta: rand(-5, 8), icon: <TrendingUp className="h-5 w-5 text-emerald-600" /> },
      { key: 'cancellationsRate', label: 'Cancelamentos (%)', value: rand(2, 18), delta: rand(-5, 8), icon: <TrendingDown className="h-5 w-5 text-amber-600" /> },
      { key: 'noShowRate', label: 'No-show (%)', value: rand(3, 20), delta: rand(-5, 8), icon: <TrendingDown className="h-5 w-5 text-rose-600" /> },
      { key: 'avgWait', label: 'Espera média (min)', value: rand(5, 30), delta: rand(-5, 8), icon: <Activity className="h-5 w-5 text-violet-600" /> },
      { key: 'activeDoctors', label: 'Médicos ativos', value: rand(30, 200), delta: rand(-8, 18), icon: <Users className="h-5 w-5 text-blue-600" /> },
      { key: 'activeUnits', label: 'Unidades ativas', value: rand(5, 50), delta: rand(-8, 18), icon: <Users className="h-5 w-5 text-indigo-600" /> },
      { key: 'activePatients', label: 'Pacientes ativos', value: rand(800, 6000), delta: rand(-8, 18), icon: <Users className="h-5 w-5 text-emerald-600" /> },
      { key: 'growthPct', label: 'Crescimento (%)', value: rand(-10, 25), delta: rand(-5, 8), icon: <TrendingUp className="h-5 w-5 text-blue-600" /> },
    ];
  }

  const makeSeries = (name: string, color: string): ChartSeries => ({
    name,
    color,
    data: labels.map((l) => ({ x: l, y: rand(5, 30) })),
  });

  const charts: ChartBlock[] = [
    { id: 'line1', title: 'Evolução de Consultas', type: 'line', series: [makeSeries('Consultas', COLORS[0])] },
    {
      id: 'bar1',
      title: 'Agendamentos por Status',
      type: 'bar',
      series: [
        { name: 'Concluídas', color: COLORS[1], data: labels.map((l) => ({ x: l, y: rand(3, 15) })) },
        { name: 'Canceladas', color: COLORS[3], data: labels.map((l) => ({ x: l, y: rand(0, 6) })) },
        { name: 'No-show', color: COLORS[2], data: labels.map((l) => ({ x: l, y: rand(0, 5) })) },
      ],
    },
    {
      id: 'pie1',
      title: 'Distribuição por Especialidade',
      type: 'pie',
      series: [
        {
          name: 'Especialidades',
          data: [
            { x: 'Clínica', y: rand(10, 30) },
            { x: 'Cardiologia', y: rand(5, 20) },
            { x: 'Dermato', y: rand(5, 15) },
            { x: 'Pediatria', y: rand(5, 25) },
          ],
        },
      ],
    },
  ];

  if (role === 'MASTER') {
    charts.push(
      {
        id: 'bar_capacity_demand',
        title: 'Capacidade x Demanda',
        type: 'bar',
        series: [
          { name: 'Capacidade', color: COLORS[4], data: labels.map((l) => ({ x: l, y: rand(10, 25) })) },
          { name: 'Demanda', color: COLORS[0], data: labels.map((l) => ({ x: l, y: rand(12, 30) })) },
        ],
      },
    );
  }

  const lists: OverviewResponse['lists'] = {
    topDiagnoses: [
      { name: 'Hipertensão', count: rand(10, 25) },
      { name: 'Diabetes', count: rand(8, 20) },
      { name: 'Asma', count: rand(5, 15) },
      { name: 'Dermatite', count: rand(3, 12) },
    ],
    upcomingAppointments: [
      { id: '1', patient: 'João Silva', date: format(subDays(new Date(), -1), 'dd/MM/yyyy HH:mm'), status: 'CONFIRMADO' },
      { id: '2', patient: 'Maria Souza', date: format(subDays(new Date(), -2), 'dd/MM/yyyy HH:mm'), status: 'PENDENTE' },
      { id: '3', patient: 'Carlos Lima', date: format(subDays(new Date(), -3), 'dd/MM/yyyy HH:mm'), status: 'CONFIRMADO' },
    ],
  };

  if (role === 'MASTER') {
    (lists as any).rankCitiesByAppointments = MOCK_CITIES.map((c) => ({ name: c.name, count: rand(100, 2000) })).sort((a, b) => b.count - a.count);
    (lists as any).rankCitiesByNoShow = MOCK_CITIES.map((c) => ({ name: c.name, rate: rand(3, 20) })).sort((a, b) => b.rate - a.rate);
    (lists as any).topDoctors = MOCK_DOCTORS.map((d) => ({ name: d.name, count: rand(50, 300) })).sort((a, b) => b.count - a.count).slice(0, 10);
  }

  return { kpis, charts, lists };
}

function mergeSeries(series: ChartSeries[]) {
  const labelSet = new Set<string>();
  series.forEach((s) => s.data.forEach((p) => labelSet.add(p.x)));
  const labels = Array.from(labelSet);
  return labels.map((label) => {
    const row: Record<string, any> = { label };
    series.forEach((s) => {
      const found = s.data.find((p) => p.x === label);
      row[s.name] = found ? found.y : 0;
    });
    return row;
  });
}

const KpiCard: React.FC<{ item: KpiItem }> = ({ item }) => {
  const trendPositive = (item.delta ?? 0) >= 0;
  const isPercent = PERCENT_KEYS.has(item.key) || /%/.test(item.label);
  const formatted = isPercent ? `${NF.format(item.value)}%` : NF.format(item.value);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-slate-200">
      <div className="flex items-center justify-between">
        <div className="text-slate-500">{item.label}</div>
        <div className="p-2 rounded-lg bg-slate-50">{item.icon}</div>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-2xl font-semibold text-slate-900">{formatted}</div>
        {typeof item.delta === 'number' && (
          <div className={`inline-flex items-center gap-1 text-sm ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{Math.abs(item.delta)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ChartCard: React.FC<{ block: ChartBlock }> = ({ block }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-slate-200">
      <div className="mb-3 font-medium text-slate-700">{block.title}</div>
      <div className="h-64">
        {block.type === 'line' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergeSeries(block.series)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip formatter={(v: any) => NF.format(Number(v))} labelFormatter={(l: any) => l} />
              <Legend />
              {block.series.map((s, idx) => (
                <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color || COLORS[idx % COLORS.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
        {block.type === 'bar' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mergeSeries(block.series)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip formatter={(v: any) => NF.format(Number(v))} labelFormatter={(l: any) => l} />
              <Legend />
              {block.series.map((s, idx) => (
                <Bar key={s.name} dataKey={s.name} fill={s.color || COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
        {block.type === 'pie' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(v: any) => NF.format(Number(v))} />
              <Legend />
              <Pie dataKey="y" nameKey="x" data={block.series[0]?.data || []} outerRadius={90} innerRadius={50} paddingAngle={4}>
                {(block.series[0]?.data || []).map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const TableCard: React.FC<{ title: string; columns: string[]; rows: React.ReactNode[][] }> = ({ title, columns, rows }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-slate-200">
    <div className="mb-3 font-medium text-slate-700">{title}</div>
    <div className="overflow-auto max-h-80">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50">
          <tr className="text-left text-slate-600">
            {columns.map((c) => (
              <th key={c} className="py-2.5 px-3 font-semibold uppercase text-xs tracking-wide">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100 odd:bg-slate-50/50 hover:bg-slate-50 transition-colors">
              {r.map((cell, j) => {
                if (typeof cell === 'string') {
                  const v = cell.toUpperCase();
                  const pillMap: Record<string, string> = {
                    CONFIRMADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    PENDENTE: 'bg-amber-50 text-amber-700 border-amber-200',
                    CANCELADO: 'bg-rose-50 text-rose-700 border-rose-200',
                    CANCELADA: 'bg-rose-50 text-rose-700 border-rose-200',
                  };
                  const klass = pillMap[v];
                  return (
                    <td key={j} className="py-2.5 px-3 text-slate-700">
                      {klass ? (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${klass}`}>{cell}</span>
                      ) : (
                        cell
                      )}
                    </td>
                  );
                }
                return (
                  <td key={j} className="py-2.5 px-3 text-slate-700">{cell}</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RangeButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg border text-sm ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
  >
    {children}
  </button>
);

const Reports: React.FC = () => {
  const { user } = useAuthStore();
  const role: Role = user?.role;
  const { hasPermission } = usePermission();

  const canView = hasPermission(PERMISSIONS.REPORT_VIEW);
  const canExport = hasPermission(PERMISSIONS.REPORT_EXPORT);
  const canGenerate = hasPermission(PERMISSIONS.REPORT_GENERATE);

  const [filters, setFilters] = useState<Filters>(() => buildDefaultFilters(role, {
    city_id: user?.city_id ?? null,
    health_unit_id: user?.health_unit_id ?? null,
    id: user?.id ?? null,
  }));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OverviewResponse>(() => mockOverview(role, filters));
  const [refreshTick, setRefreshTick] = useState<number>(0);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tendencias' | 'eficiencia' | 'capacidade' | 'distribuicao'>('tendencias');

  useEffect(() => {
    if (!canView) return;
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Substituir por chamada real ao backend quando os endpoints estiverem disponíveis
        const overview: OverviewResponse = mockOverview(role, filters);
        if (mounted) setData(overview);
      } catch (e: any) {
        console.warn('[Reports] Falha na API. Usando MOCK. Erro:', e?.message);
        if (mounted) setData(mockOverview(role, filters));
        if (mounted) setError(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.range,
    filters.from.getTime(),
    filters.to.getTime(),
    filters.vision,
    filters.cityId,
    filters.healthUnitId,
    filters.doctorId,
    filters.specialtyId,
    filters.status,
    filters.kind,
    role,
    canView,
    refreshTick,
  ]);

  const onSelectRange = (range: Filters['range']) => {
    if (range === filters.range) return;
    const to = new Date();
    const from = range === '7d' ? subDays(to, 6) : range === '30d' ? subDays(to, 29) : subDays(to, 89);
    setFilters((f) => ({ ...f, range, from, to }));
  };

  const onChangeVision = (vision: Filters['vision']) => {
    setFilters((f) => ({
      ...f,
      vision,
      // ao mudar visão, resetar chaves dependentes
      cityId: vision === 'global' ? null : f.cityId ?? null,
      healthUnitId: vision !== 'unit' ? null : f.healthUnitId ?? null,
    }));
  };

  const handleClearFilters = () => setFilters(() => buildDefaultFilters(role, {
    city_id: user?.city_id ?? null,
    health_unit_id: user?.health_unit_id ?? null,
    id: user?.id ?? null,
  }));

  const handleGenerate = () => {
    if (!canGenerate) return;
    setRefreshTick((n) => n + 1);
  };

  const handleExport = () => {
    if (!canExport) return;
    try {
      const csvHeader = 'KPI,Valor,Delta\n';
      const csvBody = (data.kpis || [])
        .map((k) => `${k.label},${k.value},${typeof k.delta === 'number' ? k.delta : ''}`)
        .join('\n');
      const csv = csvHeader + csvBody;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reports_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[Reports] Erro ao exportar CSV', e);
    }
  };

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
            <ShieldAlert className="h-6 w-6 text-rose-600" />
          </div>
          <div className="text-lg font-medium text-slate-800">Acesso negado</div>
          <div className="text-slate-500">Você não possui permissão para visualizar relatórios.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header com padrão do PageHeader (mesmo de Doctors) */}
      <PageHeader
        title="Relatórios"
        subtitle="Visão geral de indicadores e métricas do sistema"
        icon={BarChart3}
        className="mb-2 py-1 px-4 rounded-xl shadow bg-white border border-gray-100"
        actions={
          <div className="flex items-center space-x-2">
            {canGenerate && (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <Activity className="h-4 w-4" />
                Gerar relatório
              </button>
            )}
            {canExport && (
              <button
                onClick={handleExport}
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <FileDown className="h-4 w-4" />
                Exportar CSV
              </button>
            )}
          </div>
        }
      />

      {/* Chips de filtros ativos */}
      {(() => {
        const chips: { key: keyof Filters | 'city' | 'unit' | 'specialty' | 'doctor' | 'status' | 'kind'; label: string }[] = [];
        if (filters.cityId) {
          const city = MOCK_CITIES.find((c) => c.id === filters.cityId);
          if (city) chips.push({ key: 'city', label: `Prefeitura: ${city.name}` });
        }
        if (filters.healthUnitId) {
          const unit = filters.cityId ? (MOCK_UNITS[filters.cityId] || []).find((u) => u.id === filters.healthUnitId) : undefined;
          if (unit) chips.push({ key: 'unit', label: `Unidade: ${unit.name}` });
        }
        if (filters.specialtyId) {
          const sp = MOCK_SPECIALTIES.find((s) => s.id === filters.specialtyId);
          if (sp) chips.push({ key: 'specialty', label: `Especialidade: ${sp.name}` });
        }
        if (filters.doctorId) {
          const d = MOCK_DOCTORS.find((m) => m.id === filters.doctorId);
          if (d) chips.push({ key: 'doctor', label: `Médico: ${d.name}` });
        }
        if (filters.status) chips.push({ key: 'status', label: `Status: ${filters.status}` });
        if (filters.kind) chips.push({ key: 'kind', label: `Tipo: ${filters.kind}` });
        if (!chips.length) return null;
        return (
          <div className="-mt-4 flex flex-wrap items-center gap-2 px-0.5">
            {chips.map((c) => (
              <button
                key={c.label}
                onClick={() => {
                  setFilters((f) => ({
                    ...f,
                    cityId: c.key === 'city' ? null : f.cityId,
                    healthUnitId: c.key === 'unit' ? null : f.healthUnitId,
                    specialtyId: c.key === 'specialty' ? null : f.specialtyId,
                    doctorId: c.key === 'doctor' ? null : f.doctorId,
                    status: c.key === 'status' ? null : f.status,
                    kind: c.key === 'kind' ? null : f.kind,
                  }));
                }}
                className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:bg-white"
                title="Remover filtro"
              >
                <span>{c.label}</span>
                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700 group-hover:bg-slate-300">x</span>
              </button>
            ))}
            <button
              onClick={handleClearFilters}
              disabled={loading}
              className="text-xs rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200 disabled:opacity-60"
            >
              Limpar tudo
            </button>
          </div>
        );
      })()}

      {/* Filter bar avançada (accordion) */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500">Período:</span>
            <RangeButton active={filters.range === '7d'} onClick={() => onSelectRange('7d')}>7 dias</RangeButton>
            <RangeButton active={filters.range === '30d'} onClick={() => onSelectRange('30d')}>30 dias</RangeButton>
            <RangeButton active={filters.range === '90d'} onClick={() => onSelectRange('90d')}>90 dias</RangeButton>
            <div className="mx-4 h-5 w-px bg-slate-200" />
            <span className="text-sm text-slate-500">Nível de visão:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
              {(['global','city','unit'] as Filters['vision'][]).map(v => (
                <button
                  key={v}
                  onClick={() => onChangeVision(v)}
                  className={`px-3 py-1.5 text-sm ${filters.vision === v ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-white'}`}
                >
                  {v === 'global' ? 'Global' : v === 'city' ? 'Prefeitura' : 'Unidade'}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
          >
            {filtersOpen ? 'Recolher filtros' : 'Filtros avançados'}
          </button>
        </div>
        {filtersOpen && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Prefeitura</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={filters.cityId ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, cityId: e.target.value || null, healthUnitId: null }))}
              disabled={filters.vision === 'global'}
            >
              <option value="">Todas</option>
              {MOCK_CITIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Unidade</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={filters.healthUnitId ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, healthUnitId: e.target.value || null }))}
              disabled={filters.vision !== 'unit' || !filters.cityId}
            >
              <option value="">Todas</option>
              {(filters.cityId ? (MOCK_UNITS[filters.cityId] || []) : []).map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Especialidade</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={filters.specialtyId ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, specialtyId: e.target.value || null }))}
            >
              <option value="">Todas</option>
              {MOCK_SPECIALTIES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Médico</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={filters.doctorId ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, doctorId: e.target.value || null }))}
            >
              <option value="">Todos</option>
              {MOCK_DOCTORS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Status</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={filters.status ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || null) as any }))}
            >
              <option value="">Todos</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="FALTA">Falta (no-show)</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Tipo de atendimento</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={filters.kind ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, kind: (e.target.value || null) as any }))}
            >
              <option value="">Todos</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="TELEMEDICINA">Telemedicina</option>
            </select>
          </label>
        </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="mt-4 h-6 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            ))
          : data.kpis.map((k) => <KpiCard key={k.key} item={k} />)}
      </div>

      {/* Tabs de gráficos */}
      {(() => {
        const hasCapacity = data.charts.some((c) => c.id === 'bar_capacity_demand');
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 p-2">
              {([
                ['tendencias', 'Tendências'],
                ['eficiencia', 'Eficiência'],
                ['capacidade', 'Capacidade'],
                ['distribuicao', 'Distribuição'],
              ] as [typeof activeTab, string][]).map(([key, label]) => {
                const disabled = key === 'capacidade' && !hasCapacity;
                return (
                  <button
                    key={key}
                    onClick={() => !disabled && setActiveTab(key)}
                    disabled={disabled}
                    className={`rounded-lg px-3 py-1.5 text-sm border ${activeTab === key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {/* Conteúdo dos gráficos por aba */}
            {activeTab !== 'distribuicao' && (
              <div className="grid grid-cols-1 gap-4 p-2 lg:grid-cols-2">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-72 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 h-4 w-40 animate-pulse rounded bg-slate-200" />
                        <div className="h-56 animate-pulse rounded bg-slate-200" />
                      </div>
                    ))
                  : (() => {
                      const blocks = data.charts.filter((c) => {
                        if (activeTab === 'tendencias') return c.type === 'line';
                        if (activeTab === 'eficiencia') return c.type === 'bar' && c.id !== 'bar_capacity_demand';
                        if (activeTab === 'capacidade') return c.id === 'bar_capacity_demand';
                        return false;
                      });
                      return blocks.length ? blocks.map((c) => <ChartCard key={c.id} block={c} />) : (
                        <div className="col-span-full p-8 text-center text-sm text-slate-500">Nenhum gráfico disponível para esta aba.</div>
                      );
                    })()
                }
              </div>
            )}
          </div>
        );
      })()}

      {/* Distribuição (pizza) + Top Diagnósticos (na aba Distribuição) */}
      {activeTab === 'distribuicao' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {loading ? (
            <div className="h-72 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 h-4 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-56 animate-pulse rounded bg-slate-200" />
            </div>
          ) : (
            data.charts
              .filter((c) => c.type === 'pie')
              .slice(0, 1)
              .map((c) => <ChartCard key={c.id} block={c} />)
          )}

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 h-4 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-40 animate-pulse rounded bg-slate-200" />
            </div>
          ) : (
            <TableCard
              title="Top Diagnósticos"
              columns={["Diagnóstico", "Qtd."]}
              rows={(data.lists?.topDiagnoses || []).map((d) => [d.name, d.count.toString()])}
            />
          )}
        </div>
      )}

      {/* Rankings estratégicos para MASTER */}
      {role === 'MASTER' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 h-4 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-40 animate-pulse rounded bg-slate-200" />
            </div>
          ) : (
            <TableCard
              title="Ranking de Municípios por Agendamentos"
              columns={["Município", "Agendamentos"]}
              rows={((data as any).lists?.rankCitiesByAppointments || []).map((r: any) => [r.name, r.count.toString()])}
            />
          )}

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 h-4 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-40 animate-pulse rounded bg-slate-200" />
            </div>
          ) : (
            <TableCard
              title="Municípios com Maior Taxa de No-show"
              columns={["Município", "No-show (%)"]}
              rows={((data as any).lists?.rankCitiesByNoShow || []).map((r: any) => [r.name, `${r.rate}%`])}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 h-4 w-52 animate-pulse rounded bg-slate-200" />
            <div className="h-40 animate-pulse rounded bg-slate-200" />
          </div>
        ) : (
          <TableCard
            title="Próximas Consultas"
            columns={["Paciente", "Data", "Status"]}
            rows={(data.lists?.upcomingAppointments || []).map((a) => [a.patient, a.date, a.status])}
          />
        )}
      </div>

      {error && (
        <div className="text-center text-sm text-rose-600">{error}</div>
      )}
    </div>
  );
};

export default Reports;
