import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;

  const isDanger = type === 'error' || type === 'danger';
  const Icon = isDanger ? AlertTriangle : CheckCircle;

  return (
    <div className={`alert ${isDanger ? 'alert-danger' : 'alert-success'}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={18} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
