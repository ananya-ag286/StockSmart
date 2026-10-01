import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No records found', message = 'There are no items to display at this time.', actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <Inbox size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
      <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</h4>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: actionLabel ? '16px' : '0' }}>{message}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
