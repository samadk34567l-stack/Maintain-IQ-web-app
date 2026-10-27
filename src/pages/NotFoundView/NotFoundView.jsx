import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import './NotFoundView.css';

export default function NotFoundView({ currentPath, navigateTo }) {
  return (
    <div className="not-found-view card card-pad">
      <AlertTriangle size={36} className="not-found-icon" />
      <h1 className="not-found-title">404 — Page Not Found</h1>
      <p className="not-found-text">
        No route matches <code>{currentPath}</code>. Check the address or go back to the dashboard.
      </p>
      <button type="button" className="btn btn-primary" onClick={() => navigateTo('/dashboard')}>
        <ArrowLeft size={14} />
        <span>Back to Dashboard</span>
      </button>
    </div>
  );
}
