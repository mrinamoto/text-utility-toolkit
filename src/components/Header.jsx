import { Download, FileUp, Moon, Settings, Sun, WandSparkles } from 'lucide-react';

export default function Header({ theme, onTheme, onImportClick, onDownload, onSettings }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark"><WandSparkles size={20} aria-hidden="true" /></div>
        <div><h1>Text Utility Toolkit</h1><p>Analyze, clean and transform text instantly.</p></div>
      </div>
      <div className="header-actions" aria-label="Application actions">
        <button className="btn ghost icon-text" aria-label="Import local text file" onClick={onImportClick}><FileUp size={16} aria-hidden="true" /> <span>Import</span></button>
        <button className="btn ghost icon-text" aria-label="Download current text" onClick={onDownload}><Download size={16} aria-hidden="true" /> <span>Download</span></button>
        <button className="icon-btn" aria-label="Open settings" onClick={onSettings}><Settings size={18} aria-hidden="true" /></button>
        <button className="icon-btn" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={onTheme}>{theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}</button>
      </div>
    </header>
  );
}
