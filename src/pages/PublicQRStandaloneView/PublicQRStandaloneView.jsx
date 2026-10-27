import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle2, MapPin, Send, Archive } from 'lucide-react';
import { ISSUE_PRIORITIES } from '../../data/constants';
import { formatDisplayDate } from '../../utils/dateUtils';
import { runTriageAnalysis } from '../../utils/triageEngine';
import AssetStatusBadge from '../../components/Badges/AssetStatusBadge';
import DeterministicQRCodeSVG from '../../components/DeterministicQRCodeSVG/DeterministicQRCodeSVG';
import './PublicQRStandaloneView.css';

const EMPTY_FORM = { reporterName: '', title: '', description: '', priority: 'Medium' };

export default function PublicQRStandaloneView({ assetId, assets, issues, settings, createIssue, navigateTo }) {
  const asset = assets.find((a) => a.id === assetId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  if (!asset) {
    return (
      <div className="public-qr-view">
        <div className="card card-pad pub-qr-notfound">
          <AlertTriangle size={36} className="pub-qr-notfound-icon" />
          <h1 className="pub-qr-notfound-title">Asset not found</h1>
          <p className="pub-qr-notfound-text">
            No asset matches the tag <code>{assetId}</code>. The QR label may be damaged or outdated.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => navigateTo('/public')}>
            <ArrowLeft size={14} />
            <span>Browse all assets</span>
          </button>
        </div>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const publicUrl = `${origin}/public/assets/${asset.id}`;
  const isRetired = asset.status === 'Retired';
  const openCount = issues.filter((i) => i.assetId === asset.id && !['Resolved', 'Closed'].includes(i.status)).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Please add a short title and describe what is wrong.');
      return;
    }
    const triage = runTriageAnalysis({
      complaintText: `${form.title}. ${form.description}`,
      asset,
      existingIssues: issues
    });
    const res = createIssue({
      title: form.title,
      description: form.description,
      priority: form.priority,
      reporterName: form.reporterName,
      assetId: asset.id,
      category: asset.category,
      aiSuggestions: triage.ok ? triage.suggestion : null
    });
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setSubmitted(res.issue);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="public-qr-view">
      <header className="pub-qr-header">
        <div className="pub-qr-header-inner">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigateTo('/public')}>
            <ArrowLeft size={14} />
            <span>All assets</span>
          </button>
          <span className="pub-qr-org">{settings.organizationName}</span>
        </div>
      </header>

      <main className="pub-qr-main">
        <section className="card card-pad pub-qr-asset" aria-label="Asset details">
          <div className="pub-qr-asset-head">
            <div>
              <div className="pub-qr-code">{asset.assetCode}</div>
              <h1 className="pub-qr-name">{asset.name}</h1>
              <div className="pub-qr-status-row">
                <AssetStatusBadge status={asset.status} />
                <span className="pub-qr-open">
                  {openCount ? `${openCount} open report${openCount > 1 ? 's' : ''}` : 'No open reports'}
                </span>
              </div>
            </div>
            <div className="pub-qr-qr">
              <DeterministicQRCodeSVG value={publicUrl} size={96} />
            </div>
          </div>

          <p className="pub-qr-desc">{asset.publicDescription}</p>

          <dl className="pub-qr-facts">
            <div>
              <dt>Category</dt>
              <dd>{asset.category}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd className="pub-qr-loc"><MapPin size={13} />{asset.location}</dd>
            </div>
            <div>
              <dt>Last serviced</dt>
              <dd>{formatDisplayDate(asset.lastServiceDate)}</dd>
            </div>
            <div>
              <dt>Next service due</dt>
              <dd>{formatDisplayDate(asset.nextServiceDate)}</dd>
            </div>
          </dl>
        </section>

        <section className="card card-pad pub-qr-report" aria-label="Report an issue">
          {isRetired ? (
            <div className="pub-qr-retired">
              <Archive size={28} />
              <h2 className="pub-qr-section-title">This asset is retired</h2>
              <p>Retired assets stay viewable here but cannot accept new issue reports.</p>
            </div>
          ) : submitted ? (
            <div className="pub-qr-success" role="status">
              <CheckCircle2 size={34} className="pub-qr-success-icon" />
              <h2 className="pub-qr-section-title">Report sent</h2>
              <p>
                Work order <strong>{submitted.issueNumber}</strong> was created and assigned to the maintenance
                team. Keep this number if you need to follow up.
              </p>
              <button type="button" className="btn btn-secondary" onClick={() => setSubmitted(null)}>
                Report another problem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pub-qr-form" noValidate>
              <h2 className="pub-qr-section-title">Something wrong with this asset?</h2>
              {formError && <div className="pub-qr-error" role="alert">{formError}</div>}
              <div>
                <label className="form-label" htmlFor="pq-name">Your name (optional)</label>
                <input
                  id="pq-name"
                  type="text"
                  className="form-input"
                  value={form.reporterName}
                  onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                  placeholder="e.g. Ayesha, Web Dev batch 12"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="pq-title">What is the problem? *</label>
                <input
                  id="pq-title"
                  type="text"
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Short summary"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="pq-desc">Describe what you see *</label>
                <textarea
                  id="pq-desc"
                  rows={4}
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="When it started, any noise, smell, error message..."
                />
              </div>
              <div>
                <label className="form-label" htmlFor="pq-prio">How urgent is it?</label>
                <select
                  id="pq-prio"
                  className="form-select"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  {ISSUE_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary pub-qr-submit">
                <Send size={14} />
                <span>Send report</span>
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
