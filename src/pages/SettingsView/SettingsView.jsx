import React, { useMemo, useState } from 'react';
import { Building2, UserCircle2, Users, Database, Download, RotateCcw, LogOut, Lock, Shield, UserCheck, AlertTriangle, Save } from 'lucide-react';
import { STORAGE_VERSION, TECHNICIANS } from '../../data/constants';
import { formatDateTime } from '../../utils/dateUtils';
import Modal from '../../components/Modal/Modal';
import './SettingsView.css';

export default function SettingsView({
  settings,
  store,
  role,
  setRole,
  currentUser,
  registeredUsers,
  onLogout,
  updateSettings,
  handleResetDemoData,
  addToast,
  navigateTo
}) {
  const isAdmin = role === 'Administrator';
  const [orgName, setOrgName] = useState(settings.organizationName || '');
  const [campus, setCampus] = useState(settings.campusLocation || '');
  const [error, setError] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const dirty = orgName.trim() !== (settings.organizationName || '') || campus.trim() !== (settings.campusLocation || '');

  const dataStats = useMemo(() => {
    const json = JSON.stringify(store);
    const bytes = new Blob([json]).size;
    return {
      kb: (bytes / 1024).toFixed(1),
      pct: Math.min(100, (bytes / (5 * 1024 * 1024)) * 100),
      assets: store.assets.length,
      issues: store.issues.length,
      records: store.issues.reduce((s, i) => s + (i.maintenanceRecords || []).length, 0),
      history: store.history.length
    };
  }, [store]);

  const techLoad = useMemo(() => TECHNICIANS.map((t) => ({
    ...t,
    open: store.issues.filter((i) => i.assignedTechnician === t.name && !['Resolved', 'Closed'].includes(i.status)).length,
    assets: store.assets.filter((a) => a.assignedTechnician === t.name && a.status !== 'Retired').length
  })), [store]);

  const save = (e) => {
    e.preventDefault();
    setError('');
    if (!isAdmin) return setError('Only administrators can change organization settings.');
    if (orgName.trim().length < 3) return setError('Organization name must be at least 3 characters.');
    updateSettings({ organizationName: orgName.trim(), campusLocation: campus.trim(), isDemoSeed: false });
  };

  const downloadBackup = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), version: STORAGE_VERSION, data: store }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintainiq-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    addToast?.('Backup downloaded.', 'success');
  };

  const confirmReset = () => {
    handleResetDemoData();
    setResetOpen(false);
    setConfirmText('');
    setOrgName('SMIT Main Campus Facilities');
    setCampus('Bahadurabad & Gulshan Campus, Karachi');
  };

  return (
    <div className="pg settings-view">
      <div className="pg-head">
        <div>
          <h1 className="pg-title">Settings & Auth Users</h1>
          <p className="pg-sub">Organization details, accounts, team roster and data management.</p>
        </div>
        <span className={`badge ${isAdmin ? 'badge-info' : 'badge-neutral'}`}>
          {isAdmin ? <Shield size={12} /> : <UserCheck size={12} />} {role}
        </span>
      </div>

      {!isAdmin && (
        <div className="pg-alert info"><Lock size={15} /><span>You are viewing as a Technician. Organization settings, user list and data tools are read-only or hidden. Switch to Administrator to manage them.</span></div>
      )}

      <div className="pg-cols even">
        <div className="pg-stack">
          <form className="card" onSubmit={save}>
            <div className="card-header"><h2 className="card-title flex items-center gap-2"><Building2 size={15} /> Organization</h2></div>
            <div className="card-pad pg-stack">
              {error && <div className="pg-alert danger" role="alert"><AlertTriangle size={15} /><span>{error}</span></div>}
              <div className="pg-field">
                <label className="form-label" htmlFor="st-org">Organization display name</label>
                <input id="st-org" className="form-input" value={orgName} disabled={!isAdmin} onChange={(e) => setOrgName(e.target.value)} />
              </div>
              <div className="pg-field">
                <label className="form-label" htmlFor="st-campus">Campus / site location</label>
                <input id="st-campus" className="form-input" value={campus} disabled={!isAdmin} onChange={(e) => setCampus(e.target.value)} />
              </div>
              <p className="pg-xs pg-muted">The organization name appears on the public QR portal and on printed asset labels.</p>
              <div className="pg-actions">
                <button type="submit" className="btn btn-primary" disabled={!isAdmin || !dirty}><Save size={14} /> Save changes</button>
                {dirty && isAdmin && (
                  <button type="button" className="btn btn-ghost" onClick={() => { setOrgName(settings.organizationName || ''); setCampus(settings.campusLocation || ''); setError(''); }}>Discard</button>
                )}
              </div>
            </div>
          </form>

          <div className="card">
            <div className="card-header"><h2 className="card-title flex items-center gap-2"><UserCircle2 size={15} /> My account</h2></div>
            <div className="card-pad pg-stack">
              <div className="set-profile">
                <span className="set-avatar">{(currentUser?.fullName || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="pg-strong">{currentUser?.fullName}</div>
                  <div className="pg-xs pg-muted">{currentUser?.email}</div>
                </div>
              </div>
              <dl className="pg-facts">
                <div><dt>Role</dt><dd>{currentUser?.role}</dd></div>
                <div><dt>Department</dt><dd>{currentUser?.department || '—'}</dd></div>
                <div><dt>Organization</dt><dd>{currentUser?.organization || '—'}</dd></div>
                <div><dt>Signed in</dt><dd>{formatDateTime(currentUser?.loggedInAt)}</dd></div>
              </dl>
              <div className="set-role-switch">
                <span className="form-label">Demo view as</span>
                <div className="pg-seg">
                  <button type="button" className={isAdmin ? 'on' : ''} onClick={() => setRole('Administrator')}><Shield size={13} /> Administrator</button>
                  <button type="button" className={!isAdmin ? 'on' : ''} onClick={() => setRole('Technician')}><UserCheck size={13} /> Technician</button>
                </div>
                <span className="pg-xs pg-muted">Switches the interface only. Your real account role stays {currentUser?.role}.</span>
              </div>
              <div><button type="button" className="btn btn-danger" onClick={onLogout}><LogOut size={14} /> Sign out</button></div>
            </div>
          </div>
        </div>

        <div className="pg-stack">
          <div className="card">
            <div className="card-header"><h2 className="card-title flex items-center gap-2"><Database size={15} /> Data & storage</h2><span className="badge badge-neutral mono">{STORAGE_VERSION}</span></div>
            <div className="card-pad pg-stack">
              <div className="set-counts">
                <div><b>{dataStats.assets}</b><span>Assets</span></div>
                <div><b>{dataStats.issues}</b><span>Work orders</span></div>
                <div><b>{dataStats.records}</b><span>Maint. records</span></div>
                <div><b>{dataStats.history}</b><span>Timeline events</span></div>
              </div>
              <div>
                <div className="flex items-center justify-between pg-xs" style={{ marginBottom: 4 }}>
                  <span className="pg-strong">Browser storage used</span><span className="pg-muted">{dataStats.kb} KB of ~5 MB</span>
                </div>
                <div className="pg-bar"><span style={{ width: `${Math.max(2, dataStats.pct)}%` }} /></div>
              </div>
              <p className="pg-xs pg-muted">Data lives in this browser only (localStorage). Download a backup before clearing browser data.</p>
              <div className="pg-actions">
                <button type="button" className="btn btn-secondary" onClick={downloadBackup}><Download size={14} /> Download JSON backup</button>
                {isAdmin && (
                  <button type="button" className="btn btn-danger" onClick={() => setResetOpen(true)}><RotateCcw size={14} /> Reset demo data</button>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2 className="card-title flex items-center gap-2"><Users size={15} /> Technician roster</h2></div>
            <div className="pg-table-wrap">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Specialty</th><th>Open</th><th>Assets</th></tr></thead>
                <tbody>
                  {techLoad.map((t) => (
                    <tr key={t.id}>
                      <td><div className="pg-strong">{t.name}</div><div className="pg-xs pg-muted">{t.badge}</div></td>
                      <td>{t.specialty}</td>
                      <td><button type="button" className="pg-link" onClick={() => navigateTo('/issues')}>{t.open}</button></td>
                      <td>{t.assets}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="card">
          <div className="card-header"><h2 className="card-title flex items-center gap-2"><Users size={15} /> Registered users ({registeredUsers.length})</h2></div>
          {registeredUsers.length === 0 ? (
            <div className="pg-empty"><span>No accounts registered yet.</span></div>
          ) : (
            <div className="pg-table-wrap">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Created</th></tr></thead>
                <tbody>
                  {registeredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="pg-strong">{u.fullName}{currentUser?.id === u.id && <span className="badge badge-success" style={{ marginLeft: 8 }}>You</span>}</td>
                      <td>{u.email}</td>
                      <td><span className={`badge ${u.role === 'Administrator' ? 'badge-info' : 'badge-neutral'}`}>{u.role}</span></td>
                      <td>{u.department || '—'}</td>
                      <td>{formatDateTime(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="card-pad"><p className="pg-xs pg-muted">Passwords are never displayed. This is a demo authentication system stored in the browser, not for production use.</p></div>
        </div>
      )}

      <Modal isOpen={resetOpen} onClose={() => { setResetOpen(false); setConfirmText(''); }} title="Reset demo data?" maxWidth="max-w-md">
        <div className="pg-stack">
          <div className="pg-alert danger"><AlertTriangle size={15} /><span>This permanently replaces all assets, work orders, records and timeline events with the original demo data. Registered user accounts are kept.</span></div>
          <div className="pg-field">
            <label className="form-label" htmlFor="st-confirm">Type <b>RESET</b> to confirm</label>
            <input id="st-confirm" className="form-input" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
          </div>
          <div className="pg-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setResetOpen(false); setConfirmText(''); }}>Cancel</button>
            <button type="button" className="btn btn-danger" disabled={confirmText.trim().toUpperCase() !== 'RESET'} onClick={confirmReset}>Reset everything</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
