import assert from 'node:assert/strict';
import {
  calculateStats,
  calculateWordFrequency,
  countCharacters,
  countCharactersWithoutSpaces,
  countCharactersWithoutWhitespace,
  countLines,
  countMatches,
  countSentences,
  countWords,
  normalizeLineBreaks,
  removeBlankLines,
  removeDuplicateLines,
  removeExtraSpaces,
  removeNumbers,
  replaceText,
  reverseLineOrder,
  reverseText,
  reverseWordOrder,
  sortLines,
  toggleCase,
  toLowercase,
  toSentenceCase,
  toTitleCase,
  toUppercase,
  trimEachLine,
  trimText,
} from '../src/utils/textUtils.js';
import { createHistoryState, HISTORY_LIMIT, historyReducer } from '../src/utils/historyUtils.js';
import { MAX_FILE_BYTES, validateTextFile } from '../src/utils/fileUtils.js';

// Empty-state statistics
const empty = calculateStats('');
assert.deepEqual(
  { words: empty.words, characters: empty.characters, noSpaces: empty.charactersWithoutSpaces, lines: empty.lines, sentences: empty.sentences },
  { words: 0, characters: 0, noSpaces: 0, lines: 0, sentences: 0 },
);
assert.equal(Number.isFinite(empty.readingTimeMinutes), true);

// Word counting and Unicode stability
assert.equal(countWords('Hello world'), 2);
assert.equal(countWords('  Hello   world\n\tagain  '), 3);
assert.equal(countWords('আমি ভালো আছি'), 3);
assert.equal(countWords('Hello বাংলা world'), 3);
assert.equal(countWords('hello 😀 world'), 2);

// Character metrics: "without spaces" excludes literal spaces only; full whitespace metric excludes tabs/newlines too.
const mixedWhitespace = 'a b\n\tc';
assert.equal(countCharacters(mixedWhitespace), 6);
assert.equal(countCharactersWithoutSpaces(mixedWhitespace), 5);
assert.equal(countCharactersWithoutWhitespace(mixedWhitespace), 3);
assert.equal(countCharacters('😀'), 1);

// Lines
assert.equal(countLines(''), 0);
assert.equal(countLines('one line'), 1);
assert.equal(countLines('a\nb'), 2);
assert.equal(countLines('a\n'), 2);
assert.equal(countLines('a\n\nb'), 3);
assert.equal(countLines('a\r\nb'), 2);

// Sentence heuristic and reading time
assert.equal(countSentences('Hello world.\nHow are you?\nGreat!'), 3);
assert.equal(countSentences('Wait... What?!'), 2);
assert.equal(countSentences('He said "go." Then left.'), 2);
assert.equal(countSentences('No punctuation here'), 1);
const fourHundredWords = Array.from({ length: 400 }, () => 'word').join(' ');
assert.equal(calculateStats(fourHundredWords).readingTimeMinutes, 2);

// Case transformations
assert.equal(toUppercase('Hello বাংলা 2!\nNext'), 'HELLO বাংলা 2!\nNEXT');
assert.equal(toLowercase('HELLO বাংলা'), 'hello বাংলা');
assert.equal(toTitleCase('this   is a test\nsecond line'), 'This   Is A Test\nSecond Line');
assert.equal(toSentenceCase('HELLO WORLD. THIS IS TEST.\nANOTHER LINE'), 'Hello world. This is test.\nAnother line');
assert.equal(toggleCase('Hello বাংলা 2!'), 'hELLO বাংলা 2!');

// Cleanup
assert.equal(removeExtraSpaces('Hello   world\nSecond    line'), 'Hello world\nSecond line');
assert.equal(removeExtraSpaces('Hello\n\nworld'), 'Hello\n\nworld');
assert.equal(trimText('  a \n b  '), 'a \n b');
assert.equal(trimEachLine('  Hello  \n World\t'), 'Hello\nWorld');
assert.equal(removeBlankLines('a\n\n \t\nb'), 'a\nb');
assert.equal(normalizeLineBreaks('a\r\nb\rc'), 'a\nb\nc');

// Duplicate lines
let duplicate = removeDuplicateLines('apple\nbanana\napple');
assert.deepEqual(duplicate, { text: 'apple\nbanana', removed: 1, unique: 2 });
assert.deepEqual(removeDuplicateLines(''), { text: '', removed: 0, unique: 0 });
assert.equal(removeDuplicateLines('Apple\napple', { caseSensitive: true }).text, 'Apple\napple');
duplicate = removeDuplicateLines('Apple\napple', { caseSensitive: false });
assert.deepEqual(duplicate, { text: 'Apple', removed: 1, unique: 1 });
duplicate = removeDuplicateLines(' apple \napple\nbanana', { ignoreSurroundingSpaces: true });
assert.equal(duplicate.text, ' apple \nbanana');
assert.equal(duplicate.removed, 1);

// Sorting does not trim, lowercase, or deduplicate
assert.equal(sortLines('banana\nApple\ncherry', 'asc'), 'Apple\nbanana\ncherry');
assert.equal(sortLines('banana\nApple\ncherry', 'desc'), 'cherry\nbanana\nApple');
const preservedSort = sortLines('  b\na\na', 'asc').split('\n');
assert.equal(preservedSort.length, 3);
assert.equal(preservedSort.includes('  b'), true);
assert.equal(preservedSort.filter((line) => line === 'a').length, 2);

