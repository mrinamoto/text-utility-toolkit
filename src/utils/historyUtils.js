export const HISTORY_LIMIT = 40;

export function createHistoryState(initialText = '') {
  return { current: initialText, undo: [], redo: [] };
}

function pushBounded(stack, value, limit = HISTORY_LIMIT) {
  const next = [...stack, value];
  return next.length > limit ? next.slice(next.length - limit) : next;
}

export function historyReducer(state, action) {
  switch (action.type) {
    case 'type': {
      if (action.text === state.current) return state;
      // Typing is not added to transformation history, but it starts a new branch.
      return { ...state, current: action.text, redo: [] };
    }
    case 'transform': {
      if (action.text === state.current) return state;
      return {
        current: action.text,
        undo: pushBounded(state.undo, state.current),
        redo: [],
      };
    }
    case 'replace': {
      if (action.text === state.current) return state;
      if (action.recordCurrent === false) {
        return { current: action.text, undo: state.undo, redo: [] };
      }
      return {
        current: action.text,
        undo: pushBounded(state.undo, state.current),
        redo: [],
      };
    }
    case 'undo': {
      if (!state.undo.length) return state;
      const previous = state.undo[state.undo.length - 1];
      return {
        current: previous,
        undo: state.undo.slice(0, -1),
        redo: pushBounded(state.redo, state.current),
      };
    }
    case 'redo': {
      if (!state.redo.length) return state;
      const next = state.redo[state.redo.length - 1];
      return {
        current: next,
        undo: pushBounded(state.undo, state.current),
        redo: state.redo.slice(0, -1),
      };
    }
    default:
      return state;
  }
}
