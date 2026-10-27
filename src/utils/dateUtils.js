// Date helpers (original section 2)

export function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.split('T')[0];
  const parts = clean.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '—';
  const d = parseLocalDate(dateStr) || new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

export function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getDaysUntil(dateStr) {
  const target = parseLocalDate(dateStr);
  const today = parseLocalDate(getTodayDateString());
  if (!target || !today) return null;
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isDateOrderValid(lastDateStr, nextDateStr) {
  if (!lastDateStr || !nextDateStr) return true;
  const d1 = parseLocalDate(lastDateStr);
  const d2 = parseLocalDate(nextDateStr);
  if (!d1 || !d2) return false;
  return d2.getTime() >= d1.getTime();
}