// Reverse tools and Unicode
assert.equal(reverseText('Hello'), 'olleH');
assert.equal(reverseText('😀a'), 'a😀');
assert.equal(reverseText('A👨‍👩‍👧B'), 'B👨‍👩‍👧A');
assert.equal(reverseLineOrder('A\nB\nC'), 'C\nB\nA');
assert.equal(reverseWordOrder('  This  is a test  '), '  test  a is This  ');

// Find / Replace literal safety
for (const symbol of ['.', '-', '?', '[']) {
  const sample = `a${symbol}b${symbol}c`;
  assert.equal(countMatches(sample, symbol).count, 2, `literal count failed for ${symbol}`);
  assert.equal(replaceText(sample, symbol, '_', { all: true }).text, 'a_b_c');
}
assert.equal(countMatches('Hello hello', 'hello', { caseSensitive: true }).count, 1);
assert.equal(countMatches('Hello hello', 'hello', { caseSensitive: false }).count, 2);
let replacement = replaceText('one one one', 'one', 'two', { all: false });
assert.deepEqual(replacement, { text: 'two one one', replaced: 1, error: '' });
replacement = replaceText('one one one', 'one', 'two', { all: true });
assert.deepEqual(replacement, { text: 'two two two', replaced: 3, error: '' });
assert.equal(replaceText('x', 'x', '$&', { all: true }).text, '$&');
assert.equal(countMatches('a1 b22', '\\d+', { regex: true }).count, 2);
assert.equal(replaceText('a1 b22', '\\d+', '#', { all: true, regex: true }).text, 'a# b#');
assert.notEqual(countMatches('abc', '[', { regex: true }).error, '');
assert.notEqual(replaceText('abc', '[', 'x', { all: true, regex: true }).error, '');

// Frequency / unique-token behavior
const frequency = calculateWordFrequency('apple apple banana', false, 8);
assert.deepEqual(frequency.slice(0, 2), [{ word: 'apple', count: 2 }, { word: 'banana', count: 1 }]);
assert.equal(calculateStats('Apple apple banana').uniqueWords, 2);
assert.equal(countWords('the apple'), 2);
assert.deepEqual(calculateWordFrequency('the apple', true, 8), [{ word: 'apple', count: 1 }]);
assert.equal(removeNumbers('abc123 বাংলা১২৩'), 'abc বাংলা');

// Transformation history: undo, redo, branch invalidation, and bounded stack.
let history = createHistoryState('a  a\nb\nb');
history = historyReducer(history, { type: 'transform', text: 'A  A\nB\nB' });
history = historyReducer(history, { type: 'transform', text: 'A A\nB\nB' });
history = historyReducer(history, { type: 'transform', text: 'A A\nB' });
assert.equal(history.current, 'A A\nB');
history = historyReducer(history, { type: 'undo' });
assert.equal(history.current, 'A A\nB\nB');
history = historyReducer(history, { type: 'undo' });
assert.equal(history.current, 'A  A\nB\nB');
history = historyReducer(history, { type: 'redo' });
assert.equal(history.current, 'A A\nB\nB');
history = historyReducer(history, { type: 'transform', text: 'NEW BRANCH' });
assert.equal(history.redo.length, 0);
history = historyReducer(history, { type: 'redo' });
assert.equal(history.current, 'NEW BRANCH');

let bounded = createHistoryState('0');
for (let index = 1; index <= HISTORY_LIMIT + 12; index += 1) {
  bounded = historyReducer(bounded, { type: 'transform', text: String(index) });
}
assert.equal(bounded.undo.length, HISTORY_LIMIT);
bounded = historyReducer(bounded, { type: 'undo' });
bounded = historyReducer(bounded, { type: 'type', text: 'manual edit' });
assert.equal(bounded.redo.length, 0);

// File validation without browser upload/network.
const validFile = { name: 'notes.txt', type: 'text/plain', size: 120 };
const banglaFile = { name: 'বাংলা.md', type: 'text/markdown', size: 120 };
const wrongExtension = { name: 'photo.png', type: 'image/png', size: 120 };
const disguisedBinary = { name: 'photo.txt', type: 'image/png', size: 120 };
const hugeFile = { name: 'huge.txt', type: 'text/plain', size: MAX_FILE_BYTES + 1 };
assert.equal(validateTextFile(validFile), '');
assert.equal(validateTextFile(banglaFile), '');
assert.match(validateTextFile(wrongExtension), /\.txt/);
assert.match(validateTextFile(disguisedBinary), /plain text/i);
assert.match(validateTextFile(hugeFile), /too large/i);

// Large-text smoke test: enough to exercise live statistics and transformations without an external API.
const largeText = Array.from({ length: 10000 }, (_, index) => `line ${index} apple apple`).join('\n');
const started = performance.now();
const largeStats = calculateStats(largeText);
const largeFrequency = calculateWordFrequency(largeText, false, 8);
const largeClean = removeExtraSpaces(largeText);
const elapsed = performance.now() - started;
assert.equal(largeStats.lines, 10000);
assert.equal(largeFrequency[0].word, 'apple');
assert.equal(largeClean.length, largeText.length);
assert.equal(elapsed < 5000, true, `large-text audit took ${elapsed.toFixed(0)} ms`);

console.log(`Text utility audit passed (${elapsed.toFixed(0)} ms large-text smoke test).`);
