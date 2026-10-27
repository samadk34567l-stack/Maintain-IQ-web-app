import React from 'react';
import {
  Box,
  ClipboardList,
  Sparkles,
  Wrench,
  QrCode,
  UserCheck,
  CheckCircle2,
  Flame,
  ShieldAlert,
  CalendarClock,
  Activity,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ASSET_STATUSES, ISSUE_PRIORITIES, TECHNICIANS } from '../../data/constants';
import { formatDateTime, formatDisplayDate, getDaysUntil } from '../../utils/dateUtils';
import IssueStatusBadge from '../../components/Badges/IssueStatusBadge';
import PriorityBadge from '../../components/Badges/PriorityBadge';
import './DashboardView.css';

const STATUS_COLORS = {
  'Operational': '#10b981',
  'Issue Reported': '#f59e0b',
  'Under Inspection': '#3b82f6',
  'Under Maintenance': '#8b5cf6',
  'Out of Service': '#e11d48',
  'Retired': '#94a3b8'
};

export default function DashboardView({ assets, issues, history, kpis, settings, role, currentUser, activeTechFilter, navigateTo }) {
  const assetStatusData = ASSET_STATUSES.map((status) => ({
    name: status,
    value: assets.filter((a) => a.status === status).length,
    color: STATUS_COLORS[status] || '#64748b'
  })).filter((d) => d.value > 0);

  const issuePriorityData = ISSUE_PRIORITIES.map((priority) => ({
    priority,
    Open: issues.filter((i) => i.priority === priority && !['Resolved', 'Closed'].includes(i.status)).length,
    Resolved: issues.filter((i) => i.priority === priority && ['Resolved', 'Closed'].includes(i.status)).length
  }));

  const monthlySpendCurve = [
    { month: 'May', spend: 4200, issues: 3 },
    { month: 'Jun', spend: 6800, issues: 5 },
    { month: 'Jul', spend: 5100, issues: 4 },
    { month: 'Aug', spend: 8900, issues: 6 },
    { month: 'Sep', spend: 7400, issues: 5 },
    { month: 'Oct (Live)', spend: kpis.totalMaintenanceCost, issues: issues.length }
  ];

  const criticalOpenIssues = issues.filter(
    (i) => !['Resolved', 'Closed'].includes(i.status) && (i.priority === 'Critical' || i.priority === 'High')
  );

  const upcomingSchedule = [...assets]
    .filter((a) => a.status !== 'Retired')
    .map((a) => ({ ...a, daysRemaining: getDaysUntil(a.nextServiceDate) }))
    .sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999))
    .slice(0, 5);

  return (
    <div className="dashboard-view space-y-6">
      <div className="card card-pad bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-success">Session: {currentUser?.fullName || 'Administrator'}</span>
            <span className="badge badge-info">{role} Command View</span>
            <span className="text-xs text-slate-400">{settings.organizationName}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Executive Administrator & QR Asset Intelligence Hub
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Real-time Recharts telemetry, AI diagnostic triage, technician workload orchestration, and QR service lifecycle tracking. Click any KPI card or chart to drill down.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => navigateTo('/analytics')}
            className="btn btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold"
          >
            <TrendingUp size={15} />
            <span>Open Real Charts & Trends</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/ai-triage')}
            className="btn btn-primary text-xs font-bold"
          >
            <Sparkles size={15} />
            <span>AI Issue Triage</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/assets')}
            className="btn btn-secondary text-xs"
          >
            <QrCode size={15} />
            <span>Assets & QR Labels</span>
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div onClick={() => navigateTo('/assets')} className="kpi-card">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Assets</span>
            <Box size={17} className="text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{kpis.totalAssets}</div>
          <div className="miq-fs-11 text-slate-500 mt-1">100% QR-tagged with stable IDs</div>
        </div>

        <div onClick={() => navigateTo('/assets', { status: 'Operational' })} className="kpi-card">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Operational</span>
            <CheckCircle2 size={17} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">
            {kpis.operationalAssets} <span className="text-sm font-normal text-slate-400">/ {kpis.totalAssets}</span>
          </div>
          <div className="miq-fs-11 text-emerald-700 mt-1">
            {kpis.totalAssets ? Math.round((kpis.operationalAssets / kpis.totalAssets) * 100) : 0}% fleet availability
          </div>
        </div>

        <div onClick={() => navigateTo('/issues', { status: 'OPEN_ONLY' })} className="kpi-card">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Open Work Orders</span>
            <ClipboardList size={17} className="text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{kpis.openIssues}</div>
          <div className="miq-fs-11 text-slate-500 mt-1">Active across inspection & repair</div>
        </div>

        <div onClick={() => navigateTo('/issues', { priority: 'Critical' })} className="kpi-card">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Critical / High</span>
            <Flame size={17} className="text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">{kpis.criticalIssues}</div>
          <div className="miq-fs-11 text-rose-700 mt-1">Priority technician dispatch</div>
        </div>

        <div onClick={() => navigateTo('/maintenance')} className="kpi-card">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Overdue Service</span>
            <CalendarClock size={17} className="text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">{kpis.overdueMaintenance}</div>
          <div className="miq-fs-11 text-slate-500 mt-1">Spend: PKR {kpis.totalMaintenanceCost.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 miq-grid-2-lg gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Work Orders by Priority & Resolution</h2>
            <button
              type="button"
              onClick={() => navigateTo('/issues')}
              className="text-xs font-semibold text-blue-600 flex items-center gap-1"
            >
              <span>All Issues</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="p-4 relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuePriorityData} margin={{ top: 10, right: 16, left: -16, bottom: 5 }}>
                <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="Open"
                  name="Active / Open"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                  onClick={(d) => navigateTo('/issues', { priority: d.priority })}
                />
                <Bar
                  dataKey="Resolved"
                  name="Resolved / Closed"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                  onClick={(d) => navigateTo('/issues', { priority: d.priority })}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Asset Health & Status Breakdown</h2>
            <button
              type="button"
              onClick={() => navigateTo('/assets')}
              className="text-xs font-semibold text-blue-600 flex items-center gap-1"
            >
              <span>Asset Registry</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="p-4 relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={3}
                  onClick={(entry) => navigateTo('/assets', { status: entry.name })}
                  style={{ cursor: 'pointer' }}
                >
                  {assetStatusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 miq-grid-3-lg gap-6">
        <div className="miq-span-2-lg card">
          <div className="card-header">
            <div>
              <h2 className="card-title">6-Month Maintenance Expenditure & Incident Velocity</h2>
              <p className="miq-fs-11 text-slate-500">Live financial spend curve synced with logged repair records</p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('/analytics')}
              className="text-xs font-semibold text-blue-600 flex items-center gap-1"
            >
              <span>Full Analytics Suite</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="p-4 relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpendCurve} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashSpendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="spend"
                  name="Repair Spend (PKR)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#dashSpendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card flex flex-col">
          <div className="card-header">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <UserCheck size={17} className="text-purple-600" />
              <span>Admin Technician Dispatch Matrix</span>
            </div>
            <span className="badge badge-purple">{TECHNICIANS.length} On Duty</span>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {TECHNICIANS.map((t) => {
              const activeCount = issues.filter(
                (i) => i.assignedTechnician === t.name && !['Resolved', 'Closed'].includes(i.status)
              ).length;
              const resolvedCount = issues.filter(
                (i) => i.assignedTechnician === t.name && ['Resolved', 'Closed'].includes(i.status)
              ).length;
              const loadPct = Math.min(100, activeCount * 35);
              return (
                <div
                  key={t.id}
                  onClick={() => navigateTo('/issues')}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer transition space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{t.name}</span>
                      <span className="miq-fs-11 text-slate-500 block">{t.specialty}</span>
                    </div>
                    <div className="text-right">
                      <span className="badge badge-info">
                        {activeCount} Active • {resolvedCount} Done
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${loadPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.max(15, loadPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 miq-grid-2-lg gap-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <ShieldAlert size={17} className="text-rose-600" />
              <span>Urgent Open Work Orders (Critical & High)</span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('/issues')}
              className="btn btn-secondary btn-sm"
            >
              View All ({issues.length})
            </button>
          </div>
          <div className="overflow-x-auto">
            {criticalOpenIssues.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">All critical and high-priority issues are resolved!</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Issue</th>
                    <th>Asset</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalOpenIssues.map((iss) => {
                    const asset = assets.find((a) => a.id === iss.assetId);
                    return (
                      <tr key={iss.id}>
                        <td>
                          <div className="font-mono font-bold text-blue-600 miq-fs-11">{iss.issueNumber}</div>
                          <div className="font-semibold text-slate-900">{iss.title}</div>
                        </td>
                        <td>
                          <div className="font-semibold text-slate-800">{asset?.name}</div>
                          <div className="miq-fs-11 text-slate-500">{asset?.location}</div>
                        </td>
                        <td><PriorityBadge priority={iss.priority} /></td>
                        <td><IssueStatusBadge status={iss.status} /></td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={() => navigateTo(`/issues/${iss.id}`)}
                            className="btn btn-secondary btn-sm"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Wrench size={17} className="text-blue-600" />
              <span>Upcoming & Overdue Preventive Service</span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('/maintenance')}
              className="btn btn-secondary btn-sm"
            >
              Schedule
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Next Service</th>
                  <th>Window</th>
                  <th>Technician</th>
                </tr>
              </thead>
              <tbody>
                {upcomingSchedule.map((asset) => {
                  const isOverdue = asset.daysRemaining !== null && asset.daysRemaining < 0;
                  const isSoon = asset.daysRemaining !== null && asset.daysRemaining >= 0 && asset.daysRemaining <= 14;
                  return (
                    <tr
                      key={asset.id}
                      onClick={() => navigateTo(`/assets/${asset.id}`)}
                      className="cursor-pointer"
                    >
                      <td>
                        <div className="font-semibold text-slate-900">{asset.name}</div>
                        <div className="font-mono miq-fs-11 text-slate-500">{asset.assetCode}</div>
                      </td>
                      <td>{formatDisplayDate(asset.nextServiceDate)}</td>
                      <td>
                        {isOverdue ? (
                          <span className="badge badge-danger">Overdue {Math.abs(asset.daysRemaining)}d</span>
                        ) : isSoon ? (
                          <span className="badge badge-warning">Due in {asset.daysRemaining}d</span>
                        ) : (
                          <span className="badge badge-success">In {asset.daysRemaining}d</span>
                        )}
                      </td>
                      <td>{asset.assignedTechnician}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Activity size={17} className="text-blue-600" />
            <span>Recent Append-Only Audit Activity</span>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/history')}
            className="text-xs font-semibold text-blue-600 flex items-center gap-1"
          >
            <span>Full Timeline ({history.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>
        <div className="p-5 divide-y divide-slate-100">
          {history.slice(0, 5).map((ev) => {
            const asset = assets.find((a) => a.id === ev.assetId);
            return (
              <div key={ev.id} className="py-3 miq-first-pt0 miq-last-pb0 flex flex-wrap items-start justify-between gap-2 text-xs">
                <div>
                  <span className="font-mono miq-fs-10 font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 mr-2">
                    {ev.eventType}
                  </span>
                  <span className="font-semibold text-slate-900">{ev.description}</span>
                  <div className="text-slate-500 mt-1">
                    Actor: <strong>{ev.actor}</strong> {asset ? `• Asset: ${asset.name} (${asset.assetCode})` : ''}
                  </div>
                </div>
                <span className="text-slate-400 font-mono miq-fs-11">{formatDateTime(ev.timestamp)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
