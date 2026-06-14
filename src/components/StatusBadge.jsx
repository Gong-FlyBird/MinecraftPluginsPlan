import { STATUS_MAP, PRIORITY_MAP } from '../utils/helpers';

export function StatusBadge({ status, t }) {
  const s = STATUS_MAP[status];
  if (!s) return null;
  const fn = t || (k => k);
  return (
    <span className={`tag ${s.color}`}>
      {fn(`status.${s.value}`)}
    </span>
  );
}

export function PriorityBadge({ priority, t }) {
  const p = PRIORITY_MAP[priority];
  if (!p) return null;
  const fn = t || (k => k);
  return (
    <span className={`tag ${p.color}`}>
      {fn(`priority.${p.value}`)}
    </span>
  );
}
