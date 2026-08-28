import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, LockKeyhole, Sparkles } from 'lucide-react';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import Editor from './components/Editor';
import ToolPanel from './components/ToolPanel';
import TextInsights from './components/TextInsights';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import ImportDialog from './components/ImportDialog';
import SettingsModal from './components/SettingsModal';
import { useTextHistory } from './hooks/useTextHistory';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { SAMPLE_TEXT } from './data/sampleText';
import {
  calculateStats, calculateWordFrequency, cleanLineList, cleanParagraphs, countMatches,
  normalizeLineBreaks, removeBlankLines, removeDuplicateLines, removeExtraSpaces, removeNumbers,
  removePunctuation, replaceText, reverseLineOrder, reverseText, reverseWordOrder, sortLines,
  toggleCase, toLowercase, toSentenceCase, toTitleCase, toUppercase, trimEachLine, trimText,
} from './utils/textUtils';
import { copyText, downloadText, readTextFile } from './utils/fileUtils';
import { safeRead, safeRemove, safeWrite, STORAGE_KEYS } from './utils/storage';

const DEFAULT_SETTINGS = { fontSize: 16, monospace: false, wordWrap: true, autoSaveDraft: false };

function loadInitialSettings() {
  const stored = safeRead(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...(stored && typeof stored === 'object' ? stored : {}) };
}

