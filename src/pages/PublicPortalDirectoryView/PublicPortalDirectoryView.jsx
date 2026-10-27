import React, { useMemo, useState } from 'react';
import { QrCode, Search, MapPin, LogIn, ArrowRight } from 'lucide-react';
import { ASSET_CATEGORIES, ASSET_STATUSES } from '../../data/constants';
import AssetStatusBadge from '../../components/Badges/AssetStatusBadge';
import DeterministicQRCodeSVG from '../../components/DeterministicQRCodeSVG/DeterministicQRCodeSVG';
import './PublicPortalDirectoryView.css';

export default function PublicPortalDirectoryView({ assets, issues, settings, navigateTo }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  const openCounts = useMemo(() => {
    const counts = {};
    issues.forEach((i) => {
      if (!['Resolved', 'Closed'].includes(i.status)) counts[i.assetId] = (counts[i.assetId] || 0) + 1;
    });
    return counts;
  }, [issues]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && a.category !== categoryFilter) return false;
      if (!q) return true;
      return [a.name, a.assetCode, a.location, a.category].some((v) => String(v).toLowerCase().includes(q));
    });
  }, [assets, query, statusFilter, categoryFilter]);

  const operationalCount = assets.filter((a) => a.status === 'Operational').length;

  return (
    <div className="public-portal-view">
      <header className="pub-dir-header">
        <div className="pub-dir-inner">
          <div className="pub-dir-topline">
            <div className="pub-dir-brand">
              <div className="pub-dir-brand-icon">
                <QrCode size={20} />
              </div>
              <div>
                <div className="pub-dir-brand-name">{settings.organizationName}</div>
                <div className="pub-dir-brand-sub">Public asset directory</div>
              </div>
            </div>
            <button type="button" onClick={() => navigateTo('/dashboard')} className="btn btn-secondary btn-sm">
              <LogIn size={14} />
              <span>Staff sign in</span>
            </button>
          </div>
          <h1 className="pub-dir-title">Check any campus asset and report a problem in under a minute.</h1>
          <p className="pub-dir-lead">
            Scan the QR tag on the equipment, or pick it from the list below. You will see its current status and
            can send a fault report straight to the maintenance team.
          </p>
        </div>
      </header>

      <main className="pub-dir-main">
        <section className="card pub-dir-filters" aria-label="Filter assets">
          <div className="pub-dir-search">
            <Search size={15} className="pub-dir-search-icon" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, asset code or room (e.g. SMIT-AV-001)"
              className="form-input"
              aria-label="Search assets"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            {ASSET_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            {ASSET_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </section>

        <p className="pub-dir-count">
          Showing {filtered.length} of {assets.length} assets · {operationalCount} operational
        </p>

        {filtered.length === 0 ? (
          <div className="card card-pad pub-dir-empty">
            <p className="pub-dir-empty-title">No assets match your search</p>
            <p className="pub-dir-empty-text">Try a different name or room, or clear the filters.</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setQuery('');
                setStatusFilter('All');
                setCategoryFilter('All');
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="pub-dir-grid">
            {filtered.map((a) => (
              <li key={a.id} className="card pub-dir-card">
                <div className="pub-dir-card-top">
                  <div className="pub-dir-qr">
                    <DeterministicQRCodeSVG value={`${origin}/public/assets/${a.id}`} size={72} />
                  </div>
                  <div className="pub-dir-card-head">
                    <div className="pub-dir-asset-code">{a.assetCode}</div>
                    <h2 className="pub-dir-asset-name">{a.name}</h2>
                    <AssetStatusBadge status={a.status} />
                  </div>
                </div>
                <div className="pub-dir-location">
                  <MapPin size={13} />
                  <span>{a.location}</span>
                </div>
                <p className="pub-dir-desc">{a.publicDescription}</p>
                <div className="pub-dir-card-foot">
                  <span className="pub-dir-open">
                    {openCounts[a.id] ? `${openCounts[a.id]} open report${openCounts[a.id] > 1 ? 's' : ''}` : 'No open reports'}
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigateTo(`/public/assets/${a.id}`)}
                  >
                    <span>{a.status === 'Retired' ? 'View details' : 'View & report'}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
