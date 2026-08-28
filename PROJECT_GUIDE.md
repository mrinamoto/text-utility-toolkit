# Text Utility Toolkit — Project Guide

This guide explains how the project works in simple, technically correct language for university demonstration, portfolio presentation, and viva preparation.

## 1. Project overview

Text Utility Toolkit is a frontend-only browser application for processing plain text. A user can type or paste content, view live statistics, clean unwanted spaces or lines, change text case, remove duplicate lines, sort or reverse content, find and replace text, import a local file, copy the result, and download processed text.

The central workflow is: **Write / Paste → Analyze → Clean → Transform → Export**.

## 2. Problem solved

People often open multiple websites or manually edit text for small tasks such as word counting, duplicate removal, case conversion, list sorting, and search/replace. This project puts those operations into one workspace while keeping text local to the user's browser.

## 3. Main features

The project contains live analytics, case tools, cleanup tools, line tools, reverse tools, Find & Replace, regex mode, word frequency, safe import with Replace/Append choice, drag-and-drop, copy, download, Undo/Redo, theme settings, responsive design, and an optional local draft setting.

## 4. Technologies used

- React for UI state and reusable components
- Vite for development server and production bundling
- JavaScript for text-processing logic
- CSS for responsive UI and themes
- Lucide React for icons
- File API for local text-file reading
- Clipboard API for copying
- Blob and Object URL APIs for file download
- localStorage for non-sensitive preferences and optional draft storage

## 5. Why React

React is useful because the UI changes frequently when text changes. The editor content, statistics, theme, tool settings, Find & Replace options, and dialogs can be represented as state. Components also keep the interface organized.

## 6. Why Vite

Vite provides a fast development server, simple React setup, hot module replacement, and an optimized production build with very little configuration.

## 7. Why no backend/database

The app does not need user accounts or server-side persistence. Text transformations can run directly in JavaScript inside the browser. Avoiding a backend reduces complexity and improves privacy because text never needs to be sent to a server.

## 8. Privacy model

By default, user text exists only in React memory for the current page session. Preferences such as theme and editor settings may be stored in localStorage. Draft saving is optional and OFF by default. If enabled, the UI explains that the draft will remain in that browser until cleared.

## 9. Main text editor

The editor is a controlled React `<textarea>`. Its `value` is connected to React state and `onChange` updates the state. A plain textarea is reliable, accessible, supports multiline content, preserves line breaks, and does not require a heavy rich-text library.

## 10. Word counting

`countWords()` first checks for empty/whitespace-only input. It uses `Intl.Segmenter` when supported and falls back to a Unicode-aware regular expression. Empty text correctly returns zero words.

## 11. Character counting

`Array.from(text).length` is used instead of simple `text.length` for the displayed character metric because `Array.from()` is safer for many Unicode code points.

## 12. Character count without spaces

The “without spaces” metric removes only literal space characters, so tabs and newline characters remain. Text Insights separately shows “without whitespace,” which removes spaces, tabs, newlines, and other JavaScript `\s` whitespace. This distinction matches the UI labels.

## 13. Line counting

Line endings are first normalized. If the text is completely empty, the count is zero. Otherwise, the text is split by `\n` and the number of resulting lines is returned.

## 14. Sentence counting

Sentence counting is intentionally labeled estimated. It uses punctuation such as `.`, `!`, and `?` as boundaries. It is a heuristic, not full natural-language parsing.

## 15. Reading-time estimation

The formula is `word count / 200`. The interface displays `< 1 min` for short non-empty text and rounds longer estimates upward for a simple reading estimate.

## 16. Uppercase

`toLocaleUpperCase()` converts alphabetic content to uppercase while preserving numbers, punctuation, spacing, and line breaks.

## 17. Lowercase

`toLocaleLowerCase()` converts letters to lowercase without intentionally changing structure.

## 18. Title Case

The implementation capitalizes each detected word. It is a general capitalization tool and is not advertised as AP, MLA, or Chicago style.

## 19. Sentence case

The text is lowercased, then the first letter and letters after sentence-ending punctuation are capitalized. This preserves line breaks but remains heuristic.

## 20. Toggle case

Each alphabetic character is checked. Uppercase letters become lowercase and lowercase letters become uppercase. Non-letter characters remain unchanged.

