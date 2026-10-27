import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles, Loader2, ShieldAlert, Repeat, ListChecks, Stethoscope, FilePlus2, AlertTriangle, RotateCcw, BookOpen
} from 'lucide-react';
import { ASSET_CATEGORIES, ISSUE_PRIORITIES } from '../../data/constants';
import { runTriageAnalysis, TRIAGE_RULES } from '../../utils/triageEngine';
import PriorityBadge from '../../components/Badges/PriorityBadge';
import './AITriageView.css';

const SAMPLES = [
  { label: 'Projector flicker', assetId: 'ast-proj-01', text: 'The projector keeps losing HDMI signal and the screen flickers purple during lectures.' },
  { label: 'AC leaking', assetId: 'ast-ac-02', text: 'Water is dripping from the AC indoor unit onto the cable trunking and the cooling is very weak.' },
  { label: 'Pump grinding', assetId: 'ast-pump-06', text: 'The water pump is making a loud grinding noise and the motor trips a few seconds after startup.' },
  { label: 'Slow computer', assetId: 'ast-comp-03', text: 'This workstation freezes and takes ages to boot whenever students run docker builds, fan is very loud.' },
  { label: 'Printer jam', assetId: 'ast-prn-04', text: 'Paper keeps jamming in tray 2 when printing double sided and there are streaks on the page.' },
  { label: 'Elevator stuck', assetId: 'ast-elev-05', text: 'The elevator door is stuck on the 3rd floor and there is a burning smell with sparks near the control panel.' }
];

const STAGES = ['Reading complaint…', 'Matching symptom keywords…', 'Checking asset history…', 'Building recommendations…'];

