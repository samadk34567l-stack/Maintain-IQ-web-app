import React, { useMemo, useState } from 'react';
import { Plus, Sparkles, LayoutList, Kanban, ClipboardList, AlertTriangle, X } from 'lucide-react';
import { ASSET_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES, TECHNICIANS } from '../../data/constants';
import { formatDateTime } from '../../utils/dateUtils';
import PriorityBadge from '../../components/Badges/PriorityBadge';
import IssueStatusBadge from '../../components/Badges/IssueStatusBadge';
import Modal from '../../components/Modal/Modal';
import './IssuesView.css';

const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const isOpenIssue = (i) => !['Resolved', 'Closed'].includes(i.status);

const BOARD_COLUMNS = [
  { key: 'new', title: 'New / Assigned', statuses: ['Reported', 'Assigned', 'Reopened'] },
  { key: 'progress', title: 'In Progress', statuses: ['Inspection Started', 'Maintenance In Progress'] },
  { key: 'blocked', title: 'Waiting for Parts', statuses: ['Waiting for Parts'] },
  { key: 'done', title: 'Resolved / Closed', statuses: ['Resolved', 'Closed'] }
];

function ageLabel(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  if (isNaN(ms)) return '—';
  const days = Math.floor(ms / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

const initials = (name = '') => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function IssuesView({
  issues,
  assets,
  globalSearch,
  setGlobalSearch,
  initialQuery = {},
  role,
  activeTechFilter,
  createIssue,
  navigateTo
}) {
  const [localQuery, setLocalQuery] = useState('');
  const [quick, setQuick] = useState(initialQuery.quick || 'ALL'); // ALL | OPEN | URGENT | DONE
  const [statusFilter, setStatusFilter] = useState(initialQuery.status || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState(initialQuery.priority || 'ALL');
  const [techFilter, setTechFilter] = useState('ALL');
  const [assetFilter, setAssetFilter] = useState(initialQuery.assetId || 'ALL');
  const [mineOnly, setMineOnly] = useState(role === 'Technician');
  const [sortBy, setSortBy] = useState('priority');
  const [view, setView] = useState('table');
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const assetMap = useMemo(() => Object.fromEntries(assets.map((a) => [a.id, a])), [assets]);
  const reportableAssets = useMemo(() => assets.filter((a) => a.status !== 'Retired'), [assets]);

  const emptyForm = () => {
    const first = (initialQuery.assetId && reportableAssets.find((a) => a.id === initialQuery.assetId)) || reportableAssets[0];
    return {
      assetId: first?.id || '',
      title: '',
      description: '',
      category: first?.category || ASSET_CATEGORIES[0],
      priority: 'Medium',
      reporterName: role === 'Technician' ? activeTechFilter : '',
      assignedTechnician: first?.assignedTechnician || ''
    };
  };
  const [form, setForm] = useState(emptyForm);

  const effectiveSearch = (globalSearch || localQuery).trim().toLowerCase();

  const counts = useMemo(() => {
    const open = issues.filter(isOpenIssue);
    return {
      all: issues.length,
      open: open.length,
      urgent: open.filter((i) => i.priority === 'Critical' || i.priority === 'High').length,
      done: issues.length - open.length
    };
  }, [issues]);

  const filtered = useMemo(() => {
    const list = issues.filter((i) => {
      if (quick === 'OPEN' && !isOpenIssue(i)) return false;
      if (quick === 'URGENT' && !(isOpenIssue(i) && (i.priority === 'Critical' || i.priority === 'High'))) return false;
      if (quick === 'DONE' && isOpenIssue(i)) return false;
      if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && i.priority !== priorityFilter) return false;
      if (techFilter !== 'ALL' && i.assignedTechnician !== techFilter) return false;
      if (assetFilter !== 'ALL' && i.assetId !== assetFilter) return false;
      if (mineOnly && i.assignedTechnician !== activeTechFilter) return false;
      if (effectiveSearch) {
        const a = assetMap[i.assetId];
        const hay = `${i.issueNumber} ${i.title} ${i.description} ${i.reporterName} ${i.assignedTechnician} ${i.category} ${a?.name || ''} ${a?.assetCode || ''}`.toLowerCase();
        if (!hay.includes(effectiveSearch)) return false;
      }
      return true;
    });
    const byDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
    return [...list].sort((a, b) => {
      if (sortBy === 'newest') return byDate(a, b);
      if (sortBy === 'oldest') return -byDate(a, b);
      const openDiff = Number(!isOpenIssue(a)) - Number(!isOpenIssue(b));
      if (openDiff) return openDiff;
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || byDate(a, b);
    });
  }, [issues, quick, statusFilter, priorityFilter, techFilter, assetFilter, mineOnly, activeTechFilter, effectiveSearch, sortBy, assetMap]);

  const hasActiveFilters =
    quick !== 'ALL' || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || techFilter !== 'ALL' ||
    assetFilter !== 'ALL' || mineOnly || !!effectiveSearch;

  const clearFilters = () => {
    setQuick('ALL');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setTechFilter('ALL');
    setAssetFilter('ALL');
    setMineOnly(false);
    setLocalQuery('');
    if (globalSearch) setGlobalSearch('');
  };

  const openModal = () => {
    setForm(emptyForm());
    setFormError('');
    setModalOpen(true);
  };

  const handleAssetChange = (assetId) => {
    const a = assetMap[assetId];
    setForm((f) => ({
      ...f,
      assetId,
      category: a?.category || f.category,
      assignedTechnician: a?.assignedTechnician || f.assignedTechnician
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.assetId) return setFormError('Please select an asset.');
    if (form.title.trim().length < 5) return setFormError('Title must be at least 5 characters.');
    if (form.description.trim().length < 10) return setFormError('Please describe the problem (at least 10 characters).');
    const res = createIssue({
      assetId: form.assetId,
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      reporterName: form.reporterName,
      assignedTechnician: form.assignedTechnician || undefined
    });
    if (!res.ok) return setFormError(res.error);
    setModalOpen(false);
    navigateTo(`/issues/${res.issue.id}`);
  };

  const statTile = (key, label, value, note, tone) => (
    <button type="button" className={`pg-stat ${tone || ''} ${quick === key ? 'active' : ''}`} onClick={() => setQuick(key)}>
      <span className="pg-stat-label">{label}</span>
      <span className="pg-stat-value">{value}</span>
      <span className="pg-stat-note">{note}</span>
    </button>
  );

  return (
    <div className="pg issues-view">
      <div className="pg-head">
        <div>
          <h1 className="pg-title">Work Orders / Issues</h1>
          <p className="pg-sub">Track every reported problem from first report to closure.</p>
        </div>
        <div className="pg-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigateTo('/ai-triage')}>
            <Sparkles size={15} /> AI Triage
          </button>
          <button type="button" className="btn btn-primary" onClick={openModal}>
            <Plus size={15} /> New Work Order
          </button>
        </div>
      </div>

      <div className="pg-stats">
        {statTile('ALL', 'All work orders', counts.all, 'Everything on record')}
        {statTile('OPEN', 'Open', counts.open, 'Not yet resolved', counts.open ? 'tone-warn' : '')}
        {statTile('URGENT', 'Urgent (P1 / P2)', counts.urgent, 'Critical or High, still open', counts.urgent ? 'tone-danger' : '')}
        {statTile('DONE', 'Resolved / Closed', counts.done, 'Completed work', 'tone-good')}
      </div>

      <div className="card card-pad pg-toolbar" style={{ '--cols': 5 }}>
        <div className="pg-field">
          <label htmlFor="iss-q" className="form-label">Search</label>
          <input
            id="iss-q"
            type="search"
            className="form-input"
            placeholder="Number, title, asset, reporter..."
            value={globalSearch || localQuery}
            onChange={(e) => {
              if (globalSearch) setGlobalSearch('');
              setLocalQuery(e.target.value);
            }}
          />
        </div>
        <div className="pg-field">
          <label htmlFor="iss-st" className="form-label">Status</label>
          <select id="iss-st" className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All statuses</option>
            {ISSUE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="pg-field">
          <label htmlFor="iss-pr" className="form-label">Priority</label>
          <select id="iss-pr" className="form-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="ALL">All priorities</option>
            {ISSUE_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="pg-field">
          <label htmlFor="iss-tech" className="form-label">Technician</label>
          <select id="iss-tech" className="form-select" value={techFilter} onChange={(e) => setTechFilter(e.target.value)}>
            <option value="ALL">Anyone</option>
            {TECHNICIANS.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </div>
        <div className="pg-field">
          <label htmlFor="iss-sort" className="form-label">Sort by</label>
          <select id="iss-sort" className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priority">Priority (open first)</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      <div className="issues-bar">
        <div className="pg-actions">
          <label className="pg-check">
            <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} />
            Only my assignments ({activeTechFilter})
          </label>
          {assetFilter !== 'ALL' && (
            <span className="chip on">
              Asset: {assetMap[assetFilter]?.name || assetFilter}
              <button type="button" onClick={() => setAssetFilter('ALL')} aria-label="Remove asset filter"><X size={12} /></button>
            </span>
          )}
          {hasActiveFilters && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
        <div className="pg-actions">
          <span className="pg-xs pg-muted">{filtered.length} of {issues.length} shown</span>
          <div className="pg-seg" role="tablist" aria-label="View mode">
            <button type="button" className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}><LayoutList size={14} /> List</button>
            <button type="button" className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}><Kanban size={14} /> Board</button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card pg-empty">
          <ClipboardList size={36} />
          <strong>No work orders match these filters</strong>
          <span>Try clearing a filter or create a new work order.</span>
          {hasActiveFilters && <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear filters</button>}
        </div>
      ) : view === 'table' ? (
        <div className="card overflow-hidden">
          <div className="pg-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Work order</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned to</th>
                  <th>Reported</th>
                  <th>Records</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const a = assetMap[i.assetId];
                  return (
                    <tr key={i.id} className="pg-row-click" onClick={() => navigateTo(`/issues/${i.id}`)}>
                      <td className="issues-title-cell">
                        <span className="pg-link mono pg-xs">{i.issueNumber}</span>
                        <div className="pg-strong">{i.title}</div>
                        <div className="pg-xs pg-muted">{a ? `${a.name} • ${a.location}` : 'Unknown asset'}</div>
                      </td>
                      <td><PriorityBadge priority={i.priority} /></td>
                      <td><IssueStatusBadge status={i.status} /></td>
                      <td>
                        <span className="issues-tech">
                          <span className="pg-avatar">{initials(i.assignedTechnician)}</span>
                          {i.assignedTechnician || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <div>{ageLabel(i.createdAt)}</div>
                        <div className="pg-xs pg-muted">{i.reporterName}</div>
                      </td>
                      <td>{(i.maintenanceRecords || []).length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="issues-board">
          {BOARD_COLUMNS.map((col) => {
            const items = filtered.filter((i) => col.statuses.includes(i.status));
            return (
              <div key={col.key} className="issues-col">
                <div className="issues-col-head">
                  <span>{col.title}</span>
                  <span className="badge badge-neutral">{items.length}</span>
                </div>
                <div className="issues-col-body">
                  {items.length === 0 && <div className="pg-xs pg-muted issues-col-empty">Nothing here</div>}
                  {items.map((i) => (
                    <button key={i.id} type="button" className="issues-card" onClick={() => navigateTo(`/issues/${i.id}`)}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="mono pg-xs pg-link">{i.issueNumber}</span>
                        <PriorityBadge priority={i.priority} />
                      </div>
                      <div className="pg-strong issues-card-title">{i.title}</div>
                      <div className="pg-xs pg-muted">{assetMap[i.assetId]?.name || 'Unknown asset'}</div>
                      <div className="issues-card-foot">
                        <IssueStatusBadge status={i.status} />
                        <span className="pg-avatar" title={i.assignedTechnician}>{initials(i.assignedTechnician)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Work Order">
        <form onSubmit={submit} className="pg-form-grid" noValidate>
          {formError && (
            <div className="pg-alert danger span-2" role="alert"><AlertTriangle size={15} /> <span>{formError}</span></div>
          )}
          <div className="pg-field span-2">
            <label htmlFor="wo-asset" className="form-label">Asset *</label>
            <select id="wo-asset" className="form-select" value={form.assetId} onChange={(e) => handleAssetChange(e.target.value)}>
              {reportableAssets.map((a) => <option key={a.id} value={a.id}>{a.assetCode} — {a.name} ({a.location})</option>)}
            </select>
          </div>
          <div className="pg-field span-2">
            <label htmlFor="wo-title" className="form-label">Title *</label>
            <input id="wo-title" className="form-input" value={form.title} placeholder="Short summary of the problem" onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="pg-field span-2">
            <label htmlFor="wo-desc" className="form-label">Description *</label>
            <textarea id="wo-desc" rows={4} className="form-textarea" value={form.description} placeholder="What is happening? When did it start? Any noise, smell, error codes?" onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="pg-field">
            <label htmlFor="wo-cat" className="form-label">Category</label>
            <select id="wo-cat" className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="pg-field">
            <label htmlFor="wo-pr" className="form-label">Priority</label>
            <select id="wo-pr" className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {ISSUE_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="pg-field">
            <label htmlFor="wo-rep" className="form-label">Reported by</label>
            <input id="wo-rep" className="form-input" value={form.reporterName} placeholder="Name (optional)" onChange={(e) => setForm({ ...form, reporterName: e.target.value })} />
          </div>
          <div className="pg-field">
            <label htmlFor="wo-tech" className="form-label">Assign technician</label>
            <select id="wo-tech" className="form-select" value={form.assignedTechnician} onChange={(e) => setForm({ ...form, assignedTechnician: e.target.value })}>
              <option value="">Unassigned (status: Reported)</option>
              {TECHNICIANS.map((t) => <option key={t.id} value={t.name}>{t.name} — {t.specialty}</option>)}
            </select>
          </div>
          <div className="pg-actions span-2" style={{ justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-ghost" onClick={() => { setModalOpen(false); navigateTo('/ai-triage', { assetId: form.assetId }); }}>
              <Sparkles size={14} /> Let AI Triage fill this in
            </button>
            <div className="pg-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create work order</button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
