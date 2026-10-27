import React from 'react';
import {
  Wrench,
  Search,
  AlertTriangle,
  CheckCircle2,
  Archive,
  Clock,
  XOctagon
} from 'lucide-react';
import './Badge.css';

export default function AssetStatusBadge({ status }) {
  const map = {
    'Operational': { cls: 'badge-success', icon: CheckCircle2 },
    'Issue Reported': { cls: 'badge-warning', icon: AlertTriangle },
    'Under Inspection': { cls: 'badge-info', icon: Search },
    'Under Maintenance': { cls: 'badge-purple', icon: Wrench },
    'Out of Service': { cls: 'badge-danger', icon: XOctagon },
    'Retired': { cls: 'badge-neutral', icon: Archive }
  };
  const cfg = map[status] || { cls: 'badge-neutral', icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.cls}`}>
      <Icon size={12} />
      <span>{status}</span>
    </span>
  );
}