## 21. Remove extra spaces

The utility processes each line independently and collapses repeated spaces/tabs. It does not use a global `\s+` replacement because that would accidentally collapse line breaks.

## 22. Why line breaks should not be collapsed accidentally

Newlines carry structure. A list, poem, code block, or paragraph layout can be destroyed if all whitespace is treated as ordinary spaces. Cleanup therefore separates horizontal whitespace from newline handling.

## 23. Trim text

`text.trim()` removes whitespace only from the beginning and end of the whole input.

## 24. Trim each line

The text is split into lines, every line is trimmed, and the lines are joined again in the same order.

## 25. Remove blank lines

The text is split by normalized newlines. Lines whose trimmed value is empty are filtered out.

## 26. Remove duplicate lines

A `Set` stores keys representing lines already seen. If a line key is new, the original line is kept. If the key already exists, that later occurrence is removed. The first occurrence order is preserved.

## 27. Case-sensitive duplicate handling

When case sensitivity is disabled, comparison keys are converted to lowercase. Therefore `Apple` and `apple` are treated as duplicates while the first original form remains in output.

## 28. Line sorting

A copied line array is sorted so unrelated state is not mutated. Alphabetical sorting uses `localeCompare()`. Length sorting compares string lengths.

## 29. `localeCompare()`

`localeCompare()` compares strings using locale-aware rules instead of raw character codes. The project also enables numeric comparison where practical, so values such as `item2` and `item10` sort more naturally.

## 30. Reverse characters

The project reverses a sequence of graphemes when `Intl.Segmenter` is available. It falls back to `Array.from(text).reverse().join('')`.

## 31. Reverse line order

The text is split into lines, the line array is reversed, then lines are joined again. Characters inside each line are not reversed.

## 32. Unicode reverse handling

`split('')` can split UTF-16 surrogate pairs. `Array.from()` is safer for code points, while `Intl.Segmenter` with grapheme granularity is better for many combined emoji and user-perceived characters.

## 33. Find & Replace

The Find field is converted into a regular expression internally. In normal mode, regex metacharacters are escaped so the search is literal. Replace First omits the global flag; Replace All uses it.

## 34. Plain-text search vs regex

Plain-text mode treats characters such as `.`, `*`, `?`, and `[` literally. Regex mode is explicitly marked Advanced. Invalid regex patterns are caught and shown as validation feedback instead of crashing the application.

## 35. Word frequency

Words are normalized to lowercase and counted in a `Map`. Entries are sorted by descending frequency, then alphabetically for ties. The frequency computation uses the same word-tokenization path as the statistics logic and is delayed by a short 150 ms debounce to reduce repeated heavier work while typing large text.

## 36. Unique words

A `Set` is created from normalized word tokens. The Set size is the unique-word count.

## 37. Stopwords

A local set contains common English words such as `the`, `a`, `and`, `is`, and `to`. Filtering applies only to Top Words analysis and never changes the main word count.

## 38. Importing text files

The user chooses or drops a local `.txt`, `.md`, or `.csv` file. Extension, size, and useful MIME information are validated before reading. The maximum supported import size is 5 MB. If editor text already exists, an import-safety dialog asks the user to Replace, Append, or Cancel.

## 39. File API

The browser gives the application a `File` object after user selection. `file.text()` reads the file contents locally. No upload request is made.

## 40. Clipboard API

`navigator.clipboard.writeText(text)` copies current text. A hidden textarea fallback is provided for environments where the modern Clipboard API is unavailable.

## 41. Download using Blob

A Blob is created with `text/plain;charset=utf-8`. `URL.createObjectURL()` creates a temporary browser URL, an anchor triggers the download, and the object URL is revoked afterward.

## 42. Undo/Redo stack

Undo/Redo is implemented with a pure history reducer. Explicit transformations push the previous text into a bounded Undo list. Undo restores the previous state and places the current state into Redo; Redo performs the opposite operation. A new transformation after Undo clears the old redo branch, and manual typing after Undo also clears stale Redo state.

## 43. Why history should be bounded

Saving unlimited copies of very large text can consume memory. The project therefore limits transformation history to 40 states.

## 44. Theme

The page stores `light` or `dark` in localStorage. CSS variables define colors for both themes, and the root HTML element receives a `data-theme` attribute.