export default function App() {
  const [settings, setSettings] = useState(loadInitialSettings);
  const [initialText] = useState(() => {
    if (!settings.autoSaveDraft) return '';
    const draft = safeRead(STORAGE_KEYS.draft, '');
    return typeof draft === 'string' ? draft : '';
  });
  const history = useTextHistory(initialText);
  const [theme, setTheme] = useState(() => safeRead(STORAGE_KEYS.theme, 'light') === 'dark' ? 'dark' : 'light');
  const [duplicateOptions, setDuplicateOptions] = useState({ caseSensitive: true, ignoreSurroundingSpaces: false });
  const [sortCaseSensitive, setSortCaseSensitive] = useState(false);
  const [findState, setFindState] = useState({ find: '', replace: '', caseSensitive: false, regex: false });
  const [ignoreCommonWords, setIgnoreCommonWords] = useState(true);
  const [toast, setToast] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);
  const fileInput = useRef(null);
  const toastTimer = useRef(null);

  const stats = useMemo(() => calculateStats(history.text), [history.text]);
  const frequencyText = useDebouncedValue(history.text, 150);
  const frequency = useMemo(
    () => calculateWordFrequency(frequencyText, ignoreCommonWords, 8),
    [frequencyText, ignoreCommonWords],
  );
  const findMeta = useMemo(
    () => countMatches(history.text, findState.find, { caseSensitive: findState.caseSensitive, regex: findState.regex }),
    [history.text, findState.find, findState.caseSensitive, findState.regex],
  );

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2300);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    safeWrite(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.settings, settings);
    safeWrite(STORAGE_KEYS.dataVersion, 1);
    if (!settings.autoSaveDraft) safeRemove(STORAGE_KEYS.draft);
  }, [settings]);

  useEffect(() => {
    if (settings.autoSaveDraft) safeWrite(STORAGE_KEYS.draft, history.text);
  }, [settings.autoSaveDraft, history.text]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const applyTool = useCallback((tool) => {
    const current = history.text;
    let next = current;
    let message = '';

    switch (tool) {
      case 'uppercase': next = toUppercase(current); message = 'Converted to uppercase'; break;
      case 'lowercase': next = toLowercase(current); message = 'Converted to lowercase'; break;
      case 'title': next = toTitleCase(current); message = 'Converted to Title Case'; break;
      case 'sentence': next = toSentenceCase(current); message = 'Converted to sentence case'; break;
      case 'toggle': next = toggleCase(current); message = 'Character case toggled'; break;
      case 'extraSpaces': next = removeExtraSpaces(current); message = 'Repeated spaces and tabs cleaned'; break;
      case 'trim': next = trimText(current); message = 'Outer whitespace trimmed'; break;
      case 'trimLines': next = trimEachLine(current); message = 'Each line trimmed'; break;
      case 'blankLines': {
        const before = current ? normalizeLineBreaks(current).split('\n').length : 0;
        next = removeBlankLines(current);
        const after = next ? next.split('\n').length : 0;
        const removed = Math.max(0, before - after);
        message = `${removed} blank line${removed === 1 ? '' : 's'} removed`;
        break;
      }
      case 'normalize': next = normalizeLineBreaks(current); message = 'Line breaks normalized to LF'; break;
      case 'duplicates': {
        const result = removeDuplicateLines(current, duplicateOptions);
        next = result.text;
        message = `${result.removed} duplicate line${result.removed === 1 ? '' : 's'} removed · ${result.unique} unique lines`;
        break;
      }
      case 'sortAsc': next = sortLines(current, 'asc', sortCaseSensitive); message = 'Text sorted A → Z'; break;
      case 'sortDesc': next = sortLines(current, 'desc', sortCaseSensitive); message = 'Text sorted Z → A'; break;
      case 'sortLengthAsc': next = sortLines(current, 'length-asc', sortCaseSensitive); message = 'Lines sorted shortest → longest'; break;
      case 'sortLengthDesc': next = sortLines(current, 'length-desc', sortCaseSensitive); message = 'Lines sorted longest → shortest'; break;
      case 'reverse': next = reverseText(current); message = 'Characters reversed'; break;
      case 'reverseLines': next = reverseLineOrder(current); message = 'Line order reversed'; break;
      case 'reverseWords': next = reverseWordOrder(current); message = 'Word order reversed per line'; break;
      case 'removeNumbers': next = removeNumbers(current); message = 'Numbers removed'; break;
      case 'removePunctuation': next = removePunctuation(current); message = 'Punctuation and symbols removed'; break;
      case 'cleanParagraphs': next = cleanParagraphs(current); message = 'Clean paragraphs preset applied'; break;
      case 'cleanLineList': {
        const result = cleanLineList(current, duplicateOptions);
        next = result.text;
        message = `Line list cleaned · ${result.removed} duplicates removed`;
        break;
      }
      default: return;
    }

    if (next === current) {
      notify(current ? 'No changes were needed' : 'Add some text first');
      return;
    }
    history.applyTransformation(next);
    notify(message);
  }, [duplicateOptions, history.applyTransformation, history.text, notify, sortCaseSensitive]);

  useEffect(() => {
    const onKey = (event) => {
      const key = event.key.toLocaleLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const tagName = event.target?.tagName;

      if (ctrl && key === 'z') {
        if (tagName === 'TEXTAREA' && !event.shiftKey) return;
        event.preventDefault();
        event.shiftKey ? history.redo() : history.undo();
        return;
      }
      if (ctrl && key === 'y') {
        event.preventDefault();
        history.redo();
        return;
      }

      if (tagName === 'INPUT' || tagName === 'SELECT' || event.target?.isContentEditable) return;
      if (event.altKey && key === 'u') { event.preventDefault(); applyTool('uppercase'); }
      if (event.altKey && key === 'l') { event.preventDefault(); applyTool('lowercase'); }
      if (event.altKey && key === 'd') { event.preventDefault(); applyTool('duplicates'); }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [applyTool, history.redo, history.undo]);

  const handleReplace = useCallback((all, remove = false) => {
    const result = replaceText(
      history.text,
      findState.find,
      remove ? '' : findState.replace,
      { all, caseSensitive: findState.caseSensitive, regex: findState.regex },
    );
    if (result.error) { notify(`Regex error: ${result.error}`); return; }
    if (!result.replaced) { notify(findState.find ? 'No matches found' : 'Enter text to find'); return; }
    history.applyTransformation(result.text);
    notify(`${result.replaced} match${result.replaced === 1 ? '' : 'es'} ${remove ? 'removed' : 'replaced'}`);
  }, [findState, history.applyTransformation, history.text, notify]);

  const handleCopy = useCallback(async () => {
    try { await copyText(history.text); notify('Copied to clipboard'); }
    catch { notify('Clipboard access was unavailable'); }
  }, [history.text, notify]);

  const commitImportedText = useCallback((importedText, name, mode = 'replace') => {
    const current = history.text;
    let next = importedText;

    if (mode === 'append') {
      const separator = current && importedText && !current.endsWith('\n') && !importedText.startsWith('\n') ? '\n' : '';
      next = `${current}${separator}${importedText}`;
    }

    history.replaceTextImmediately(next, true);
    notify(`${name} ${mode === 'append' ? 'appended' : 'imported'}`);
  }, [history.replaceTextImmediately, history.text, notify]);

  const handleImport = useCallback(async (file) => {
    try {
      const imported = await readTextFile(file);
      if (history.text) {
        setPendingImport({ text: imported, name: file.name });
      } else {
        commitImportedText(imported, file.name, 'replace');
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not read file');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  }, [commitImportedText, history.text, notify]);

  const resolvePendingImport = useCallback((mode) => {
    if (!pendingImport) return;
    commitImportedText(pendingImport.text, pendingImport.name, mode);
    setPendingImport(null);
  }, [commitImportedText, pendingImport]);

  const handleDownload = useCallback(() => {
    downloadText(history.text, 'processed-text.txt');
    notify('Download started');
  }, [history.text, notify]);

  const clearText = useCallback(() => {
    history.replaceTextImmediately('', true);
    safeRemove(STORAGE_KEYS.draft);
    setConfirmClear(false);
    notify('Text cleared');
  }, [history.replaceTextImmediately, notify]);

  return (
    <div className="app-shell">
      <Header
        theme={theme}
        onTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')}
        onImportClick={() => fileInput.current?.click()}
        onDownload={handleDownload}
        onSettings={() => setSettingsOpen(true)}
      />
      <input
        ref={fileInput}
        className="visually-hidden"
        type="file"
        accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"
        aria-label="Import a local text file"
        onChange={(event) => event.target.files?.[0] && handleImport(event.target.files[0])}
      />

      <main>
        <section className="intro-row" aria-labelledby="workspace-intro-title">
          <div>
            <span className="status-pill"><Sparkles size={14} aria-hidden="true" /> Write / Paste → Analyze → Clean → Transform → Export</span>
            <h2 id="workspace-intro-title">A focused workspace for everyday text cleanup.</h2>
            <p>Fast browser-side utilities for students, writers, developers, content creators and line-based data cleaning.</p>
          </div>
          <button className="btn primary" onClick={() => {
            history.replaceTextImmediately(SAMPLE_TEXT, Boolean(history.text));
            notify(history.text ? 'Sample text loaded · undo available' : 'Sample text loaded');
          }}><FileText size={16} aria-hidden="true" /> Load sample text</button>
        </section>

        <StatsGrid stats={stats} />

        <div className="workspace-grid">
          <Editor
            text={history.text}
            setText={history.setTypingText}
            settings={settings}
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            onUndo={() => { history.undo(); notify('Transformation undone'); }}
            onRedo={() => { history.redo(); notify('Transformation restored'); }}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onClear={() => history.text ? setConfirmClear(true) : notify('Editor is already empty')}
            onDropFile={handleImport}
          />
          <ToolPanel
            applyTool={applyTool}
            duplicateOptions={duplicateOptions}
            setDuplicateOptions={setDuplicateOptions}
            sortCaseSensitive={sortCaseSensitive}
            setSortCaseSensitive={setSortCaseSensitive}
            findState={findState}
            setFindState={setFindState}
            findMeta={findMeta}
            onReplace={handleReplace}
          />
        </div>

        <TextInsights
          stats={stats}
          frequency={frequency}
          ignoreCommonWords={ignoreCommonWords}
          setIgnoreCommonWords={setIgnoreCommonWords}
        />

        <section className="privacy-note" aria-label="Privacy information">
          <LockKeyhole size={18} aria-hidden="true" />
          <div><strong>Privacy first.</strong><span>Your text is processed locally in this browser and is not sent to a server. Text is not permanently stored by default.</span></div>
        </section>
      </main>

      <footer><span>Text Utility Toolkit</span><span>Frontend only · No database · Local browser processing</span></footer>
      <Toast message={toast} />
      <ConfirmDialog open={confirmClear} title="Clear editor text?" onConfirm={clearText} onCancel={() => setConfirmClear(false)}>
        This removes the current editor content. You can restore the previous transformation state with Undo during this session.
      </ConfirmDialog>
      <ImportDialog
        pendingImport={pendingImport}
        onReplace={() => resolvePendingImport('replace')}
        onAppend={() => resolvePendingImport('append')}
        onCancel={() => setPendingImport(null)}
      />
      <SettingsModal
        open={settingsOpen}
        settings={settings}
        setSettings={setSettings}
        onClose={() => setSettingsOpen(false)}
        onClearDraft={() => { safeRemove(STORAGE_KEYS.draft); notify('Saved draft cleared'); }}
      />
    </div>
  );
}
