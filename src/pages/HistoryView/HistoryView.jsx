import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowRightLeft, UserCheck, RotateCcw, Wrench, PackagePlus, Edit3, Archive, Settings,
  LogIn, History as HistoryIcon, Download, Activity
} from 'lucide-react';
import './HistoryView.css';

const EVENT_META = {
  ISSUE_REPORTED: { label: 'Issue reported', icon: AlertTriangle, tone: 'warn' },
  STATUS_CHANGED: { label: 'Status changed', icon: ArrowRightLeft, tone: 'info' },
  ISSUE_ASSIGNED: { label: 'Assigned', icon: UserCheck, tone: 'info' },
  ISSUE_REOPENED: { label: 'Reopened', icon: RotateCcw, tone: 'danger' },
  MAINTENANCE_LOGGED: { label: 'Maintenance logged', icon: Wrench, tone: 'purple' },
  ASSET_REGISTERED: { label: 'Asset registered', icon: PackagePlus, tone: 'good' },
  ASSET_UPDATED: { label: 'Asset updated', icon: Edit3, tone: 'info' },
  ASSET_RETIRED: { label: 'Asset retired', icon: Archive, tone: 'neutral' },
  SETTINGS_UPDATED: { label: 'Settings updated', icon: Settings, tone: 'neutral' },
  USER_AUTHENTICATED: { label: 'Sign-in', icon: LogIn, tone: 'neutral' }
};
const metaFor = (t) => EVENT_META[t] || { label: t, icon: Activity, tone: 'neutral' };

const RANGES = [['ALL', 'All time'], ['1', 'Today'], ['7', 'Last 7 days'], ['30', 'Last 30 days']];
const PAGE_SIZE = 25;

function dayKey(iso) {
  const d = new Date(iso);
  return isNaN(d) ? 'Unknown date' : d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
const timeOf = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function HistoryView({ history, assets, navigateTo }) {
  const [query, setQuery] = useState('');
  const [types, setTypes] = useState([]); // empty = all
  const [assetFilter, setAssetFilter] = useState('ALL');
  const [range, setRange] = useState('ALL');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const assetMap = useMemo(() => Object.fromEntries(assets.map((a) => [a.id, a])), [assets]);

  const typeCounts = useMemo(() => {
    const m = {};
    history.forEach((h) => { m[h.eventType] = (m[h.eventType] || 0) + 1; });
    return m;
  }, [history]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = range === 'ALL' ? null : Date.now() - Number(range) * 86400000;
    return history
      .filter((h) => {
        if (types.length && !types.includes(h.eventType)) return false;
        if (assetFilter !== 'ALL' && h.assetId !== assetFilter) return false;
        if (cutoff && new Date(h.timestamp).getTime() < cutoff) return false;
        if (q) {
          const hay = `${h.actor} ${h.description} ${h.eventType} ${assetMap[h.assetId]?.name || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [history, query, types, assetFilter, range, assetMap]);

  const shown = filtered.slice(0, limit);
  const groups = useMemo(() => {
    const out = [];
    shown.forEach((h) => {
      const k = dayKey(h.timestamp);
      const last = out[out.length - 1];
      if (last && last.key === k) last.items.push(h);
      else out.push({ key: k, items: [h] });
    });
    return out;
  }, [shown]);

  const toggleType = (t) => {
    setLimit(PAGE_SIZE);
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Timestamp', 'Event', 'Actor', 'Asset', 'Description']];
    filtered.forEach((h) => rows.push([h.timestamp, h.eventType, h.actor, assetMap[h.assetId]?.name || '', h.description]));
    const blob = new Blob([rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintainiq-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setQuery('');
    setTypes([]);
    setAssetFilter('ALL');
    setRange('ALL');
    setLimit(PAGE_SIZE);
  };
  const dirty = query || types.length || assetFilter !== 'ALL' || range !== 'ALL';

  return (
    <div className="pg history-view">
      <div className="pg-head">
        <div>
          <h1 className="pg-title">Activity Timeline</h1>
          <p className="pg-sub">A complete audit trail of everything that happens across assets and work orders.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download size={14} /> Export CSV ({filtered.length})
        </button>
      </div>

      <div className="card card-pad pg-stack">
        <div className="pg-toolbar" style={{ '--cols': 3 }}>
          <div className="pg-field">
            <label htmlFor="hs-q" className="form-label">Search</label>
            <input id="hs-q" type="search" className="form-input" placeholder="Person, asset or keyword..." value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE_SIZE); }} />
          </div>
          <div className="pg-field">
            <label htmlFor="hs-asset" className="form-label">Asset</label>
            <select id="hs-asset" className="form-select" value={assetFilter} onChange={(e) => { setAssetFilter(e.target.value); setLimit(PAGE_SIZE); }}>
              <option value="ALL">All assets</option>
              {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="pg-field">
            <label htmlFor="hs-range" className="form-label">Period</label>
            <select id="hs-range" className="form-select" value={range} onChange={(e) => { setRange(e.target.value); setLimit(PAGE_SIZE); }}>
              {RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="pg-actions">
          {Object.keys(typeCounts).map((t) => (
            <button key={t} type="button" className={`chip ${types.includes(t) ? 'on' : ''}`} onClick={() => toggleType(t)}>
              {metaFor(t).label} <span className="hist-count">{typeCounts[t]}</span>
            </button>
          ))}
          {dirty && <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>Clear filters</button>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card pg-empty">
          <HistoryIcon size={36} />
          <strong>No activity matches your filters</strong>
          <span>Try a different period or clear the filters.</span>
        </div>
      ) : (
        <div className="pg-stack">
          {groups.map((g) => (
            <div key={g.key} className="card">
              <div className="card-header"><h2 className="card-title">{g.key}</h2><span className="pg-xs pg-muted">{g.items.length} event{g.items.length > 1 ? 's' : ''}</span></div>
              <ul className="hist-list">
                {g.items.map((h) => {
                  const m = metaFor(h.eventType);
                  const Icon = m.icon;
                  const asset = assetMap[h.assetId];
                  return (
                    <li key={h.id} className="hist-item">
                      <span className={`hist-icon tone-${m.tone}`}><Icon size={15} /></span>
                      <div className="hist-body">
                        <div className="hist-top">
                          <span className="pg-strong">{m.label}</span>
                          <span className="pg-xs pg-muted">{timeOf(h.timestamp)} • {h.actor}</span>
                        </div>
                        <p className="hist-desc">{h.description}</p>
                        <div className="hist-links">
                          {asset && <button type="button" className="pg-link pg-xs" onClick={() => navigateTo(`/assets/${asset.id}`)}>{asset.name}</button>}
                          {h.issueId && <button type="button" className="pg-link pg-xs" onClick={() => navigateTo(`/issues/${h.issueId}`)}>Open work order</button>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {filtered.length > shown.length && (
            <div style={{ textAlign: 'center' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
                Load more ({filtered.length - shown.length} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
