import { useCallback } from 'react';
import ModalShell from './ModalShell';

export default function ConfirmDialog({ open, title, children, onConfirm, onCancel }) {
  const close = useCallback(() => onCancel(), [onCancel]);

  return (
    <ModalShell open={open} onClose={close} labelledBy="confirm-title" describedBy="confirm-description">
      <h2 id="confirm-title">{title}</h2>
      <p id="confirm-description">{children}</p>
      <div className="dialog-actions">
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
        <button className="btn danger" onClick={onConfirm}>Clear text</button>
      </div>
    </ModalShell>
  );
}
