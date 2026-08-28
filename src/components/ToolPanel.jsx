import { useMemo, useState } from 'react';
import {
  ArrowDownAZ, ArrowUpAZ, Braces, CaseLower, CaseUpper, Eraser, Hash, ListFilter,
  Replace, RotateCcw, Search, Sparkles, TextCursorInput, Type, WholeWord,
} from 'lucide-react';

const categories = [
  { id: 'case', label: 'Case' },
  { id: 'cleanup', label: 'Cleanup' },
  { id: 'lines', label: 'Lines' },
  { id: 'transform', label: 'Transform' },
  { id: 'find', label: 'Find & Replace' },
  { id: 'advanced', label: 'Advanced' },
];

const ToolButton = ({ icon: Icon, children, onClick, hint }) => (
  <button className="tool-button" onClick={onClick} title={hint || children}>
    <Icon size={16} aria-hidden="true" />
    <span>{children}</span>
  </button>
);

export default function ToolPanel({
  applyTool,
  duplicateOptions,
  setDuplicateOptions,
  sortCaseSensitive,
  setSortCaseSensitive,
  findState,
  setFindState,
  findMeta,
  onReplace,
}) {
  const [active, setActive] = useState('case');
  const [toolSearch, setToolSearch] = useState('');

  const handleTabKey = (event, index) => {
    const key = event.key;
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (key === 'ArrowRight') nextIndex = (index + 1) % categories.length;
    if (key === 'ArrowLeft') nextIndex = (index - 1 + categories.length) % categories.length;
    if (key === 'Home') nextIndex = 0;
    if (key === 'End') nextIndex = categories.length - 1;
    const next = categories[nextIndex];
    setActive(next.id);
    document.getElementById(`tool-tab-${next.id}`)?.focus();
  };

  const searchItems = useMemo(() => [
    ['UPPERCASE', 'case', () => applyTool('uppercase')],
    ['lowercase', 'case', () => applyTool('lowercase')],
    ['Title Case', 'case', () => applyTool('title')],
    ['Sentence case', 'case', () => applyTool('sentence')],
    ['Toggle Case', 'case', () => applyTool('toggle')],
    ['Remove Extra Spaces', 'cleanup', () => applyTool('extraSpaces')],
    ['Trim Text', 'cleanup', () => applyTool('trim')],
    ['Trim Each Line', 'cleanup', () => applyTool('trimLines')],
    ['Remove Blank Lines', 'cleanup', () => applyTool('blankLines')],
    ['Normalize Line Breaks', 'cleanup', () => applyTool('normalize')],
    ['Remove Duplicate Lines', 'lines', () => applyTool('duplicates')],
    ['Sort A → Z', 'lines', () => applyTool('sortAsc')],
    ['Sort Z → A', 'lines', () => applyTool('sortDesc')],
    ['Shortest → Longest', 'lines', () => applyTool('sortLengthAsc')],
    ['Longest → Shortest', 'lines', () => applyTool('sortLengthDesc')],
    ['Reverse Characters', 'transform', () => applyTool('reverse')],
    ['Reverse Line Order', 'transform', () => applyTool('reverseLines')],
    ['Reverse Word Order', 'transform', () => applyTool('reverseWords')],
    ['Clean Paragraphs', 'cleanup', () => applyTool('cleanParagraphs')],
    ['Clean Line List', 'cleanup', () => applyTool('cleanLineList')],
    ['Remove Numbers', 'advanced', () => applyTool('removeNumbers')],
    ['Remove Punctuation', 'advanced', () => applyTool('removePunctuation')],
  ].filter(([label]) => label.toLocaleLowerCase().includes(toolSearch.toLocaleLowerCase())), [toolSearch, applyTool]);

  return (
    <section className="card tools-card" aria-labelledby="tools-title">
      <div className="section-heading tools-heading">
        <div><p className="eyebrow">Toolbox</p><h2 id="tools-title">Transform text</h2></div>
        <label className="tool-search"><Search size={15} aria-hidden="true" /><input value={toolSearch} onChange={(event) => setToolSearch(event.target.value)} placeholder="Search tools" aria-label="Search text tools" /></label>
      </div>

      {toolSearch ? (
        <div className="search-results" aria-label="Matching tools">
          {searchItems.length ? searchItems.slice(0, 12).map(([label, category, action]) => (
            <button key={label} onClick={() => { setActive(category); setToolSearch(''); action(); }}>
              <Sparkles size={15} aria-hidden="true" /><span>{label}</span><small>{category}</small>
            </button>
          )) : <p className="muted">No matching tool.</p>}
        </div>
      ) : (
        <>
          <div className="tool-tabs" role="tablist" aria-label="Tool categories">
            {categories.map((category, index) => (
              <button
                key={category.id}
                id={`tool-tab-${category.id}`}
                role="tab"
                aria-selected={active === category.id}
                aria-controls={`tool-panel-${category.id}`}
                tabIndex={active === category.id ? 0 : -1}
                className={active === category.id ? 'active' : ''}
                onClick={() => setActive(category.id)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >{category.label}</button>
            ))}
          </div>

          <div id={`tool-panel-${active}`} className="tool-body" role="tabpanel" aria-labelledby={`tool-tab-${active}`}>
            {active === 'case' && <div className="tool-grid">
              <ToolButton icon={CaseUpper} onClick={() => applyTool('uppercase')}>UPPERCASE</ToolButton>
              <ToolButton icon={CaseLower} onClick={() => applyTool('lowercase')}>lowercase</ToolButton>
              <ToolButton icon={Type} onClick={() => applyTool('title')}>Title Case</ToolButton>
              <ToolButton icon={TextCursorInput} onClick={() => applyTool('sentence')}>Sentence case</ToolButton>
              <ToolButton icon={WholeWord} onClick={() => applyTool('toggle')}>Toggle Case</ToolButton>
            </div>}

            {active === 'cleanup' && <>
              <div className="tool-grid">
                <ToolButton icon={Eraser} onClick={() => applyTool('extraSpaces')} hint="Collapses repeated spaces and tabs while preserving line breaks.">Remove Extra Spaces</ToolButton>
                <ToolButton icon={Eraser} onClick={() => applyTool('trim')}>Trim Text</ToolButton>
                <ToolButton icon={ListFilter} onClick={() => applyTool('trimLines')}>Trim Each Line</ToolButton>
                <ToolButton icon={ListFilter} onClick={() => applyTool('blankLines')}>Remove Blank Lines</ToolButton>
                <ToolButton icon={RotateCcw} onClick={() => applyTool('normalize')}>Normalize Line Breaks</ToolButton>
              </div>
              <div className="preset-strip">
                <div><strong>Cleanup presets</strong><span>Transparent one-click pipelines</span></div>
                <button onClick={() => applyTool('cleanParagraphs')}>Clean paragraphs</button>
                <button onClick={() => applyTool('cleanLineList')}>Clean line list</button>
              </div>
            </>}

            {active === 'lines' && <>
              <div className="option-row">
                <label><input type="checkbox" checked={duplicateOptions.caseSensitive} onChange={(event) => setDuplicateOptions((value) => ({ ...value, caseSensitive: event.target.checked }))} /> Duplicate check is case sensitive</label>
                <label><input type="checkbox" checked={duplicateOptions.ignoreSurroundingSpaces} onChange={(event) => setDuplicateOptions((value) => ({ ...value, ignoreSurroundingSpaces: event.target.checked }))} /> Ignore surrounding spaces</label>
                <label><input type="checkbox" checked={sortCaseSensitive} onChange={(event) => setSortCaseSensitive(event.target.checked)} /> Sort is case sensitive</label>
              </div>
              <div className="tool-grid">
                <ToolButton icon={ListFilter} onClick={() => applyTool('duplicates')}>Remove Duplicate Lines</ToolButton>
                <ToolButton icon={ArrowDownAZ} onClick={() => applyTool('sortAsc')}>A → Z</ToolButton>
                <ToolButton icon={ArrowUpAZ} onClick={() => applyTool('sortDesc')}>Z → A</ToolButton>
                <ToolButton icon={ArrowDownAZ} onClick={() => applyTool('sortLengthAsc')}>Shortest → Longest</ToolButton>
                <ToolButton icon={ArrowUpAZ} onClick={() => applyTool('sortLengthDesc')}>Longest → Shortest</ToolButton>
              </div>
            </>}

            {active === 'transform' && <div className="tool-grid">
              <ToolButton icon={RotateCcw} onClick={() => applyTool('reverse')}>Reverse Characters</ToolButton>
              <ToolButton icon={ListFilter} onClick={() => applyTool('reverseLines')}>Reverse Line Order</ToolButton>
              <ToolButton icon={WholeWord} onClick={() => applyTool('reverseWords')}>Reverse Word Order</ToolButton>
            </div>}

            {active === 'find' && <div className="find-panel">
              <div className="field-grid">
                <label>Find<input value={findState.find} onChange={(event) => setFindState((value) => ({ ...value, find: event.target.value }))} placeholder="Text to find" /></label>
                <label>Replace with<input value={findState.replace} onChange={(event) => setFindState((value) => ({ ...value, replace: event.target.value }))} placeholder="Replacement text" /></label>
              </div>
              <div className="option-row">
                <label><input type="checkbox" checked={findState.caseSensitive} onChange={(event) => setFindState((value) => ({ ...value, caseSensitive: event.target.checked }))} /> Case sensitive</label>
                <label><input type="checkbox" checked={findState.regex} onChange={(event) => setFindState((value) => ({ ...value, regex: event.target.checked }))} /> Regex mode <span className="badge">Advanced</span></label>
              </div>
              <div className={`match-strip ${findMeta.error ? 'error' : ''}`} role="status" aria-live="polite"><Replace size={16} aria-hidden="true" /> {findMeta.error ? `Regex error: ${findMeta.error}` : `Matches found: ${findMeta.count}`}</div>
              <div className="tool-grid find-actions">
                <ToolButton icon={Replace} onClick={() => onReplace(false)}>Replace First</ToolButton>
                <ToolButton icon={Replace} onClick={() => onReplace(true)}>Replace All</ToolButton>
                <ToolButton icon={Eraser} onClick={() => onReplace(true, true)}>Remove All Matches</ToolButton>
              </div>
            </div>}

            {active === 'advanced' && <>
              <p className="tool-description">Advanced cleanup stays local in your browser. Unicode punctuation handling is best-effort.</p>
              <div className="tool-grid">
                <ToolButton icon={Hash} onClick={() => applyTool('removeNumbers')}>Remove Numbers</ToolButton>
                <ToolButton icon={Braces} onClick={() => applyTool('removePunctuation')}>Remove Punctuation</ToolButton>
              </div>
            </>}
          </div>
        </>
      )}
    </section>
  );
}
