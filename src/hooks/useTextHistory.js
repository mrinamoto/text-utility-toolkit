import { useCallback, useReducer } from 'react';
import { createHistoryState, historyReducer } from '../utils/historyUtils.js';

export function useTextHistory(initialText = '') {
  const [state, dispatch] = useReducer(historyReducer, initialText, createHistoryState);

  const setTypingText = useCallback((text) => dispatch({ type: 'type', text }), []);
  const applyTransformation = useCallback((text) => dispatch({ type: 'transform', text }), []);
  const replaceTextImmediately = useCallback((text, recordCurrent = true) => {
    dispatch({ type: 'replace', text, recordCurrent });
  }, []);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  return {
    text: state.current,
    setTypingText,
    applyTransformation,
    replaceTextImmediately,
    undo,
    redo,
    canUndo: state.undo.length > 0,
    canRedo: state.redo.length > 0,
  };
}