export default function AITriageView({ assets, issues, initialAssetId, createIssue, addToast, navigateTo }) {
  const reportable = useMemo(() => assets.filter((a) => a.status !== 'Retired'), [assets]);
  const [assetId, setAssetId] = useState(() => (reportable.some((a) => a.id === initialAssetId) ? initialAssetId : ''));
  const [complaint, setComplaint] = useState('');
  const [reporter, setReporter] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState(null); // { suggestion, complaint, assetId }
  const [edit, setEdit] = useState({ title: '', category: '', priority: 'Medium' });
  const [autoAssign, setAutoAssign] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const asset = reportable.find((a) => a.id === assetId) || null;

  const stats = useMemo(() => {
    const withAi = issues.filter((i) => i.aiSuggestions);
    const byRule = {};
    withAi.forEach((i) => {
      const k = i.aiSuggestions.ruleMatched || 'other';
      byRule[k] = (byRule[k] || 0) + 1;
    });
    return { total: withAi.length, byRule, max: Math.max(1, ...Object.values(byRule)) };
  }, [issues]);

  const analyze = (e) => {
    e?.preventDefault();
    setError('');
    const res = runTriageAnalysis({ complaintText: complaint, asset, existingIssues: issues });
    if (!res.ok) {
      setResult(null);
      return setError(res.error);
    }
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setBusy(true);
    setResult(null);
    setStage(0);
    STAGES.forEach((_, idx) => {
      if (idx > 0) timers.current.push(setTimeout(() => setStage(idx), idx * 380));
    });
    timers.current.push(
      setTimeout(() => {
        setResult({ suggestion: res.suggestion, complaint: complaint.trim(), assetId });
        setEdit({
          title: res.suggestion.suggestedTitle,
          category: res.suggestion.suggestedCategory,
          priority: res.suggestion.suggestedPriority
        });
        setBusy(false);
      }, STAGES.length * 380)
    );
  };

  const useSample = (s) => {
    setComplaint(s.text);
    if (reportable.some((a) => a.id === s.assetId)) setAssetId(s.assetId);
    setResult(null);
    setError('');
  };

  const reset = () => {
    setComplaint('');
    setResult(null);
    setError('');
  };

  const createFromAnalysis = () => {
    if (!result) return;
    const target = reportable.find((a) => a.id === result.assetId);
    if (!target) return setError('Select the asset this problem belongs to before creating a work order.');
    if (edit.title.trim().length < 5) return setError('Work order title is too short.');
    const res = createIssue({
      assetId: target.id,
      title: edit.title,
      description: result.complaint,
      category: edit.category,
      priority: edit.priority,
      reporterName: reporter,
      assignedTechnician: autoAssign ? target.assignedTechnician : undefined,
      aiSuggestions: {
        ...result.suggestion,
        suggestedTitle: edit.title.trim(),
        suggestedCategory: edit.category,
        suggestedPriority: edit.priority
      }
    });
    if (!res.ok) return setError(res.error);
    addToast?.('AI-assisted work order created.', 'success');
    navigateTo(`/issues/${res.issue.id}`);
  };

  const sg = result?.suggestion;
  const resultAsset = result ? reportable.find((a) => a.id === result.assetId) : null;
  const highRisk = sg && (edit.priority === 'Critical' || /safety|hazard|stop/i.test(sg.safetyNotice || ''));

  return (
    <div className="pg ai-triage-view">
      <div className="pg-head">
        <div>
          <h1 className="pg-title flex items-center gap-2"><Sparkles size={20} /> AI Issue Triage</h1>
          <p className="pg-sub">Describe the problem in plain words. Get a likely category, priority, causes and safe first checks, then turn it into a work order.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setShowRules((v) => !v)}>
          <BookOpen size={14} /> {showRules ? 'Hide' : 'Show'} rule library
        </button>
      </div>

      <div className="pg-cols even">
        <form className="card card-pad pg-stack" onSubmit={analyze}>
          <h2 className="card-title">1. Describe the problem</h2>

          <div className="pg-field">
            <label className="form-label" htmlFor="tri-asset">Asset (optional, improves accuracy)</label>
            <select id="tri-asset" className="form-select" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
              <option value="">— Not sure / general request —</option>
              {reportable.map((a) => <option key={a.id} value={a.id}>{a.assetCode} — {a.name}</option>)}
            </select>
          </div>

          <div className="pg-field">
            <label className="form-label" htmlFor="tri-text">What is wrong? *</label>
            <textarea
              id="tri-text"
              rows={6}
              className="form-textarea"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="e.g. The AC is dripping water near the sockets and not cooling properly since morning..."
            />
            <div className="pg-xs pg-muted" style={{ textAlign: 'right' }}>{complaint.trim().length} characters (min 10)</div>
          </div>

          <div>
            <div className="form-label" style={{ marginBottom: 6 }}>Try an example</div>
            <div className="pg-actions">
              {SAMPLES.map((s) => (
                <button key={s.label} type="button" className="chip" onClick={() => useSample(s)}>{s.label}</button>
              ))}
            </div>
          </div>

          {error && <div className="pg-alert danger" role="alert"><AlertTriangle size={15} /><span>{error}</span></div>}

          <div className="pg-actions">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <Loader2 size={15} className="pg-spin" /> : <Sparkles size={15} />} {busy ? 'Analyzing…' : 'Analyze problem'}
            </button>
            {(complaint || result) && (
              <button type="button" className="btn btn-ghost" onClick={reset} disabled={busy}><RotateCcw size={14} /> Clear</button>
            )}
          </div>
        </form>

        <div className="pg-stack">
          {!busy && !result && (
            <div className="card pg-empty tri-placeholder">
              <Sparkles size={36} />
              <strong>Your analysis will appear here</strong>
              <span>Write a complaint (or pick an example) and press Analyze.</span>
            </div>
          )}

          {busy && (
            <div className="card card-pad pg-stack">
              <h2 className="card-title">Analyzing…</h2>
              <ul className="tri-stages">
                {STAGES.map((s, idx) => (
                  <li key={s} className={idx < stage ? 'done' : idx === stage ? 'now' : ''}>
                    {idx === stage ? <Loader2 size={13} className="pg-spin" /> : <span className="tri-stage-dot" />} {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!busy && sg && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">2. Review the analysis</h2>
                <span className="badge badge-purple">{sg.confidenceLabel}</span>
              </div>
              <div className="card-pad pg-stack">
                {sg.safetyNotice && (
                  <div className={`pg-alert ${highRisk ? 'danger' : 'warn'}`}><ShieldAlert size={15} /><span>{sg.safetyNotice}</span></div>
                )}
                {sg.recurringWarning && (
                  <div className="pg-alert warn"><Repeat size={15} /><span>{sg.recurringWarning}</span></div>
                )}

                <div className="pg-field">
                  <label className="form-label" htmlFor="tri-title">Suggested work order title</label>
                  <input id="tri-title" className="form-input" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
                </div>
                <div className="pg-form-grid">
                  <div className="pg-field">
                    <label className="form-label" htmlFor="tri-cat">Category</label>
                    <select id="tri-cat" className="form-select" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>
                      {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="pg-field">
                    <label className="form-label" htmlFor="tri-pri">Priority</label>
                    <select id="tri-pri" className="form-select" value={edit.priority} onChange={(e) => setEdit({ ...edit, priority: e.target.value })}>
                      {ISSUE_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pg-xs pg-muted">AI suggested: <PriorityBadge priority={sg.suggestedPriority} /> — you can change it above.</div>

                <div>
                  <h3 className="tri-h3"><Stethoscope size={14} /> Possible causes</h3>
                  <ul className="pg-list">{sg.possibleCauses.map((c, i) => <li key={i}>{c}</li>)}</ul>
                </div>
                <div>
                  <h3 className="tri-h3"><ListChecks size={14} /> Safe initial checks</h3>
                  <ul className="pg-list">{sg.safeInitialChecks.map((c, i) => <li key={i}>{c}</li>)}</ul>
                </div>

                <hr className="tri-hr" />
                <h2 className="card-title">3. Create the work order</h2>
                {!resultAsset ? (
                  <div className="pg-alert info"><span>Pick the asset in the form on the left and analyze again to create a work order. Retired assets can't receive issues.</span></div>
                ) : (
                  <div className="pg-stack">
                    <div className="pg-xs pg-muted">For <b>{resultAsset.name}</b> ({resultAsset.assetCode}) • {resultAsset.location}</div>
                    <div className="pg-field">
                      <label className="form-label" htmlFor="tri-rep">Reported by (optional)</label>
                      <input id="tri-rep" className="form-input" value={reporter} onChange={(e) => setReporter(e.target.value)} placeholder="Your name" />
                    </div>
                    <label className="pg-check">
                      <input type="checkbox" checked={autoAssign} onChange={(e) => setAutoAssign(e.target.checked)} />
                      Auto-assign to {resultAsset.assignedTechnician}
                    </label>
                    <button type="button" className="btn btn-primary" onClick={createFromAnalysis}>
                      <FilePlus2 size={15} /> Create work order
                    </button>
                  </div>
                )}
                <p className="pg-xs pg-muted">Rule-based demo triage. Suggestions are guidance only and don't replace a qualified technician.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pg-cols even">
        <div className="card">
          <div className="card-header"><h2 className="card-title">Triage usage so far</h2><span className="badge badge-neutral">{stats.total} AI-assisted</span></div>
          <div className="card-pad pg-stack">
            {stats.total === 0 && <span className="pg-xs pg-muted">No AI-assisted work orders yet.</span>}
            {Object.entries(stats.byRule).map(([rule, n]) => (
              <div key={rule}>
                <div className="flex items-center justify-between pg-xs" style={{ marginBottom: 4 }}>
                  <span className="pg-strong">{rule.replace(/_/g, ' ')}</span><span className="pg-muted">{n}</span>
                </div>
                <div className="pg-bar"><span style={{ width: `${(n / stats.max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        {showRules && (
          <div className="card">
            <div className="card-header"><h2 className="card-title">Rule library ({TRIAGE_RULES.length})</h2></div>
            <div className="card-pad pg-stack">
              {TRIAGE_RULES.map((r) => (
                <div key={r.id} className="tri-rule">
                  <div className="flex items-center justify-between gap-2">
                    <span className="pg-strong">{r.category}</span>
                    <PriorityBadge priority={r.priority} />
                  </div>
                  <div className="tri-kw">
                    {r.keywords.slice(0, 10).map((k) => <span key={k} className="chip chip-static">{k}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
