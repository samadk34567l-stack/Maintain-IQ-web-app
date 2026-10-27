import React from 'react';
import {
  Bell,
  X
} from 'lucide-react';
import './NotificationBell.css';

export default function NotificationBell({ urgentIssues, notifOpen, setNotifOpen, navigateTo }) {
  return (
  <div className="relative">
    <button
      type="button"
      onClick={() => setNotifOpen(!notifOpen)}
      className="btn btn-secondary relative"
      aria-label="Priority notifications"
    >
      <Bell size={16} />
      {urgentIssues.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-600 text-white miq-fs-10 font-bold px-1.5 rounded-full">
          {urgentIssues.length}
        </span>
      )}
    </button>

    {notifOpen && (
      <div className="notif-panel">
        <div className="card-header">
          <span className="text-xs font-bold text-slate-800">Urgent Open Alerts ({urgentIssues.length})</span>
          <button type="button" onClick={() => setNotifOpen(false)} className="btn btn-ghost btn-sm">
            <X size={14} />
          </button>
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
          {urgentIssues.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No urgent open alerts.</div>
          ) : (
            urgentIssues.map((iss) => (
              <button
                key={iss.id}
                type="button"
                onClick={() => navigateTo(`/issues/${iss.id}`)}
                className="notif-item"
              >
                <div className="flex justify-between miq-fs-11 font-bold text-rose-600">
                  <span>{iss.issueNumber}</span>
                  <span>{iss.priority}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900 mt-0.5 truncate">{iss.title}</div>
                <div className="miq-fs-11 text-slate-500 mt-0.5">
                  Tech: {iss.assignedTechnician} • {iss.status}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    )}
  </div>
  );
}
