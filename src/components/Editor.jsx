import { Copy, Download, Redo2, RotateCcw, Trash2, Undo2 } from 'lucide-react';

export default function Editor({ text, setText, settings, canUndo, canRedo, onUndo, onRedo, onCopy, onDownload, onClear, onDropFile }) {
  const onDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) onDropFile(file);
  };

  return (
    <section className="card editor-card" aria-labelledby="editor-title">
      <div className="editor-topbar">
        <div><p className="eyebrow">Workspace</p><h2 id="editor-title">Text editor</h2></div>
        <div className="editor-actions" aria-label="Editor actions">
          <button className="icon-btn" title="Undo transformation" aria-label="Undo transformation" onClick={onUndo} disabled={!canUndo}><Undo2 size={17} aria-hidden="true" /></button>
          <button className="icon-btn" title="Redo transformation" aria-label="Redo transformation" onClick={onRedo} disabled={!canRedo}><Redo2 size={17} aria-hidden="true" /></button>
          <button className="icon-btn" title="Copy" aria-label="Copy current text" onClick={onCopy}><Copy size={17} aria-hidden="true" /></button>
          <button className="icon-btn" title="Download" aria-label="Download current text" onClick={onDownload}><Download size={17} aria-hidden="true" /></button>
          <button className="icon-btn danger-icon" title="Clear" aria-label="Clear current text" onClick={onClear}><Trash2 size={17} aria-hidden="true" /></button>
        </div>
      </div>
      <textarea
        className={`${settings.monospace ? 'mono' : ''} ${settings.wordWrap ? '' : 'nowrap'}`}
        style={{ fontSize: `${settings.fontSize}px` }}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        placeholder="Type or paste your text here…"
        aria-label="Main text editor"
        spellCheck="true"
      />
      <div className="editor-footer">
        <span><RotateCcw size={14} aria-hidden="true" /> Transformation history stores up to 40 actions.</span>
        <span>{settings.autoSaveDraft ? 'Local draft saving is ON' : 'Draft saving is OFF by default'}</span>
      </div>
    </section>
  );
}
