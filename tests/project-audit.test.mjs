import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const srcRoot = new URL('../src/', import.meta.url);

async function collectFiles(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directoryUrl);
    if (entry.isDirectory()) files.push(...await collectFiles(child));
    else files.push(child);
  }
  return files;
}

const sourceFiles = (await collectFiles(srcRoot)).filter((url) => /\.(js|jsx)$/.test(url.pathname));
let combined = '';
for (const file of sourceFiles) {
  const content = await readFile(file, 'utf8');
  combined += `\n// ${path.basename(file.pathname)}\n${content}`;
  assert.equal(/console\.(log|debug|info)\s*\(/.test(content), false, `console spam in ${file.pathname}`);
}

for (const pattern of [
  /\bfetch\s*\(/,
  /\baxios\b/i,
  /XMLHttpRequest/,
  /new\s+WebSocket\s*\(/,
]) {
  assert.equal(pattern.test(combined), false, `network-capable text path detected: ${pattern}`);
}

const nonStorageSource = sourceFiles.filter((url) => !url.pathname.endsWith('/utils/storage.js'));
for (const file of nonStorageSource) {
  const content = await readFile(file, 'utf8');
  assert.equal(/\blocalStorage\.(?:getItem|setItem|removeItem|clear|key)\b/.test(content), false, `direct localStorage access outside storage utility: ${file.pathname}`);
}


// Every relative JS/JSX import must resolve to an existing project file.
for (const file of sourceFiles) {
  const content = await readFile(file, 'utf8');
  const importPattern = /from\s+['"](\.[^'"]+)['"]/g;
  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1];
    const basePath = path.resolve(path.dirname(file.pathname), specifier);
    const candidates = [basePath, `${basePath}.js`, `${basePath}.jsx`];
    let resolved = false;
    for (const candidate of candidates) {
      try { await readFile(candidate); resolved = true; break; } catch { /* try next */ }
    }
    assert.equal(resolved, true, `unresolved relative import ${specifier} in ${file.pathname}`);
  }
}

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
assert.match(app, /if \(settings\.autoSaveDraft\) safeWrite\(STORAGE_KEYS\.draft, history\.text\)/);
assert.match(app, /if \(!settings\.autoSaveDraft\) safeRemove\(STORAGE_KEYS\.draft\)/);
assert.match(app, /setPendingImport\(\{ text: imported, name: file\.name \}\)/);
assert.match(app, /resolvePendingImport\('append'\)/);
assert.match(app, /settings\.autoSaveDraft \? 'Local draft saving is ON'|autoSaveDraft/);

const responsiveCss = await readFile(new URL('../src/styles/responsive.css', import.meta.url), 'utf8');
for (const breakpoint of ['1180px', '920px', '680px', '420px']) {
  assert.equal(responsiveCss.includes(`max-width: ${breakpoint}`), true, `missing responsive breakpoint ${breakpoint}`);
}
assert.match(responsiveCss, /\.workspace-grid \{ grid-template-columns: 1fr; \}/);
assert.match(responsiveCss, /\.tool-tabs \{ display: grid;/);
assert.match(responsiveCss, /\.field-grid \{ grid-template-columns: 1fr; \}/);

const globalCss = await readFile(new URL('../src/styles/globals.css', import.meta.url), 'utf8');
assert.match(globalCss, /:root\s*\{/);
assert.match(globalCss, /:root\[data-theme='dark'\]/);
assert.match(globalCss, /:focus-visible/);

const modalShell = await readFile(new URL('../src/components/ModalShell.jsx', import.meta.url), 'utf8');
assert.match(modalShell, /event\.key === 'Escape'/);
assert.match(modalShell, /FOCUSABLE_SELECTOR/);
assert.match(modalShell, /aria-modal="true"/);

const fileUtils = await readFile(new URL('../src/utils/fileUtils.js', import.meta.url), 'utf8');
assert.match(fileUtils, /text\/plain;charset=utf-8/);
assert.match(fileUtils, /5 \* 1024 \* 1024/);

for (const name of ['README.md', 'PROJECT_GUIDE.md', 'package.json']) {
  const content = await readFile(new URL(`../${name}`, import.meta.url), 'utf8');
  assert.equal(content.length > 100, true, `${name} appears incomplete`);
}

console.log(`Project privacy/code audit passed across ${sourceFiles.length} source files.`);
