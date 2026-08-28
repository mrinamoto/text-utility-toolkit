# Text Utility Toolkit

A privacy-first, frontend-only text workspace for analyzing, cleaning, transforming, and exporting plain text directly in the browser.

## Project Overview

Text Utility Toolkit combines common text-processing tasks in one focused interface. Users can paste or type text, inspect live statistics, apply explicit transformations, clean line-based data, search and replace content, import local text files, and export processed text without a backend.

**Workflow:** Write / Paste → Analyze → Clean → Transform → Export

## Main Features

- Live word, character, line, sentence, paragraph, unique-word, and reading-time metrics
- UPPERCASE, lowercase, Title Case, Sentence case, and Toggle Case
- Remove extra spaces, trim text, trim each line, remove blank lines, normalize line endings
- Duplicate-line removal with case-sensitive and whitespace options
- A→Z, Z→A, shortest→longest, and longest→shortest line sorting
- Reverse characters, reverse line order, reverse word order
- Find & Replace: first/all, case sensitivity, literal search, optional regex mode
- Advanced removal tools for numbers and punctuation
- Word-frequency analysis with optional common-word filtering
- Import `.txt`, `.md`, and `.csv` as plain text, up to 5 MB
- Safe existing-text import choice: Replace, Append, or Cancel
- Drag-and-drop text-file import
- Clipboard copy with fallback
- UTF-8 `.txt` download via Blob API
- Bounded transformation Undo/Redo history (40 states)
- Tool search
- Cleanup presets for paragraphs and line lists
- Light/Dark themes
- Editor font size, word wrap, and monospace options
- Optional local draft auto-save; OFF by default
- Responsive design for desktop, tablet, and mobile
- Reduced-motion support and keyboard-accessible controls

## Technology Stack

- React 19
- Vite 7
- JavaScript (ES modules)
- Modern CSS
- Lucide React
- Browser File API
- Clipboard API
- Blob/Object URL download APIs
- `localStorage` only for preferences and explicitly enabled draft storage

## Text Statistics

The app calculates statistics from current editor content:

- **Words:** Uses `Intl.Segmenter` when available, with a Unicode-aware regex fallback.
- **Characters:** Uses `Array.from()` for code-point-aware counting.
- **Characters without spaces:** Removes literal spaces before counting.
- **Characters without whitespace:** Shown in Text Insights; excludes spaces, tabs, newlines, and other JavaScript `\s` whitespace.
- **Lines:** Normalizes CRLF/CR to LF and counts newline-separated lines. Empty text = 0 lines.
- **Estimated Sentences:** Heuristic based mainly on `.`, `!`, and `?` sentence endings.
- **Paragraphs:** Groups blocks separated by blank lines.
- **Reading Time:** Assumes 200 words per minute.
- **Unique Words / Average Word Length / Longest Word** for additional insight.

## Case Conversion

- **UPPERCASE:** `toLocaleUpperCase()`
- **lowercase:** `toLocaleLowerCase()`
- **Title Case:** General word capitalization, not AP/Chicago style.
- **Sentence case:** Lowercases content and capitalizes letters after heuristic sentence boundaries.
- **Toggle Case:** Inverts letter case character by character.

## Text Cleanup

Cleanup functions are pure utilities, separate from React components:

- Remove repeated spaces/tabs without collapsing newlines
- Trim whole text
- Trim every line
- Remove whitespace-only lines
- Normalize Windows/Unix/old-Mac line endings to `\n`
- Clean Paragraphs preset
- Clean Line List preset

## Duplicate Line Removal

Duplicate removal preserves the first occurrence order. Options allow:

- Case-sensitive or case-insensitive comparison
- Ignoring surrounding spaces while checking duplicates

The UI reports how many duplicate lines were removed and how many unique lines remain.

## Line Sorting

Sorting uses `localeCompare()` with numeric comparison enabled where practical. The user can sort alphabetically or by line length. Alphabetic sorting can be case-sensitive or case-insensitive.

## Reverse Tools

- Reverse Characters
- Reverse Line Order
- Reverse Word Order per line

Character reversal prefers `Intl.Segmenter` grapheme segmentation and falls back to `Array.from()`. This is safer than `split('')` for many Unicode characters and emoji.

## Find & Replace

Plain-text mode escapes regex metacharacters so a search such as `.` matches a literal dot. Regex mode is explicitly optional and wrapped in error handling so invalid patterns do not crash the app.

Actions:

- Replace First
- Replace All
- Remove All Matches
- Case-sensitive option
- Regex mode (Advanced)
- Live match count / regex validation message

## Word Frequency

Word frequency is calculated locally from the same word-tokenization path used by the statistics layer. The **Ignore Common Words** option filters a small built-in English stopword set only for frequency analysis; it does not change raw word count or editor text. Frequency analysis is delayed by a short 150 ms debounce so large text does not recompute the heavier analysis on every keystroke.

## File Import

