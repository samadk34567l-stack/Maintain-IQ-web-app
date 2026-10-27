import React from 'react';
import {
  Flame,
  ShieldAlert,
  ArrowUpCircle,
  MinusCircle
} from 'lucide-react';
import './Badge.css';

export default function PriorityBadge({ priority }) {
  const map = {
    'Critical': { cls: 'badge-danger', icon: Flame, prefix: 'P1 • ' },
    'High': { cls: 'badge-warning', icon: ShieldAlert, prefix: 'P2 • ' },
    'Medium': { cls: 'badge-info', icon: ArrowUpCircle, prefix: 'P3 • ' },
    'Low': { cls: 'badge-neutral', icon: MinusCircle, prefix: 'P4 • ' }
  };
  const cfg = map[priority] || { cls: 'badge-neutral', icon: MinusCircle, prefix: '' };
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.cls}`}>
      <Icon size={12} />
      <span>{cfg.prefix}{priority}</span>
    </span>
  );
}