## 45. localStorage

localStorage is used for theme, editor preferences, data version, and—only if the user enables it—the draft. Safe parsing prevents malformed stored JSON from crashing the app.

## 46. Why user text is not stored permanently by default

Text may contain private notes, source code, personal writing, or copied data. The safer default is not to persist it after the page session.

## 47. React state

Important state includes editor text, theme, settings, duplicate options, Find & Replace settings, tool analysis toggles, toast messages, and dialog visibility.

## 48. Important hooks

- `useState` stores interactive state.
- `useMemo` caches live derived statistics and match calculations.
- `useDebouncedValue` delays heavier word-frequency analysis by about 150 ms.
- `useEffect` synchronizes theme/preferences, local draft behavior, modal keyboard handling, and shortcuts.
- `useCallback` stabilizes reusable action functions where useful.
- `useRef` stores file-input/toast references and modal focus restoration targets.
- `useReducer` inside `useTextHistory` uses the pure reducer from `historyUtils.js` for deterministic Undo/Redo behavior.

## 49. Utility-function architecture

Pure functions in `src/utils/textUtils.js` contain text logic. React components call these functions but do not reimplement them. This separation improves testing, debugging, and viva explanation.

## 50. Responsive design

CSS media queries move from a desktop two-column workspace to a single-column tablet/mobile layout. Controls stay touch-friendly. On small screens, tool categories switch to a compact grid, dialogs receive safe max-height scrolling, and the editor keeps a comfortable mobile height without page-level horizontal overflow.

## 51. Accessibility

The app uses labels, semantic headings, visible focus states, ARIA labels on icon buttons, readable contrast, and reduced-motion support. Modal dialogs close with Escape, trap keyboard focus while open, and restore focus after closing. Tool-category tabs support Arrow Left/Right, Home, and End navigation.

## 52. How to run

```bash
npm install
npm run dev
```

Vite prints a local development URL.

## 53. How to build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## 54. How to add another text tool

1. Add a pure function in `src/utils/textUtils.js`.
2. Add a new `case` inside `applyTool()` in `App.jsx`.
3. Add a button in the correct ToolPanel category.
4. Give the operation a clear feedback message.
5. Add a test case in `tests/text-utils.test.mjs`.

## 55. How to modify stopwords

Edit `src/data/stopwords.js`. Keep all entries lowercase because analyzed words are normalized to lowercase before filtering.

## 56. How to change UI theme

Edit CSS custom properties in `src/styles/globals.css` for `:root` and `:root[data-theme='dark']`. Avoid hard-coded colors inside individual components when a theme token exists.

## 57. Common errors and fixes

- **`npm` not found:** Install Node.js and reopen the terminal.
- **Port already in use:** Vite will normally select another port; use the URL it prints.
- **Clipboard fails:** Use HTTPS/localhost and a modern browser; fallback copy is attempted.
- **Invalid regex:** Disable Regex mode or correct the pattern.
- **File too large:** Use a file smaller than 5 MB.
- **Build fails after edits:** Run `npm install`, check terminal error lines, and remove unused/broken imports or invalid JSX.
- **Theme preference looks corrupted:** Clear the site's localStorage; safe fallbacks also protect the app.

## 58. Limitations

- Sentence detection is heuristic.
- General Title Case/Sentence case are not formal editorial rules.
- Tokenization varies by language.
- Some Clipboard API behavior depends on browser permissions/security context.
- Extremely large text can still consume browser memory/CPU.
- Unicode grapheme handling is best when `Intl.Segmenter` is available.
- The app does not send text to a server.
- User text is not permanently stored by default.

## 59. Future improvements

Possible extensions include pinned favorite tools, a visual before/after diff, configurable pipelines, more language-aware tokenization, editable stopword lists, PWA/offline installation, and automated browser tests.

# Viva Questions and Answers

### 1. What is the purpose of this project?
To provide many common text-processing utilities in one privacy-friendly browser workspace.

### 2. Why is React used?
React makes it easy to manage changing UI state and organize the interface into reusable components.

### 3. Why is Vite used?
Vite provides a fast development server and optimized production build with minimal setup.

### 4. Why does the project not need a database?
The app processes temporary text locally and does not require user accounts or server-side records.

