import { STATUS_MAP, PRIORITY_MAP } from '../utils/helpers';

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status];
  if (!s) return null;
  return (
    <span className={`tag ${s.color}`}>
      {s.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY_MAP[priority];
  if (!p) return null;
  return (
    <span className={`tag ${p.color}`}>
      {p.label}
    </span>
  );
}
