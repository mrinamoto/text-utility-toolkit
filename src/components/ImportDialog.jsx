import { useCallback } from 'react';
import { FilePlus2, Replace } from 'lucide-react';
import ModalShell from './ModalShell';

export default function ImportDialog({ pendingImport, onReplace, onAppend, onCancel }) {
  const open = Boolean(pendingImport);
  const close = useCallback(() => onCancel(), [onCancel]);

  return (
    <ModalShell open={open} onClose={close} labelledBy="import-title" describedBy="import-description" className="import-dialog">
      <p className="eyebrow">Import safety</p>
      <h2 id="import-title">Editor already contains text</h2>
      <p id="import-description">
        {pendingImport ? `Choose how to import “${pendingImport.name}”. Replace keeps the imported file only; Append adds it after the current text.` : ''}
      </p>
      <div className="import-choice-grid">
        <button className="choice-button" onClick={onReplace}>
          <Replace size={18} aria-hidden="true" />
          <span><strong>Replace current text</strong><small>The current editor state remains available through transformation Undo.</small></span>
        </button>
        <button className="choice-button" onClick={onAppend}>
          <FilePlus2 size={18} aria-hidden="true" />
          <span><strong>Append imported text</strong><small>Add the file after the existing content without deleting it.</small></span>
        </button>
      </div>
      <div className="dialog-actions">
        <button className="btn ghost" onClick={onCancel}>Cancel import</button>
      </div>
    </ModalShell>
  );
}
