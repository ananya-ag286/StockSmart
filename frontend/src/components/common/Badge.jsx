import React from 'react';

export default function Badge({ type, text }) {
  const norm = (type || text || '').toLowerCase();
  let badgeClass = 'badge-ok';

  if (norm.includes('pending')) badgeClass = 'badge-pending';
  else if (norm.includes('process')) badgeClass = 'badge-processed';
  else if (norm.includes('cancel')) badgeClass = 'badge-cancelled';
  else if (norm.includes('store')) badgeClass = 'badge-store';
  else if (norm.includes('warehouse')) badgeClass = 'badge-warehouse';
  else if (norm.includes('critical')) badgeClass = 'badge-critical';
  else if (norm.includes('warning')) badgeClass = 'badge-warning';

  return <span className={`badge ${badgeClass}`}>{text || type}</span>;
}
