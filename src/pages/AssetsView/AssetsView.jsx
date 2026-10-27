import React, { useState, useMemo } from 'react';
import {
  QrCode,
  Plus,
  Printer,
  Edit3,
  Archive,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { ASSET_CATEGORIES, ASSET_CONDITIONS, ASSET_STATUSES, TECHNICIANS } from '../../data/constants';
import { formatDisplayDate, getTodayDateString, isDateOrderValid } from '../../utils/dateUtils';
import DeterministicQRCodeSVG from '../../components/DeterministicQRCodeSVG/DeterministicQRCodeSVG';
import AssetStatusBadge from '../../components/Badges/AssetStatusBadge';
import Modal from '../../components/Modal/Modal';
import './AssetsView.css';

export default function AssetsView({
  assets,
  settings,
  globalSearch,
  setGlobalSearch,
  initialQuery = {},
  createAsset,
  updateAsset,
  retireAsset,
  navigateTo
}) {
  const [localQuery, setLocalQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialQuery.status || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState(initialQuery.category || 'ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [retireTarget, setRetireTarget] = useState(null);
  const [printAllOpen, setPrintAllOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const defaultForm = {
    assetCode: '',
    name: '',
    category: ASSET_CATEGORIES[0],
    model: '',
    location: '',
    condition: 'Good',
    status: 'Operational',
    lastServiceDate: getTodayDateString(),
    nextServiceDate: '2026-12-31',
    assignedTechnician: TECHNICIANS[0].name,
    publicDescription: ''
  };
  const [formData, setFormData] = useState(defaultForm);

  const effectiveSearch = (globalSearch || localQuery).trim().toLowerCase();

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
      if (effectiveSearch) {
        const hay = `${a.name} ${a.assetCode} ${a.location} ${a.model} ${a.category} ${a.assignedTechnician}`.toLowerCase();
        if (!hay.includes(effectiveSearch)) return false;
      }
      return true;
    });
  }, [assets, statusFilter, categoryFilter, effectiveSearch]);

  const openCreate = () => {
    setEditingAsset(null);
    const nextNum = String(assets.length + 1).padStart(3, '0');
    setFormData({ ...defaultForm, assetCode: `SMIT-AST-${nextNum}` });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      assetCode: asset.assetCode,
      name: asset.name,
      category: asset.category,
      model: asset.model,
      location: asset.location,
      condition: asset.condition,
      status: asset.status,
      lastServiceDate: asset.lastServiceDate,
      nextServiceDate: asset.nextServiceDate,
      assignedTechnician: asset.assignedTechnician,
      publicDescription: asset.publicDescription || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.assetCode.trim() || !formData.name.trim() || !formData.location.trim() || !formData.model.trim()) {
      setFormError('Asset Code, Name, Model, and Location are required.');
      return;
    }
    if (!isDateOrderValid(formData.lastServiceDate, formData.nextServiceDate)) {
      setFormError('Next Service Date must be on or after Last Service Date.');
      return;
    }
    const res = editingAsset ? updateAsset(editingAsset.id, formData) : createAsset(formData);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setModalOpen(false);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  return (
    <div className="assets-view space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Physical Asset Registry & QR Tags</h1>
          <p className="text-xs text-slate-500">
            Stable asset IDs ensure printed QR tags never break when asset names or room locations change.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPrintAllOpen(true)}
            className="btn btn-secondary text-xs"
          >
            <Printer size={15} />
            <span>Print All QR Labels ({assets.length})</span>
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="btn btn-primary text-xs"
          >
            <Plus size={15} />
            <span>Register New Asset</span>
          </button>
        </div>
      </div>

      <div className="card card-pad grid grid-cols-1 miq-grid-2-sm miq-grid-4-lg gap-3 items-end">
        <div>
          <label htmlFor="ast-q" className="form-label mb-1">Search Assets</label>
          <input
            id="ast-q"
            type="search"
            value={globalSearch || localQuery}
            onChange={(e) => {
              if (globalSearch) setGlobalSearch('');
              setLocalQuery(e.target.value);
            }}
            placeholder="Code, name, model, room..."
            className="form-input text-xs py-2"
          />
        </div>
        <div>
          <label htmlFor="ast-st" className="form-label mb-1">Status</label>
          <select
            id="ast-st"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select text-xs py-2"
          >
            <option value="ALL">All Statuses ({assets.length})</option>
            {ASSET_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ast-cat" className="form-label mb-1">Category</label>
          <select
            id="ast-cat"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select text-xs py-2"
          >
            <option value="ALL">All Categories</option>
            {ASSET_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              setLocalQuery('');
              setGlobalSearch('');
              setStatusFilter('ALL');
              setCategoryFilter('ALL');
            }}
            className="btn btn-secondary w-full text-xs py-2"
          >
            <RotateCcw size={14} />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {filteredAssets.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No assets match your current filters.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code & Name</th>
                  <th>Category & Model</th>
                  <th>Location</th>
                  <th>Status & Condition</th>
                  <th>Service Dates</th>
                  <th>Technician</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => {
                  const isRetired = asset.status === 'Retired';
                  return (
                    <tr key={asset.id} className={isRetired ? 'opacity-70' : ''}>
                      <td>
                        <div className="font-mono font-bold text-blue-600 miq-fs-11">{asset.assetCode}</div>
                        <button
                          type="button"
                          onClick={() => navigateTo(`/assets/${asset.id}`)}
                          className="font-bold text-slate-900 text-left"
                        >
                          {asset.name}
                        </button>
                      </td>
                      <td>
                        <div className="font-medium text-slate-800">{asset.category}</div>
                        <div className="miq-fs-11 text-slate-500">{asset.model}</div>
                      </td>
                      <td>{asset.location}</td>
                      <td>
                        <AssetStatusBadge status={asset.status} />
                        <div className="miq-fs-11 text-slate-500 mt-1">Cond: <strong>{asset.condition}</strong></div>
                      </td>
                      <td>
                        <div>Last: <strong>{formatDisplayDate(asset.lastServiceDate)}</strong></div>
                        <div className="text-slate-500">Next: <strong>{formatDisplayDate(asset.nextServiceDate)}</strong></div>
                      </td>
                      <td>{asset.assignedTechnician}</td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => navigateTo(`/assets/${asset.id}`)}
                            className="btn btn-secondary btn-sm"
                          >
                            <QrCode size={13} />
                            <span>QR</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => navigateTo(`/public/assets/${asset.id}`)}
                            className="btn btn-ghost btn-sm"
                            title="Open Public QR Page"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(asset)}
                            className="btn btn-ghost btn-sm"
                            title="Edit Asset"
                          >
                            <Edit3 size={14} />
                          </button>
                          {!isRetired && (
                            <button
                              type="button"
                              onClick={() => setRetireTarget(asset)}
                              className="btn btn-danger btn-sm"
                              title="Retire Asset"
                            >
                              <Archive size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAsset ? `Edit Asset — ${editingAsset.assetCode}` : 'Register New Physical Asset'}
      >
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label mb-1">Unique Asset Code *</label>
              <input
                type="text"
                required
                value={formData.assetCode}
                onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                className="form-input font-mono"
                placeholder="SMIT-AV-007"
              />
            </div>
            <div>
              <label className="form-label mb-1">Asset Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="Classroom Projector 07"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-select"
              >
                {ASSET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label mb-1">Model / Specification *</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="form-input"
                placeholder="Epson EB-2250U"
              />
            </div>
          </div>

          <div>
            <label className="form-label mb-1">Physical Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="form-input"
              placeholder="Block A — Lab 103"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
              >
                {ASSET_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="form-select"
              >
                {ASSET_CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label mb-1">Assigned Tech</label>
              <select
                value={formData.assignedTechnician}
                onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                className="form-select"
              >
                {TECHNICIANS.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label mb-1">Last Service Date</label>
              <input
                type="date"
                value={formData.lastServiceDate}
                onChange={(e) => setFormData({ ...formData, lastServiceDate: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label mb-1">Next Service Due Date</label>
              <input
                type="date"
                value={formData.nextServiceDate}
                onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label mb-1">Safe Public Description (Shown on QR Scan Page)</label>
            <textarea
              rows={2}
              value={formData.publicDescription}
              onChange={(e) => setFormData({ ...formData, publicDescription: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingAsset ? 'Save Asset Changes' : 'Register Asset'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={printAllOpen}
        onClose={() => setPrintAllOpen(false)}
        title={`Printable QR Label Sheet (${assets.length} Assets)`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Each QR code links to the asset's immutable ID route (<code>/public/assets/:id</code>).</span>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-primary btn-sm"
            >
              <Printer size={14} />
              <span>Print Sheet</span>
            </button>
          </div>
          <div className="grid grid-cols-1 miq-grid-2-sm miq-grid-3-md gap-4">
            {assets.map((a) => (
              <div key={a.id} className="border-2 border-slate-800 rounded-xl p-4 text-center bg-white flex flex-col items-center gap-2">
                <div className="miq-fs-10 font-extrabold uppercase tracking-wider text-blue-700">
                  {settings.organizationName}
                </div>
                <div className="p-2 border border-slate-200 rounded-lg">
                  <DeterministicQRCodeSVG value={`${origin}/public/assets/${a.id}`} size={112} />
                </div>
                <div className="font-bold text-xs text-slate-900">{a.name}</div>
                <div className="font-mono miq-fs-11 font-bold text-blue-600">{a.assetCode}</div>
                <div className="miq-fs-11 text-slate-500">{a.location}</div>
                <div className="miq-fs-10 text-slate-400">Scan to view status or report issue</div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(retireTarget)}
        onClose={() => setRetireTarget(null)}
        title="Retire Physical Asset?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Are you sure you want to mark <strong>{retireTarget?.name}</strong> ({retireTarget?.assetCode}) as <strong>Retired</strong>? Retired assets remain readable in history and QR scans but cannot accept new issues.
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRetireTarget(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (retireTarget) retireAsset(retireTarget.id);
                setRetireTarget(null);
              }}
              className="btn btn-danger"
            >
              Confirm Retire
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
