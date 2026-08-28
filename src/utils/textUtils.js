import { STOPWORDS } from '../data/stopwords.js';

export const normalizeLineBreaks = (text) => text.replace(/\r\n?/g, '\n');

function segmentWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
      return Array.from(segmenter.segment(trimmed))
        .filter((part) => part.isWordLike)
        .map((part) => part.segment);
    } catch { /* Unicode-aware regex fallback below. */ }
  }

  return trimmed.match(/[\p{L}\p{N}\p{M}]+(?:['’\-][\p{L}\p{N}\p{M}]+)*/gu) ?? [];
}

export function countWords(text) {
  return segmentWords(text).length;
}

export const countCharacters = (text) => Array.from(text).length;
export const countCharactersWithoutSpaces = (text) => Array.from(text.replace(/ /g, '')).length;
export const countCharactersWithoutWhitespace = (text) => Array.from(text.replace(/\s/gu, '')).length;
export const countLines = (text) => (text.length ? normalizeLineBreaks(text).split('\n').length : 0);

export function countSentences(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Treat a run such as "..." or "?!" as one ending. Closing quotes/brackets are allowed.
  const endings = trimmed.match(/[.!?]+(?=(?:["'”’\)\]}]+)?(?:\s|$))/gu);
  return endings?.length || 1;
}

export function countParagraphs(text) {
  const trimmed = normalizeLineBreaks(text).trim();
  return trimmed ? trimmed.split(/\n\s*\n+/).filter((paragraph) => paragraph.trim()).length : 0;
}

export function getWords(text) {
  return segmentWords(text).map((word) => word.toLocaleLowerCase());
}

export function calculateStats(text) {
  const tokens = getWords(text);
  const words = tokens.length;
  const uniqueWords = new Set(tokens).size;
  const avgWordLength = tokens.length
    ? tokens.reduce((sum, word) => sum + Array.from(word).length, 0) / tokens.length
    : 0;
  const longestWord = tokens.reduce(
    (longest, word) => Array.from(word).length > Array.from(longest).length ? word : longest,
    '',
  );

  return {
    words,
    characters: countCharacters(text),
    charactersWithoutSpaces: countCharactersWithoutSpaces(text),
    charactersWithoutWhitespace: countCharactersWithoutWhitespace(text),
    lines: countLines(text),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readingTimeMinutes: words / 200,
    uniqueWords,
    avgWordLength,
    longestWord,
  };
}

export const toUppercase = (text) => text.toLocaleUpperCase();
export const toLowercase = (text) => text.toLocaleLowerCase();

export function toTitleCase(text) {
  return text.replace(/[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*/gu, (word) => {
    const chars = Array.from(word.toLocaleLowerCase());
    return chars.length ? chars[0].toLocaleUpperCase() + chars.slice(1).join('') : word;
  });
}

export function toSentenceCase(text) {
  const lower = text.toLocaleLowerCase();
  let capitalizeNext = true;

  return Array.from(lower).map((character) => {
    if (capitalizeNext && /\p{L}/u.test(character)) {
      capitalizeNext = false;
      return character.toLocaleUpperCase();
    }
    if (/[.!?\n]/u.test(character)) capitalizeNext = true;
    return character;
  }).join('');
}

export function toggleCase(text) {
  return Array.from(text).map((character) => {
    const upper = character.toLocaleUpperCase();
    const lower = character.toLocaleLowerCase();
    if (character === upper && character !== lower) return lower;
    if (character === lower && character !== upper) return upper;
    return character;
  }).join('');
}

export function removeExtraSpaces(text) {
  return normalizeLineBreaks(text)
    .split('\n')
    .map((line) => line.replace(/[\t ]{2,}/g, ' '))
    .join('\n');
}

export const trimText = (text) => text.trim();
export const trimEachLine = (text) => normalizeLineBreaks(text).split('\n').map((line) => line.trim()).join('\n');
export const removeBlankLines = (text) => normalizeLineBreaks(text).split('\n').filter((line) => line.trim() !== '').join('\n');

export function removeDuplicateLines(text, { caseSensitive = true, ignoreSurroundingSpaces = false } = {}) {
  if (!text) return { text: '', removed: 0, unique: 0 };

  const lines = normalizeLineBreaks(text).split('\n');
  const seen = new Set();
  const kept = [];
  let removed = 0;

  lines.forEach((line) => {
    let key = ignoreSurroundingSpaces ? line.trim() : line;
    if (!caseSensitive) key = key.toLocaleLowerCase();

    if (seen.has(key)) {
      removed += 1;
    } else {
      seen.add(key);
      kept.push(line);
    }
  });

  return { text: kept.join('\n'), removed, unique: kept.length };
}

export function sortLines(text, direction = 'asc', caseSensitive = false) {
  const lines = normalizeLineBreaks(text).split('\n');
  if (direction === 'length-asc') return [...lines].sort((a, b) => a.length - b.length).join('\n');
  if (direction === 'length-desc') return [...lines].sort((a, b) => b.length - a.length).join('\n');

  const sensitivity = caseSensitive ? 'variant' : 'base';
  const sorted = [...lines].sort((a, b) => a.localeCompare(b, undefined, { sensitivity, numeric: true }));
  if (direction === 'desc') sorted.reverse();
  return sorted.join('\n');
}

export function reverseText(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), (part) => part.segment).reverse().join('');
    } catch { /* Code-point-aware fallback below. */ }
  }
  return Array.from(text).reverse().join('');
}

export const reverseLineOrder = (text) => normalizeLineBreaks(text).split('\n').reverse().join('\n');

export function reverseWordOrder(text) {
  return normalizeLineBreaks(text).split('\n').map((line) => {
    const chunks = line.match(/\S+|\s+/g);
    if (!chunks) return line;
    const words = chunks.filter((chunk) => /\S/u.test(chunk)).reverse();
    let index = 0;
    return chunks.map((chunk) => /\S/u.test(chunk) ? words[index++] : chunk).join('');
  }).join('\n');
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function countMatches(text, query, { caseSensitive = false, regex = false } = {}) {
  if (!query) return { count: 0, error: '' };

  try {
    const source = regex ? query : escapeRegex(query);
    const flags = caseSensitive ? 'gu' : 'giu';
    return { count: Array.from(text.matchAll(new RegExp(source, flags))).length, error: '' };
  } catch (error) {
    return { count: 0, error: error instanceof Error ? error.message : 'Invalid regular expression' };
  }
}

export function replaceText(text, query, replacement, { all = false, caseSensitive = false, regex = false } = {}) {
  if (!query) return { text, replaced: 0, error: '' };

  try {
    const source = regex ? query : escapeRegex(query);
    const flags = `${caseSensitive ? '' : 'i'}${all ? 'g' : ''}u`;
    const expression = new RegExp(source, flags);
    const before = countMatches(text, query, { caseSensitive, regex });
    if (before.error) return { text, replaced: 0, error: before.error };

    // Plain-text replacement is literal. Regex mode intentionally supports normal JS replacement tokens.
    const nextText = regex
      ? text.replace(expression, replacement)
      : text.replace(expression, () => replacement);

    return {
      text: nextText,
      replaced: all ? before.count : Math.min(before.count, 1),
      error: '',
    };
  } catch (error) {
    return { text, replaced: 0, error: error instanceof Error ? error.message : 'Invalid regular expression' };
  }
}

export function removeNumbers(text) {
  try { return text.replace(/\p{N}+/gu, ''); }
  catch { return text.replace(/[0-9]+/g, ''); }
}

export function removePunctuation(text) {
  try { return text.replace(/[\p{P}\p{S}]/gu, ''); }
  catch { return text.replace(/[^\w\s]/g, ''); }
}

export function cleanParagraphs(text) {
  return trimEachLine(removeExtraSpaces(trimText(text)));
}

export function cleanLineList(text, duplicateOptions = {}) {
  const cleaned = removeBlankLines(trimEachLine(text));
  return removeDuplicateLines(cleaned, duplicateOptions);
}

export function calculateWordFrequency(text, ignoreCommonWords = true, limit = 8) {
  const words = getWords(text).filter((word) => !ignoreCommonWords || !STOPWORDS.has(word));
  const counts = new Map();
  words.forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}