### 5. Where does text processing happen?
Inside the user's browser using JavaScript.

### 6. How is word count calculated?
The app uses `Intl.Segmenter` when available and a Unicode-aware token regex fallback.

### 7. What happens for empty word count?
It returns zero, not one.

### 8. How are characters counted?
Displayed character count uses `Array.from(text).length` for code-point-aware counting.

### 9. How are lines counted?
Line endings are normalized to `\n`; empty text is zero lines, otherwise the text is split by newline.

### 10. Is sentence count always exact?
No. It is an estimate based mainly on sentence-ending punctuation.

### 11. How is reading time calculated?
Word count is divided by an assumed speed of 200 words per minute.

### 12. How do you remove duplicate lines?
A Set tracks line comparison keys; only the first occurrence is kept.

### 13. Why use Set for duplicate removal?
Set provides fast membership checking and naturally represents unique values.

### 14. How is first occurrence order preserved?
Lines are scanned from top to bottom and the original line is pushed only when its key has not been seen before.

### 15. How does line sorting work?
A copied array of lines is sorted, mainly with `localeCompare()` for alphabetic sorting.

### 16. What does `localeCompare()` do?
It compares strings using locale-aware rules and is more appropriate than simple character-code comparison.

### 17. How is Reverse Characters made safer for Unicode?
The app prefers grapheme segmentation via `Intl.Segmenter` and falls back to `Array.from()`.

### 18. How does Find & Replace work?
The search becomes a RegExp; normal mode escapes special characters, while regex mode uses the user's pattern directly.

### 19. Why escape regex metacharacters in normal Find mode?
So a search such as `.` means a literal dot instead of the regex meaning "any character".

### 20. What happens if the user enters an invalid regex?
The operation is wrapped in try/catch and the UI shows an error message without crashing.

### 21. What is the Clipboard API?
A browser API that can copy text programmatically, for example with `navigator.clipboard.writeText()`.

### 22. What is Blob?
Blob represents raw data in the browser. This project uses a text Blob to create downloadable files.

### 23. How does file download work without a server?
The app creates a Blob, generates a temporary object URL, clicks a temporary download anchor, then revokes the URL.

### 24. What is the File API used for?
It gives access to files explicitly selected or dropped by the user so their text can be read locally.

### 25. How does Undo/Redo work?
A pure reducer maintains the current text plus bounded Undo and Redo arrays. Undo and Redo move explicit transformation states between those arrays.

### 26. Why is the Undo history bounded?
To prevent unlimited memory growth when processing large text.

### 27. Why is user text not stored permanently?
Privacy is the default. Text may contain sensitive or private content.

### 28. What is stored in localStorage?
Theme, editor preferences, a data version, and optionally a draft only when the user enables draft saving.

### 29. What is the difference between state and localStorage?
React state controls the current UI session; localStorage persists selected values across page reloads.

### 30. How does the project support Bangla and Unicode text?
It avoids ASCII-only processing, uses Unicode-aware regex where practical, and uses modern JavaScript Unicode/string APIs.

### 31. Why is `split('')` avoided for Reverse Characters?
It can split UTF-16 surrogate pairs and break some Unicode characters.

### 32. Why are text utilities separated from UI components?
Pure functions are easier to test, reuse, debug, and explain.

### 33. What is memoization used for here?
`useMemo` recalculates derived statistics/frequency only when their relevant inputs change.

### 34. What is the maximum import size?
5 MB, to reduce the chance of accidental browser freezes.

### 35. Does the application upload imported files?
No. Files are read locally in the browser. If text already exists, the user chooses Replace, Append, or Cancel before the imported content is applied.

### 36. What happens after Undo if the user applies a new transformation?
The old redo branch is cleared, following normal undo-stack behavior.

### 37. Why is a plain textarea used instead of a rich text editor?
The project processes plain text, so a textarea is simpler, more reliable, lightweight, and accessible.

### 38. How is dark mode implemented?
A `data-theme` attribute switches CSS custom-property values, and the selected theme is persisted.

### 39. How is responsiveness implemented?
CSS Grid/Flexbox plus media queries reorganize the workspace and controls at tablet/mobile widths.

### 40. What is the biggest technical limitation?
Language-aware sentence and word segmentation cannot be perfect for every language using lightweight browser-only heuristics.
