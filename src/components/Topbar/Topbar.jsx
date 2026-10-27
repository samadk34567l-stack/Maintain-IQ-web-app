import React from 'react';
import {
  QrCode,
  Search,
  Shield,
  UserCheck,
  Menu,
  Award,
  LogOut
} from 'lucide-react';
import NotificationBell from '../NotificationBell/NotificationBell';
import './Topbar.css';

export default function Topbar({
  mobileMenuOpen,
  setMobileMenuOpen,
  globalSearch,
  setGlobalSearch,
  route,
  navigateTo,
  onOpenGuide,
  urgentIssues,
  notifOpen,
  setNotifOpen,
  role,
  currentUser,
  onLogout
}) {
  return (
  <header className="topbar">
    <div className="flex items-center gap-3 flex-1 max-w-xl">
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="miq-hide-desktop btn btn-ghost btn-sm"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3 miq-top-half miq-center-y text-slate-400" />
        <input
          type="search"
          value={globalSearch}
          onChange={(e) => {
            setGlobalSearch(e.target.value);
            if (route.path !== '/assets' && route.path !== '/issues') {
              navigateTo('/assets');
            }
          }}
          placeholder="Global search assets (SMIT-AV-001), rooms, or issues..."
          className="form-input pl-9 py-1.5 text-sm"
          aria-label="Global search"
        />
      </div>
    </div>

    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => navigateTo('/public')}
        className="hidden miq-show-md-inline-flex btn btn-secondary text-xs"
      >
        <QrCode size={14} className="text-emerald-600" />
        <span>Public QR Portal</span>
      </button>
      <button
        type="button"
        onClick={() => onOpenGuide()}
        className="hidden miq-show-sm-inline-flex btn btn-secondary text-xs"
      >
        <Award size={14} className="text-amber-600" />
        <span>Hackathon Demo Guide</span>
      </button>

      <NotificationBell
        urgentIssues={urgentIssues}
        notifOpen={notifOpen}
        setNotifOpen={setNotifOpen}
        navigateTo={navigateTo}
      />

      <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
        <span className={`badge ${role === 'Administrator' ? 'badge-info' : 'badge-purple'}`}>
          {role === 'Administrator' ? <Shield size={13} /> : <UserCheck size={13} />}
          <span className="hidden miq-show-md-inline">
            {currentUser?.fullName?.split(' ')[0]} • {role}
          </span>
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="btn btn-danger btn-sm"
          title="Sign Out"
        >
          <LogOut size={13} />
          <span className="hidden miq-show-sm-inline">Sign Out</span>
        </button>
      </div>
    </div>
  </header>
  );
}
