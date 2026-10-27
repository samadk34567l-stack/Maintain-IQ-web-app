import React from 'react';
import {
  Wrench,
  Search,
  AlertTriangle,
  CheckCircle2,
  Archive,
  Flame,
  Clock,
  XOctagon
} from 'lucide-react';
import './Badge.css';

export default function IssueStatusBadge({ status }) {
  const map = {
    'Reported': { cls: 'badge-warning', icon: AlertTriangle },
    'Assigned': { cls: 'badge-info', icon: Clock },
    'Inspection Started': { cls: 'badge-info', icon: Search },
    'Maintenance In Progress': { cls: 'badge-purple', icon: Wrench },
    'Waiting for Parts': { cls: 'badge-danger', icon: XOctagon },
    'Resolved': { cls: 'badge-success', icon: CheckCircle2 },
    'Closed': { cls: 'badge-neutral', icon: Archive },
    'Reopened': { cls: 'badge-danger', icon: Flame }
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
