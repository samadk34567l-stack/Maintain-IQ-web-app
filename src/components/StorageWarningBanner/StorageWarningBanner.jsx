import React from 'react';
import {
  AlertTriangle
} from 'lucide-react';
import './StorageWarningBanner.css';

export default function StorageWarningBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="storage-banner" role="alert">
      <div className="storage-banner-text">
        <AlertTriangle size={15} />
        <span>{message}</span>
      </div>
      <button type="button" onClick={onDismiss} className="storage-banner-dismiss">
        Dismiss
      </button>
    </div>
  );
}
