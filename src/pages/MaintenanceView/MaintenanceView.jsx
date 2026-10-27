import React, { useMemo, useState } from 'react';
import { CalendarClock, Wrench, Wallet, Sparkles } from 'lucide-react';
import { TECHNICIANS } from '../../data/constants';
import { formatDisplayDate, getDaysUntil } from '../../utils/dateUtils';
import AssetStatusBadge from '../../components/Badges/AssetStatusBadge';
import './MaintenanceView.css';

const isOpenIssue = (i) => !['Resolved', 'Closed'].includes(i.status);
const fmtPKR = (n) => `PKR ${Math.round(n).toLocaleString()}`;

function dueInfo(days) {
  if (days === null) return { key: 'none', label: 'No date', cls: 'badge-neutral' };
  if (days < 0) return { key: 'overdue', label: `Overdue by ${Math.abs(days)}d`, cls: 'badge-danger' };
  if (days === 0) return { key: 'soon', label: 'Due today', cls: 'badge-warning' };
  if (days <= 7) return { key: 'soon', label: `Due in ${days}d`, cls: 'badge-warning' };
  if (days <= 30) return { key: 'month', label: `Due in ${days}d`, cls: 'badge-info' };
  return { key: 'later', label: `In ${days}d`, cls: 'badge-success' };
}

