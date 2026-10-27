import React from 'react';
import {
  QrCode,
  Shield,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TECHNICIANS } from '../../data/constants';
import './Sidebar.css';

export default function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  navItems,
  route,
  navigateTo,
  role,
  setRole,
  activeTechFilter,
  setActiveTechFilter
}) {
  return (
  <aside
    className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}
  >
    <div className="sidebar-brand">
      <div className="brand-logo-wrap">
        <div className="brand-icon">
          <QrCode size={20} />
        </div>
        {!sidebarCollapsed && (
          <div>
            <div className="brand-title">MaintainIQ</div>
            <span className="brand-subtitle">QR Asset & AI Ops</span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden miq-show-desktop-flex btn btn-ghost btn-sm"
        aria-label="Toggle sidebar width"
      >
        {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </div>

    <nav className="sidebar-nav" aria-label="Sidebar Navigation">
      {!sidebarCollapsed && <div className="nav-section-label">Platform Navigation</div>}
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          route.path === item.path ||
          (item.path === '/assets' && route.path === '/assets/:id') ||
          (item.path === '/issues' && route.path === '/issues/:id');
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigateTo(item.path)}
            className={`nav-item ${isActive ? 'active' : ''}`}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            {!sidebarCollapsed && item.badge !== undefined && (
              <span className={`nav-badge ${item.critical ? 'critical' : ''}`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>

    <div className="sidebar-footer">
      {!sidebarCollapsed ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="miq-fs-10 font-bold uppercase tracking-wider text-slate-400">Demo Role Switch</span>
            <span className="miq-fs-10 px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              UI Demo Only
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setRole('Administrator')}
              className={`btn btn-sm ${role === 'Administrator' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Shield size={13} />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('Technician')}
              className={`btn btn-sm ${role === 'Technician' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <UserCheck size={13} />
              <span>Tech</span>
            </button>
          </div>
          {role === 'Technician' && (
            <div>
              <label htmlFor="side-tech-picker" className="block miq-fs-11 text-slate-400 mb-1">
                Active Technician:
              </label>
              <select
                id="side-tech-picker"
                value={activeTechFilter}
                onChange={(e) => setActiveTechFilter(e.target.value)}
                className="form-select text-xs py-1 px-2"
              >
                {TECHNICIANS.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRole(role === 'Administrator' ? 'Technician' : 'Administrator')}
          className="btn btn-secondary w-full justify-center"
          title={`Current Role: ${role}`}
        >
          {role === 'Administrator' ? <Shield size={18} /> : <UserCheck size={18} />}
        </button>
      )}
    </div>
  </aside>
  );
}
