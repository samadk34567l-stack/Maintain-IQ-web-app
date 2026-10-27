import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, Sparkles, ShieldAlert, Repeat, Wrench, Plus, Lock, RotateCcw, AlertTriangle,
  CheckCircle2, ClipboardList, Box, Check
} from 'lucide-react';
import { ALLOWED_TRANSITIONS, ASSET_CONDITIONS, TECHNICIANS } from '../../data/constants';
import { formatDateTime, formatDisplayDate, getTodayDateString } from '../../utils/dateUtils';
import PriorityBadge from '../../components/Badges/PriorityBadge';
import IssueStatusBadge from '../../components/Badges/IssueStatusBadge';
import AssetStatusBadge from '../../components/Badges/AssetStatusBadge';
import Modal from '../../components/Modal/Modal';
import './IssueDetailsView.css';

const STEPS = ['Reported', 'Assigned', 'Inspection Started', 'Maintenance In Progress', 'Resolved', 'Closed'];

function stepIndexFor(status) {
  if (status === 'Waiting for Parts') return 3;
  if (status === 'Reopened') return 1;
  return Math.max(0, STEPS.indexOf(status));
}

export default function IssueDetailsView({
  issueId,
  issues,
  assets,
  history,
  activeTechFilter,
  updateIssueWorkflow,
  addMaintenanceRecord,
  navigateTo
}) {
  const issue = issues.find((i) => i.id === issueId);
  const asset = issue ? assets.find((a) => a.id === issue.assetId) : null;

  const [nextStatus, setNextStatus] = useState('');
  const [tech, setTech] = useState('');
  const [note, setNote] = useState('');
  const [wfError, setWfError] = useState('');
  const [recOpen, setRecOpen] = useState(false);
  const [recError, setRecError] = useState('');
  const [rec, setRec] = useState(null);

  const timeline = useMemo(
    () => history.filter((h) => h.issueId === issueId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [history, issueId]
  );

  if (!issue) {
    return (
      <div className="card pg-empty">
        <ClipboardList size={40} />
        <strong>Work order not found</strong>
        <span>It may have been removed, or the link is wrong.</span>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigateTo('/issues')}>Back to work orders</button>
      </div>
    );
  }

  const records = issue.maintenanceRecords || [];
  const totalCost = records.reduce((s, r) => s + (Number(r.cost) || 0), 0);
  const options = ALLOWED_TRANSITIONS[issue.status] || [];
  const isClosed = issue.status === 'Closed';
  const currentTech = tech || issue.assignedTechnician || '';
  const techChanged = tech && tech !== issue.assignedTechnician;
  const canApply = !!nextStatus || techChanged;
  const stepIdx = stepIndexFor(issue.status);
  const ai = issue.aiSuggestions;

  const applyWorkflow = (e) => {
    e.preventDefault();
    setWfError('');
    const res = updateIssueWorkflow(issue.id, {
      nextStatus: nextStatus || undefined,
      assignedTechnician: techChanged ? tech : undefined,
      note: note.trim() || undefined
    });
    if (!res.ok) return setWfError(res.error);
    setNextStatus('');
    setTech('');
    setNote('');
  };

  const reopen = () => {
    setWfError('');
    const res = updateIssueWorkflow(issue.id, { nextStatus: 'Reopened', note: note.trim() || undefined });
    if (!res.ok) return setWfError(res.error);
    setNote('');
  };

  const openRecord = () => {
    setRec({
      date: getTodayDateString(),
      technician: issue.assignedTechnician || activeTechFilter,
      inspectionFindings: '',
      workPerformed: '',
      partsReplaced: '',
      cost: '0',
      timeSpent: '',
      finalCondition: asset?.condition || 'Good',
      notes: '',
      markResolved: false
    });
    setRecError('');
    setRecOpen(true);
  };

  const saveRecord = (e) => {
    e.preventDefault();
    setRecError('');
    if (rec.inspectionFindings.trim().length < 5) return setRecError('Please describe the inspection findings.');
    if (rec.workPerformed.trim().length < 5) return setRecError('Please describe the work performed.');
    const { markResolved, ...payload } = rec;
    const res = addMaintenanceRecord(issue.id, payload, markResolved);
    if (!res.ok) return setRecError(res.error);
    setRecOpen(false);
  };

  return (
    <div className="pg issue-details">
      <div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigateTo('/issues')}>
          <ArrowLeft size={14} /> All work orders
        </button>
      </div>

      <div className="card card-pad">
        <div className="pg-head">
          <div style={{ minWidth: 0 }}>
            <div className="mono pg-xs pg-muted">{issue.issueNumber}</div>
            <h1 className="pg-title">{issue.title}</h1>
            <div className="pg-actions" style={{ marginTop: 8 }}>
              <PriorityBadge priority={issue.priority} />
              <IssueStatusBadge status={issue.status} />
              <span className="badge badge-neutral">{issue.category}</span>
            </div>
          </div>
          <div className="pg-actions">
            <button type="button" className="btn btn-primary" onClick={openRecord} disabled={isClosed}>
              <Plus size={15} /> Log maintenance
            </button>
          </div>
        </div>

        <ol className="issue-steps" aria-label="Workflow progress">
          {STEPS.map((s, idx) => {
            const state = idx < stepIdx ? 'done' : idx === stepIdx ? 'current' : 'todo';
            return (
              <li key={s} className={`issue-step ${state}`}>
                <span className="issue-step-dot">{state === 'done' ? <Check size={12} /> : idx + 1}</span>
                <span className="issue-step-label">{s}</span>
              </li>
            );
          })}
        </ol>
        {issue.status === 'Waiting for Parts' && (
          <div className="pg-alert warn" style={{ marginTop: 12 }}><AlertTriangle size={15} /><span>Work is paused while waiting for parts. Move it back to <b>Maintenance In Progress</b> once they arrive.</span></div>
        )}
        {issue.status === 'Reopened' && (
          <div className="pg-alert danger" style={{ marginTop: 12 }}><RotateCcw size={15} /><span>This work order was reopened. Re-assign or restart inspection.</span></div>
        )}
      </div>

      <div className="pg-cols">
        <div className="pg-stack">
          <div className="card card-pad">
            <h2 className="card-title" style={{ marginBottom: 8 }}>Problem description</h2>
            <p className="issue-desc">{issue.description}</p>
            <dl className="pg-facts" style={{ marginTop: 16 }}>
              <div><dt>Reported by</dt><dd>{issue.reporterName}</dd></div>
              <div><dt>Reported on</dt><dd>{formatDateTime(issue.createdAt)}</dd></div>
              <div><dt>Assigned technician</dt><dd>{issue.assignedTechnician || 'Unassigned'}</dd></div>
              <div><dt>Total maintenance cost</dt><dd>PKR {totalCost.toLocaleString()}</dd></div>
            </dl>
          </div>

          {ai && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2"><Sparkles size={15} /> AI triage analysis</h2>
                <span className="badge badge-purple">{ai.confidenceLabel || 'Rule-based'}</span>
              </div>
              <div className="card-pad pg-stack">
                {ai.safetyNotice && (
                  <div className="pg-alert danger"><ShieldAlert size={15} /><span>{ai.safetyNotice}</span></div>
                )}
                {ai.recurringWarning && (
                  <div className="pg-alert warn"><Repeat size={15} /><span>{ai.recurringWarning}</span></div>
                )}
                <div className="issue-ai-grid">
                  <div>
                    <h3 className="issue-h3">Possible causes</h3>
                    <ul className="pg-list">{(ai.possibleCauses || []).map((c, i) => <li key={i}>{c}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="issue-h3">Safe initial checks</h3>
                    <ul className="pg-list">{(ai.safeInitialChecks || []).map((c, i) => <li key={i}>{c}</li>)}</ul>
                  </div>
                </div>
                <p className="pg-xs pg-muted">Rule-based suggestion for guidance only — always follow site safety procedures.</p>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Maintenance records ({records.length})</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={openRecord} disabled={isClosed}><Wrench size={13} /> Add record</button>
            </div>
            {records.length === 0 ? (
              <div className="pg-empty">
                <Wrench size={30} />
                <strong>No maintenance logged yet</strong>
                <span>At least one record is required before this work order can be marked Resolved.</span>
              </div>
            ) : (
              <div className="card-pad pg-stack">
                {records.map((r) => (
                  <div key={r.id} className="issue-record">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="pg-strong">{r.technician} <span className="pg-muted" style={{ fontWeight: 500 }}>• {formatDisplayDate(r.date)}</span></span>
                      <span className="badge badge-info">PKR {Number(r.cost).toLocaleString()} • {r.timeSpent}</span>
                    </div>
                    <dl className="issue-record-dl">
                      <dt>Findings</dt><dd>{r.inspectionFindings}</dd>
                      <dt>Work done</dt><dd>{r.workPerformed}</dd>
                      <dt>Parts</dt><dd>{r.partsReplaced}</dd>
                      <dt>Condition after</dt><dd>{r.finalCondition}</dd>
                      {r.notes && (<><dt>Notes</dt><dd>{r.notes}</dd></>)}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pg-stack">
          <div className="card">
            <div className="card-header"><h2 className="card-title">Workflow</h2></div>
            <div className="card-pad">
              {isClosed ? (
                <div className="pg-stack">
                  <div className="pg-alert info"><Lock size={15} /><span>This work order is closed and locked. Reopen it to make changes.</span></div>
                  {wfError && <div className="pg-alert danger" role="alert"><AlertTriangle size={15} /><span>{wfError}</span></div>}
                  <button type="button" className="btn btn-secondary" onClick={reopen}><RotateCcw size={14} /> Reopen work order</button>
                </div>
              ) : (
                <form onSubmit={applyWorkflow} className="pg-stack">
                  {wfError && <div className="pg-alert danger" role="alert"><AlertTriangle size={15} /><span>{wfError}</span></div>}
                  <div className="pg-field">
                    <label className="form-label" htmlFor="wf-status">Move to status</label>
                    <select id="wf-status" className="form-select" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                      <option value="">— Keep {issue.status} —</option>
                      {options.map((s) => {
                        const blocked = s === 'Resolved' && records.length === 0;
                        return <option key={s} value={s} disabled={blocked}>{s}{blocked ? ' (log maintenance first)' : ''}</option>;
                      })}
                    </select>
                  </div>
                  <div className="pg-field">
                    <label className="form-label" htmlFor="wf-tech">Assigned technician</label>
                    <select id="wf-tech" className="form-select" value={currentTech} onChange={(e) => setTech(e.target.value)}>
                      {!issue.assignedTechnician && <option value="">Unassigned</option>}
                      {TECHNICIANS.map((t) => <option key={t.id} value={t.name}>{t.name} — {t.specialty}</option>)}
                    </select>
                  </div>
                  <div className="pg-field">
                    <label className="form-label" htmlFor="wf-note">Note (saved in timeline)</label>
                    <textarea id="wf-note" rows={2} className="form-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={!canApply}><CheckCircle2 size={14} /> Apply changes</button>
                  {issue.status === 'Resolved' && (
                    <p className="pg-xs pg-muted">Resolved work can be moved to <b>Closed</b> to lock it, or <b>Reopened</b> if the fault returns.</p>
                  )}
                </form>
              )}
            </div>
          </div>

          {asset && (
            <div className="card card-pad pg-stack">
              <h2 className="card-title flex items-center gap-2"><Box size={15} /> Asset</h2>
              <div>
                <div className="pg-strong">{asset.name}</div>
                <div className="pg-xs pg-muted mono">{asset.assetCode}</div>
              </div>
              <AssetStatusBadge status={asset.status} />
              <dl className="pg-facts" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
                <div><dt>Location</dt><dd>{asset.location}</dd></div>
                <div><dt>Condition</dt><dd>{asset.condition}</dd></div>
                <div><dt>Next service</dt><dd>{formatDisplayDate(asset.nextServiceDate)}</dd></div>
              </dl>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigateTo(`/assets/${asset.id}`)}>View asset details</button>
            </div>
          )}

          <div className="card">
            <div className="card-header"><h2 className="card-title">Activity on this work order</h2></div>
            {timeline.length === 0 ? (
              <div className="pg-empty"><span>No activity recorded yet.</span></div>
            ) : (
              <ul className="issue-timeline">
                {timeline.map((ev) => (
                  <li key={ev.id}>
                    <div className="pg-xs pg-muted">{formatDateTime(ev.timestamp)} • {ev.actor}</div>
                    <div className="pg-xs" style={{ color: 'var(--navy-800)' }}>{ev.description}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={recOpen} onClose={() => setRecOpen(false)} title={`Log maintenance — ${issue.issueNumber}`}>
        {rec && (
          <form onSubmit={saveRecord} className="pg-form-grid" noValidate>
            {recError && <div className="pg-alert danger span-2" role="alert"><AlertTriangle size={15} /><span>{recError}</span></div>}
            <div className="pg-field">
              <label className="form-label" htmlFor="mr-date">Date</label>
              <input id="mr-date" type="date" className="form-input" value={rec.date} onChange={(e) => setRec({ ...rec, date: e.target.value })} />
            </div>
            <div className="pg-field">
              <label className="form-label" htmlFor="mr-tech">Technician</label>
              <select id="mr-tech" className="form-select" value={rec.technician} onChange={(e) => setRec({ ...rec, technician: e.target.value })}>
                {TECHNICIANS.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div className="pg-field span-2">
              <label className="form-label" htmlFor="mr-find">Inspection findings *</label>
              <textarea id="mr-find" rows={2} className="form-textarea" value={rec.inspectionFindings} onChange={(e) => setRec({ ...rec, inspectionFindings: e.target.value })} />
            </div>
            <div className="pg-field span-2">
              <label className="form-label" htmlFor="mr-work">Work performed *</label>
              <textarea id="mr-work" rows={2} className="form-textarea" value={rec.workPerformed} onChange={(e) => setRec({ ...rec, workPerformed: e.target.value })} />
            </div>
            <div className="pg-field">
              <label className="form-label" htmlFor="mr-parts">Parts replaced</label>
              <input id="mr-parts" className="form-input" value={rec.partsReplaced} placeholder="None" onChange={(e) => setRec({ ...rec, partsReplaced: e.target.value })} />
            </div>
            <div className="pg-field">
              <label className="form-label" htmlFor="mr-cost">Cost (PKR)</label>
              <input id="mr-cost" type="number" min="0" step="1" className="form-input" value={rec.cost} onChange={(e) => setRec({ ...rec, cost: e.target.value })} />
            </div>
            <div className="pg-field">
              <label className="form-label" htmlFor="mr-time">Time spent</label>
              <input id="mr-time" className="form-input" value={rec.timeSpent} placeholder="e.g. 2.5 hrs" onChange={(e) => setRec({ ...rec, timeSpent: e.target.value })} />
            </div>
            <div className="pg-field">
              <label className="form-label" htmlFor="mr-cond">Asset condition after work</label>
              <select id="mr-cond" className="form-select" value={rec.finalCondition} onChange={(e) => setRec({ ...rec, finalCondition: e.target.value })}>
                {ASSET_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="pg-field span-2">
              <label className="form-label" htmlFor="mr-notes">Notes</label>
              <input id="mr-notes" className="form-input" value={rec.notes} placeholder="Optional" onChange={(e) => setRec({ ...rec, notes: e.target.value })} />
            </div>
            <label className="pg-check span-2">
              <input type="checkbox" checked={rec.markResolved} onChange={(e) => setRec({ ...rec, markResolved: e.target.checked })} />
              Work is complete — mark this work order Resolved
            </label>
            <div className="pg-actions span-2" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setRecOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save record</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
