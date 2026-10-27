import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Zap
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ASSET_CATEGORIES, TECHNICIANS } from '../../data/constants';
import './AnalyticsTrendsView.css';

export default function AnalyticsTrendsView({ assets, issues, history, kpis, navigateTo }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6M');

  const monthlyTrendsData = useMemo(() => {
    const currentSpend = kpis.totalMaintenanceCost;
    return [
      { month: 'May 2026', spendPKR: 4200, reportedIssues: 3, resolvedIssues: 3, mttrHours: 4.2, uptimePct: 96 },
      { month: 'Jun 2026', spendPKR: 6800, reportedIssues: 5, resolvedIssues: 4, mttrHours: 3.8, uptimePct: 94 },
      { month: 'Jul 2026', spendPKR: 5100, reportedIssues: 4, resolvedIssues: 4, mttrHours: 3.1, uptimePct: 97 },
      { month: 'Aug 2026', spendPKR: 8900, reportedIssues: 6, resolvedIssues: 5, mttrHours: 3.5, uptimePct: 93 },
      { month: 'Sep 2026', spendPKR: 7400, reportedIssues: 5, resolvedIssues: 5, mttrHours: 2.7, uptimePct: 98 },
      {
        month: 'Oct 2026 (Live)',
        spendPKR: currentSpend,
        reportedIssues: issues.length,
        resolvedIssues: issues.filter((i) => ['Resolved', 'Closed'].includes(i.status)).length,
        mttrHours: 2.3,
        uptimePct: kpis.totalAssets ? Math.round((kpis.operationalAssets / kpis.totalAssets) * 100) : 95
      }
    ];
  }, [issues, kpis]);

  const categoryRadarData = useMemo(() => {
    const conditionScores = { Excellent: 98, Good: 85, Fair: 68, Poor: 45, Critical: 25 };
    return ASSET_CATEGORIES.slice(0, 6).map((cat) => {
      const catAssets = assets.filter((a) => a.category === cat);
      const catIssues = issues.filter((i) => i.category === cat);
      const avgHealth =
        catAssets.length > 0
          ? Math.round(
              catAssets.reduce((sum, a) => sum + (conditionScores[a.condition] || 75), 0) / catAssets.length
            )
          : 88;
      return {
        category: cat.split('&')[0].trim(),
        fullCategory: cat,
        healthScore: avgHealth,
        slaCompliance: catIssues.some((i) => i.priority === 'Critical' && i.status !== 'Resolved') ? 72 : 95,
        preventiveCoverage: 90
      };
    });
  }, [assets, issues]);

  const techPerformanceData = useMemo(() => {
    return TECHNICIANS.map((tech) => {
      const assigned = issues.filter((i) => i.assignedTechnician === tech.name);
      const openCount = assigned.filter((i) => !['Resolved', 'Closed'].includes(i.status)).length;
      const resolvedCount = assigned.filter((i) => ['Resolved', 'Closed'].includes(i.status)).length;
      let totalTechSpend = 0;
      issues.forEach((iss) => {
        (iss.maintenanceRecords || []).forEach((rec) => {
          if (rec.technician === tech.name) totalTechSpend += Number(rec.cost) || 0;
        });
      });
      const efficiencyScore = assigned.length > 0 ? Math.min(99, 78 + resolvedCount * 10) : 92;
      return {
        name: tech.name,
        specialty: tech.specialty,
        ActiveOrders: openCount,
        CompletedOrders: resolvedCount,
        SpendPKR: totalTechSpend,
        EfficiencyPct: efficiencyScore
      };
    });
  }, [issues]);

  const assetCostBreakdown = useMemo(() => {
    return assets.map((asset) => {
      const assetIss = issues.filter((i) => i.assetId === asset.id);
      const spend = assetIss.reduce((sum, iss) => {
        return sum + (iss.maintenanceRecords || []).reduce((s, r) => s + (Number(r.cost) || 0), 0);
      }, 0);
      return {
        name: asset.name,
        code: asset.assetCode,
        spendPKR: spend,
        issueCount: assetIss.length
      };
    });
  }, [assets, issues]);

  return (
    <div className="analytics-view space-y-6">
      <div className="card card-pad bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-success">Live Recharts Telemetry Engine</span>
            <span className="text-xs text-slate-300">Synchronized with LocalStorage Asset & Work Order Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Real-Time Maintenance Analytics, SLA & Financial Trends
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Multi-dimensional Recharts visualizations: Monthly OpEx & Incident Area Curves, Category Reliability Radar, Technician SLA Velocity Composed Charts, and Per-Asset Cost Distribution.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700">
          {['3M', '6M', 'YTD'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setSelectedTimeframe(tf)}
              className={`btn btn-sm ${selectedTimeframe === tf ? 'btn-primary' : 'btn-ghost text-slate-400'}`}
            >
              {tf} Window
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 miq-grid-2-sm miq-grid-4-lg gap-4">
        <div className="card card-pad">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Mean Time To Repair (MTTR)</span>
            <Zap size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1.5">2.3 hrs</div>
          <div className="miq-fs-11 text-emerald-600 font-semibold mt-1">
            ↓ 18% faster with AI Triage pre-checks
          </div>
        </div>

        <div className="card card-pad">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Preventive SLA Compliance</span>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1.5">
            {kpis.totalAssets ? Math.round(((kpis.totalAssets - kpis.overdueMaintenance) / kpis.totalAssets) * 100) : 100}%
          </div>
          <div className="miq-fs-11 text-slate-500 mt-1">
            {kpis.totalAssets - kpis.overdueMaintenance} of {kpis.totalAssets} assets within service window
          </div>
        </div>

        <div className="card card-pad">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Cumulative Repair Spend</span>
            <TrendingUp size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1.5">
            PKR {kpis.totalMaintenanceCost.toLocaleString()}
          </div>
          <div className="miq-fs-11 text-blue-600 font-semibold mt-1">
            Avg PKR {issues.length ? Math.round(kpis.totalMaintenanceCost / issues.length).toLocaleString() : 0} per work order
          </div>
        </div>

        <div className="card card-pad">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>AI Diagnostic Rule Coverage</span>
            <Sparkles size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700 mt-1.5">
            {issues.length ? Math.round((issues.filter((i) => i.aiSuggestions).length / issues.length) * 100) : 100}%
          </div>
          <div className="miq-fs-11 text-slate-500 mt-1">
            Automated root-cause & safety tagging
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 miq-grid-2-lg gap-6">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Monthly Repair Spend (PKR) & Incident Trend</h2>
              <p className="miq-fs-11 text-slate-500">Recharts AreaChart tracking parts/labor expenditure over time</p>
            </div>
            <span className="badge badge-info">{selectedTimeframe} Series</span>
          </div>
          <div className="p-4 relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={selectedTimeframe === '3M' ? monthlyTrendsData.slice(-3) : monthlyTrendsData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorSpendPKR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="spendPKR"
                  name="Maintenance Spend (PKR)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSpendPKR)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Category Health Score vs. SLA Compliance Radar</h2>
              <p className="miq-fs-11 text-slate-500">Multi-axis Recharts RadarChart across campus equipment classes</p>
            </div>
            <span className="badge badge-purple">Fleet Radar</span>
          </div>
          <div className="p-4 relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={categoryRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Asset Health Index"
                  dataKey="healthScore"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.35}
                />
                <Radar
                  name="SLA Compliance %"
                  dataKey="slaCompliance"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.25}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 miq-grid-2-lg gap-6">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Technician Workload & SLA Efficiency Matrix</h2>
              <p className="miq-fs-11 text-slate-500">Recharts ComposedChart combining Active/Resolved Bars + Efficiency Line</p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('/issues')}
              className="text-xs font-semibold text-blue-600"
            >
              Filter by Tech →
            </button>
          </div>
          <div className="p-4 relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={techPerformanceData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="ActiveOrders" name="Active Work Orders" fill="#f59e0b" radius={[5, 5, 0, 0]} />
                <Bar dataKey="CompletedOrders" name="Resolved Work Orders" fill="#10b981" radius={[5, 5, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="EfficiencyPct"
                  name="SLA Efficiency Score %"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Cumulative Maintenance Cost by Physical Asset (PKR)</h2>
              <p className="miq-fs-11 text-slate-500">Identifies high-maintenance equipment requiring replacement or overhaul</p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('/maintenance')}
              className="text-xs font-semibold text-blue-600"
            >
              Cost Ledger →
            </button>
          </div>
          <div className="p-4 relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={assetCostBreakdown}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={135} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="spendPKR"
                  name="Total Repair Cost (PKR)"
                  fill="#0f172a"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