export default function MaintenanceView({ assets, issues, kpis, navigateTo }) {
  const [tab, setTab] = useState('schedule');
  const [windowFilter, setWindowFilter] = useState('ALL'); // ALL | overdue | week | month
  const [techFilter, setTechFilter] = useState('ALL');

  const schedule = useMemo(() => {
    return assets
      .filter((a) => a.status !== 'Retired')
      .map((a) => {
        const days = getDaysUntil(a.nextServiceDate);
        return { asset: a, days, info: dueInfo(days) };
      })
      .sort((x, y) => (x.days ?? 9999) - (y.days ?? 9999));
  }, [assets]);

  const counts = useMemo(() => ({
    overdue: schedule.filter((s) => s.days !== null && s.days < 0).length,
    week: schedule.filter((s) => s.days !== null && s.days >= 0 && s.days <= 7).length,
    month: schedule.filter((s) => s.days !== null && s.days >= 0 && s.days <= 30).length
  }), [schedule]);

  const visible = useMemo(() => schedule.filter((s) => {
    if (techFilter !== 'ALL' && s.asset.assignedTechnician !== techFilter) return false;
    if (windowFilter === 'overdue') return s.days !== null && s.days < 0;
    if (windowFilter === 'week') return s.days !== null && s.days <= 7;
    if (windowFilter === 'month') return s.days !== null && s.days <= 30;
    return true;
  }), [schedule, windowFilter, techFilter]);

  const assetMap = useMemo(() => Object.fromEntries(assets.map((a) => [a.id, a])), [assets]);

  const records = useMemo(() => {
    const out = [];
    issues.forEach((i) => (i.maintenanceRecords || []).forEach((r) => out.push({ ...r, issue: i, asset: assetMap[i.assetId] })));
    return out.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [issues, assetMap]);

  const workload = useMemo(() => TECHNICIANS.map((t) => {
    const open = issues.filter((i) => isOpenIssue(i) && i.assignedTechnician === t.name);
    const owned = schedule.filter((s) => s.asset.assignedTechnician === t.name);
    const spent = records.filter((r) => r.technician === t.name).reduce((s, r) => s + (Number(r.cost) || 0), 0);
    return {
      tech: t,
      open: open.length,
      critical: open.filter((i) => i.priority === 'Critical' || i.priority === 'High').length,
      assets: owned.length,
      overdue: owned.filter((s) => s.days !== null && s.days < 0).length,
      spent
    };
  }), [issues, schedule, records]);

  const costByCategory = useMemo(() => {
    const m = {};
    records.forEach((r) => {
      const k = r.issue.category || 'Other';
      m[k] = (m[k] || 0) + (Number(r.cost) || 0);
    });
    const rows = Object.entries(m).sort((a, b) => b[1] - a[1]);
    return { rows, max: Math.max(1, ...rows.map((r) => r[1])) };
  }, [records]);

  const maxLoad = Math.max(1, ...workload.map((w) => w.open));

  return (
    <div className="pg maint-view">
      <div className="pg-head">
        <div>
          <h1 className="pg-title">Maintenance & Schedule</h1>
          <p className="pg-sub">Preventive service calendar, technician workload and maintenance spend.</p>
        </div>
        <div className="pg-seg" role="tablist">
          {[['schedule', 'Schedule'], ['workload', 'Team & Costs'], ['log', 'Service log']].map(([k, l]) => (
            <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="pg-stats">
        <button type="button" className={`pg-stat ${counts.overdue ? 'tone-danger' : 'tone-good'}`} onClick={() => { setTab('schedule'); setWindowFilter('overdue'); }}>
          <span className="pg-stat-label">Overdue services</span>
          <span className="pg-stat-value">{counts.overdue}</span>
          <span className="pg-stat-note">{counts.overdue ? 'Needs scheduling now' : 'All up to date'}</span>
        </button>
        <button type="button" className={`pg-stat ${counts.week ? 'tone-warn' : ''}`} onClick={() => { setTab('schedule'); setWindowFilter('week'); }}>
          <span className="pg-stat-label">Due in 7 days</span>
          <span className="pg-stat-value">{counts.week}</span>
          <span className="pg-stat-note">Coming up this week</span>
        </button>
        <button type="button" className="pg-stat" onClick={() => { setTab('schedule'); setWindowFilter('month'); }}>
          <span className="pg-stat-label">Due in 30 days</span>
          <span className="pg-stat-value">{counts.month}</span>
          <span className="pg-stat-note">Plan ahead</span>
        </button>
        <div className="pg-stat">
          <span className="pg-stat-label">Total maintenance spend</span>
          <span className="pg-stat-value">{fmtPKR(kpis?.totalMaintenanceCost ?? 0)}</span>
          <span className="pg-stat-note">{records.length} records logged</span>
        </div>
      </div>

      {tab === 'schedule' && (
        <>
          <div className="card card-pad maint-filters">
            <div className="pg-actions">
              {[['ALL', 'All'], ['overdue', 'Overdue'], ['week', 'Next 7 days'], ['month', 'Next 30 days']].map(([k, l]) => (
                <button key={k} type="button" className={`chip ${windowFilter === k ? 'on' : ''}`} onClick={() => setWindowFilter(k)}>{l}</button>
              ))}
            </div>
            <div className="pg-field maint-tech">
              <label className="form-label" htmlFor="mt-tech">Technician</label>
              <select id="mt-tech" className="form-select" value={techFilter} onChange={(e) => setTechFilter(e.target.value)}>
                <option value="ALL">All technicians</option>
                {TECHNICIANS.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="card pg-empty"><CalendarClock size={36} /><strong>Nothing scheduled in this window</strong><span>Try a wider range.</span></div>
          ) : (
            <div className="card overflow-hidden">
              <div className="pg-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Asset</th><th>Status</th><th>Last service</th><th>Next service</th><th>Technician</th><th /></tr>
                  </thead>
                  <tbody>
                    {visible.map(({ asset, info }) => (
                      <tr key={asset.id}>
                        <td>
                          <button type="button" className="pg-link" onClick={() => navigateTo(`/assets/${asset.id}`)}>{asset.name}</button>
                          <div className="pg-xs pg-muted">{asset.assetCode} • {asset.location}</div>
                        </td>
                        <td><AssetStatusBadge status={asset.status} /></td>
                        <td>{formatDisplayDate(asset.lastServiceDate)}</td>
                        <td>
                          <div>{formatDisplayDate(asset.nextServiceDate)}</div>
                          <span className={`badge ${info.cls}`}>{info.label}</span>
                        </td>
                        <td>{asset.assignedTechnician}</td>
                        <td>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigateTo('/ai-triage', { assetId: asset.id })}>
                            <Sparkles size={12} /> Report issue
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'workload' && (
        <div className="pg-cols even">
          <div className="card">
            <div className="card-header"><h2 className="card-title">Technician workload</h2></div>
            <div className="card-pad pg-stack">
              {workload.map((w) => (
                <div key={w.tech.id} className="maint-tech-card">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="pg-strong">{w.tech.name}</div>
                      <div className="pg-xs pg-muted">{w.tech.specialty}</div>
                    </div>
                    <span className="badge badge-neutral">{w.tech.badge}</span>
                  </div>
                  <div className="pg-bar" style={{ margin: '10px 0 8px' }}><span style={{ width: `${(w.open / maxLoad) * 100}%` }} /></div>
                  <div className="maint-tech-stats">
                    <span><b>{w.open}</b> open{w.critical ? <em> ({w.critical} urgent)</em> : null}</span>
                    <span><b>{w.assets}</b> assets{w.overdue ? <em className="danger"> ({w.overdue} overdue)</em> : null}</span>
                    <span><b>{fmtPKR(w.spent)}</b> spent</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2 className="card-title flex items-center gap-2"><Wallet size={15} /> Cost by category</h2></div>
            <div className="card-pad pg-stack">
              {costByCategory.rows.length === 0 && <span className="pg-xs pg-muted">No maintenance costs logged yet.</span>}
              {costByCategory.rows.map(([cat, amt]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between pg-xs" style={{ marginBottom: 4 }}>
                    <span className="pg-strong">{cat}</span><span className="pg-muted">{fmtPKR(amt)}</span>
                  </div>
                  <div className="pg-bar"><span style={{ width: `${(amt / costByCategory.max) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'log' && (
        records.length === 0 ? (
          <div className="card pg-empty"><Wrench size={36} /><strong>No service records yet</strong><span>Log maintenance from a work order and it will show up here.</span></div>
        ) : (
          <div className="card overflow-hidden">
            <div className="pg-table-wrap">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Asset / work order</th><th>Work performed</th><th>Parts</th><th>Technician</th><th>Cost</th></tr></thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="pg-row-click" onClick={() => navigateTo(`/issues/${r.issue.id}`)}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDisplayDate(r.date)}</td>
                      <td>
                        <div className="pg-strong">{r.asset?.name || 'Unknown asset'}</div>
                        <div className="pg-xs pg-link mono">{r.issue.issueNumber}</div>
                      </td>
                      <td className="maint-work">{r.workPerformed}</td>
                      <td className="pg-xs">{r.partsReplaced}</td>
                      <td>{r.technician}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtPKR(Number(r.cost) || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
