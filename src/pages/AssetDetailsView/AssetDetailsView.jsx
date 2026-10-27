import React, { useState, useRef } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
  PlusCircle,
  Copy,
  Download
} from 'lucide-react';
import { ISSUE_PRIORITIES, TECHNICIANS } from '../../data/constants';
import { formatDateTime, formatDisplayDate } from '../../utils/dateUtils';
import { runTriageAnalysis } from '../../utils/triageEngine';
import DeterministicQRCodeSVG from '../../components/DeterministicQRCodeSVG/DeterministicQRCodeSVG';
import AssetStatusBadge from '../../components/Badges/AssetStatusBadge';
import IssueStatusBadge from '../../components/Badges/IssueStatusBadge';
import PriorityBadge from '../../components/Badges/PriorityBadge';
import Modal from '../../components/Modal/Modal';
import './AssetDetailsView.css';

export default function AssetDetailsView({ assetId, assets, issues, history, settings, createIssue, addToast, navigateTo }) {
  const asset = assets.find((a) => a.id === assetId);
  const qrWrapRef = useRef(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [issueForm, setIssueForm] = useState({
    title: '',
    description: '',
    priority: 'High',
    reporterName: '',
    assignedTechnician: asset?.assignedTechnician || TECHNICIANS[0].name
  });

  if (!asset) {
    return (
      <div className="card card-pad text-center space-y-3">
        <AlertTriangle size={36} className="text-amber-600 mx-auto" />
        <h1 className="text-lg font-extrabold">Asset Not Found</h1>
        <p className="text-xs text-slate-500">No physical asset matches stable ID <code>{assetId}</code>.</p>
        <button type="button" onClick={() => navigateTo('/assets')} className="btn btn-primary text-xs">
          Back to Assets
        </button>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const publicUrl = `${origin}/public/assets/${asset.id}`;
  const assetIssues = issues.filter((i) => i.assetId === asset.id);
  const assetHistory = history.filter((h) => h.assetId === asset.id);

  const handleCopyUrl = () => {
    try {
      const input = document.createElement('textarea');
      input.value = publicUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      addToast('Public QR URL copied to clipboard!', 'success');
    } catch (_) {
      addToast('Copied public URL!', 'info');
    }
  };

  const handleDownloadQR = () => {
    const svgEl = qrWrapRef.current?.querySelector('svg');
    if (!svgEl) return;
    const svgStr = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.assetCode}-QR.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Downloaded ${asset.assetCode}-QR.svg`, 'success');
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!issueForm.title.trim() || !issueForm.description.trim()) {
      setFormError('Title and symptom description are required.');
      return;
    }
    const triage = runTriageAnalysis({
      complaintText: `${issueForm.title}. ${issueForm.description}`,
      asset,
      existingIssues: issues
    });
    const res = createIssue({
      ...issueForm,
      assetId: asset.id,
      category: asset.category,
      aiSuggestions: triage.ok ? triage.suggestion : null
    });
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setReportOpen(false);
    navigateTo(`/issues/${res.issue.id}`);
  };

  return (
    <div className="asset-details-view space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigateTo('/assets')}
            className="btn btn-secondary text-xs"
          >
            <ArrowLeft size={14} />
            <span>Assets</span>
          </button>
          <span className="font-mono text-xs font-bold text-blue-600">{asset.assetCode}</span>
          <AssetStatusBadge status={asset.status} />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigateTo(`/public/assets/${asset.id}`)}
            className="btn btn-secondary text-xs"
          >
            <ExternalLink size={14} />
            <span>Open Public QR Page</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/ai-triage', { assetId: asset.id })}
            className="btn btn-secondary border-purple-200 bg-purple-50 text-purple-700 text-xs"
          >
            <Sparkles size={14} />
            <span>AI Triage for Asset</span>
          </button>
          <button
            type="button"
            disabled={asset.status === 'Retired'}
            onClick={() => setReportOpen(true)}
            className="btn btn-primary text-xs"
          >
            <PlusCircle size={14} />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 miq-grid-3-lg gap-6">
        <div className="miq-span-2-lg space-y-6">
          <div className="card card-pad space-y-4">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">{asset.name}</h1>
              <p className="text-xs text-slate-500 mt-1">{asset.model}</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{asset.publicDescription}</p>
            <dl className="asset-facts">
              <div><dt>Category</dt><dd>{asset.category}</dd></div>
              <div><dt>Location</dt><dd>{asset.location}</dd></div>
              <div><dt>Condition</dt><dd>{asset.condition}</dd></div>
              <div><dt>Assigned Technician</dt><dd>{asset.assignedTechnician}</dd></div>
              <div><dt>Last Service</dt><dd>{formatDisplayDate(asset.lastServiceDate)}</dd></div>
              <div><dt>Next Service Due</dt><dd>{formatDisplayDate(asset.nextServiceDate)}</dd></div>
            </dl>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Issues on this asset ({assetIssues.length})</h2>
            </div>
            {assetIssues.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No issues reported for this asset.</div>
            ) : (
              <div className="divide-y">
                {assetIssues.map((iss) => (
                  <button
                    key={iss.id}
                    type="button"
                    onClick={() => navigateTo(`/issues/${iss.id}`)}
                    className="asset-issue-row"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono miq-fs-11 font-bold text-blue-600">{iss.issueNumber}</span>
                      <div className="flex items-center gap-1.5">
                        <PriorityBadge priority={iss.priority} />
                        <IssueStatusBadge status={iss.status} />
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mt-1">{iss.title}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Activity timeline</h2>
            </div>
            {assetHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No activity recorded yet.</div>
            ) : (
              <ul className="asset-timeline">
                {assetHistory.map((h) => (
                  <li key={h.id}>
                    <div className="miq-fs-11 text-slate-400">{formatDateTime(h.timestamp)} • {h.actor}</div>
                    <div className="text-xs text-slate-700">{h.description}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card card-pad text-center space-y-3">
            <h2 className="card-title">QR service tag</h2>
            <div ref={qrWrapRef} className="asset-qr-box">
              <DeterministicQRCodeSVG value={publicUrl} size={160} />
            </div>
            <div className="font-mono miq-fs-11 text-slate-500 asset-qr-url">{publicUrl}</div>
            <div className="flex justify-center gap-2">
              <button type="button" onClick={handleCopyUrl} className="btn btn-secondary btn-sm">
                <Copy size={13} />
                <span>Copy URL</span>
              </button>
              <button type="button" onClick={handleDownloadQR} className="btn btn-secondary btn-sm">
                <Download size={13} />
                <span>Download QR</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        title={`Report Issue — ${asset.name}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
          {formError && <div className="asset-form-error" role="alert">{formError}</div>}
          <div>
            <label className="form-label mb-1" htmlFor="rep-title">Issue Title *</label>
            <input
              id="rep-title"
              type="text"
              value={issueForm.title}
              onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label mb-1" htmlFor="rep-desc">Symptoms *</label>
            <textarea
              id="rep-desc"
              rows={3}
              value={issueForm.description}
              onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
              className="form-textarea"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label mb-1" htmlFor="rep-prio">Priority</label>
              <select
                id="rep-prio"
                value={issueForm.priority}
                onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value })}
                className="form-select"
              >
                {ISSUE_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label mb-1" htmlFor="rep-tech">Assigned Technician</label>
              <select
                id="rep-tech"
                value={issueForm.assignedTechnician}
                onChange={(e) => setIssueForm({ ...issueForm, assignedTechnician: e.target.value })}
                className="form-select"
              >
                {TECHNICIANS.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label mb-1" htmlFor="rep-name">Reporter Name</label>
            <input
              id="rep-name"
              type="text"
              value={issueForm.reporterName}
              onChange={(e) => setIssueForm({ ...issueForm, reporterName: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setReportOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Submit Issue</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
