import { useCallback } from 'react';
import { X } from 'lucide-react';
import ModalShell from './ModalShell';

export default function SettingsModal({ open, settings, setSettings, onClose, onClearDraft }) {
  const close = useCallback(() => onClose(), [onClose]);

  return (
    <ModalShell open={open} onClose={close} labelledBy="settings-title" describedBy="settings-description" className="settings-dialog">
      <div className="dialog-title-row">
        <div>
          <p className="eyebrow">Preferences</p>
          <h2 id="settings-title">Editor settings</h2>
          <p id="settings-description" className="visually-hidden">Configure editor display and optional local draft storage.</p>
        </div>
        <button className="icon-btn" aria-label="Close settings" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="settings-list">
        <label>
          <span><strong>Editor font size</strong><small>Applies only to the main editor.</small></span>
          <select aria-label="Editor font size" value={settings.fontSize} onChange={(event) => setSettings((value) => ({ ...value, fontSize: Number(event.target.value) }))}>
            <option value="14">14 px</option><option value="16">16 px</option><option value="18">18 px</option><option value="20">20 px</option>
          </select>
        </label>
        <label><span><strong>Monospace editor</strong><small>Useful for code, logs and line-oriented text.</small></span><input type="checkbox" checked={settings.monospace} onChange={(event) => setSettings((value) => ({ ...value, monospace: event.target.checked }))} /></label>
        <label><span><strong>Word wrap</strong><small>Turn off for long code or log lines.</small></span><input type="checkbox" checked={settings.wordWrap} onChange={(event) => setSettings((value) => ({ ...value, wordWrap: event.target.checked }))} /></label>
        <label><span><strong>Auto-save draft locally</strong><small>OFF by default. If enabled, text stays in this browser until cleared.</small></span><input type="checkbox" checked={settings.autoSaveDraft} onChange={(event) => setSettings((value) => ({ ...value, autoSaveDraft: event.target.checked }))} /></label>
      </div>
      {settings.autoSaveDraft && <div className="draft-warning" role="status">Draft storage is enabled. Your text is stored only in this browser using localStorage.</div>}
      <button className="btn ghost full" onClick={onClearDraft}>Clear saved draft</button>
    </ModalShell>
  );
}