The project uses browser-local file reading. Supported extensions:

- `.txt`
- `.md`
- `.csv` as plain text

Maximum file size: 5 MB. Extension, size, and useful MIME information are checked before reading. The file is not uploaded anywhere. If the editor already contains text, the app asks whether to **Replace**, **Append**, or **Cancel** instead of silently destroying the current content.

## Copy / Download

- Copy uses `navigator.clipboard.writeText()` when available and a textarea fallback otherwise.
- Download creates a UTF-8 Blob with MIME type `text/plain;charset=utf-8` and triggers a local browser download.

## Undo / Redo

Explicit transformations create history states through a pure reducer. The history stack is bounded to 40 states to avoid unbounded memory growth. Undo and Redo move through those explicit states; a new transformation after Undo clears the incompatible redo branch. Manual typing is not added as a full transformation snapshot, but typing after Undo clears the stale redo branch.

## Privacy

The application is frontend-only.

- No backend
- No database
- No external text-processing API
- Text is processed locally in the browser
- User text is **not** stored in `localStorage` by default
- Optional draft auto-save is OFF by default and clearly labeled

## localStorage Usage

Keys:

- `textUtility.theme`
- `textUtility.settings`
- `textUtility.dataVersion`
- `textUtility.draft` only when draft auto-save is explicitly enabled

Malformed stored preferences are handled safely with fallback defaults.

## Unicode Handling

The toolkit avoids ASCII-only assumptions where practical. It supports Bangla, English, mixed-language text, accented characters, emoji, and Unicode punctuation for common operations. Full linguistic segmentation varies by browser and language.

## Responsive Design

The layout is designed for approximately:

- 1440 px
- 1024 px
- 768 px
- 430 px
- 375 px

Desktop uses a two-column editor/tool workspace. Tablet and mobile switch to a single-column layout. On smaller phones the tool categories become a compact grid instead of requiring a long horizontal toolbar, and dialogs are height-limited with internal scrolling.

## Accessibility

- Semantic headings and sections
- Input labels
- Keyboard focus styles
- ARIA labels for icon-only buttons
- Keyboard-operable dialogs/buttons
- Dialog Escape handling, focus trapping, and focus restoration
- Arrow-key navigation for the categorized tool tabs
- High-contrast theme tokens
- `prefers-reduced-motion` support

## Project Structure

```text
text-utility-toolkit/
├─ src/
│  ├─ components/
│  │  ├─ ConfirmDialog.jsx
│  │  ├─ Editor.jsx
│  │  ├─ Header.jsx
│  │  ├─ ImportDialog.jsx
│  │  ├─ ModalShell.jsx
│  │  ├─ SettingsModal.jsx
│  │  ├─ StatsGrid.jsx
│  │  ├─ TextInsights.jsx
│  │  ├─ Toast.jsx
│  │  └─ ToolPanel.jsx
│  ├─ data/
│  │  ├─ sampleText.js
│  │  └─ stopwords.js
│  ├─ hooks/
│  │  ├─ useDebouncedValue.js
│  │  └─ useTextHistory.js
│  ├─ styles/
│  │  ├─ app.css
│  │  ├─ globals.css
│  │  └─ responsive.css
│  ├─ utils/
│  │  ├─ fileUtils.js
│  │  ├─ historyUtils.js
│  │  ├─ storage.js
│  │  └─ textUtils.js
│  ├─ App.jsx
│  └─ main.jsx
├─ tests/
│  ├─ project-audit.test.mjs
│  └─ text-utils.test.mjs
├─ index.html
├─ package.json
├─ vite.config.js
├─ VALIDATION.md
├─ README.md
└─ PROJECT_GUIDE.md
```

## Installation

Requirements: Node.js 20+ recommended.

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local URL printed by Vite.

## Production Build

```bash
npm run build
npm run preview
```

## Audit Tests

Core utility tests:

```bash
npm run test:utils
```

Full source/privacy audit:

```bash
npm run test:audit
```

## Limitations

- Sentence counting is heuristic and may not understand every language perfectly.
- Title Case and Sentence case are general transformations, not formal editorial style-guide implementations.
- Word tokenization differs across languages and browsers.
- Clipboard API behavior depends on browser/security context.
- Very large files can affect browser performance; imports are capped at 5 MB.
- Grapheme-aware reversal depends on `Intl.Segmenter`; fallback behavior is code-point-aware, not fully grapheme-aware.
- No text is sent to a server.
- User text is not permanently saved by default.

## Future Improvements

- Favorite/pinned tools UI
- Before/after diff view
- Better language-specific sentence segmentation
- Configurable stopword lists
- Optional reusable transformation pipelines
- PWA/offline install support
- Automated browser E2E tests

## Portfolio / University Use

This project is intentionally structured with pure text-processing functions separated from React UI. That makes the implementation easier to test, explain in a viva, extend with new tools, and present in a GitHub portfolio.
