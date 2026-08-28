const ALLOWED_EXTENSIONS = ['.txt', '.md', '.csv'];
const ALLOWED_MIME_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
]);
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function validateTextFile(file) {
  if (!file) return 'No file selected.';

  const name = String(file.name || '').toLocaleLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((extension) => name.endsWith(extension));
  if (!hasAllowedExtension) return 'Please choose a .txt, .md, or .csv text file.';
  if (file.size > MAX_FILE_BYTES) return 'File is too large. Maximum supported size is 5 MB.';

  const mime = String(file.type || '').toLocaleLowerCase();
  if (mime && !mime.startsWith('text/') && !ALLOWED_MIME_TYPES.has(mime)) {
    return 'This file does not appear to be plain text.';
  }

  return '';
}

export async function readTextFile(file) {
  const validation = validateTextFile(file);
  if (validation) throw new Error(validation);
  return file.text();
}

export function downloadText(text, filename = 'processed-text.txt') {
  const safeName = filename.trim() || 'processed-text.txt';
  const finalName = /\.(txt|md)$/i.test(safeName) ? safeName : `${safeName}.txt`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = finalName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement('textarea');
  helper.value = text;
  helper.style.position = 'fixed';
  helper.style.opacity = '0';
  document.body.appendChild(helper);
  helper.select();
  const copied = document.execCommand('copy');
  helper.remove();
  if (!copied) throw new Error('Clipboard copy failed.');
}
