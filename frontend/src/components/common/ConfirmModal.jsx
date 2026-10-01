import React from 'react';
import Modal from './Modal';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', confirmVariant = 'danger', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>{message}</p>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button type="button" className={`btn btn-${confirmVariant}`} onClick={onConfirm} disabled={loading}>
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}

