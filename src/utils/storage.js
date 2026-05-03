const STORAGE_KEY = (playerId) => `grad_protocol_v2_${playerId}`;

export const DEFAULT_STATE = {
  currentStage: 0,
  completedStages: [],
  startedAt: null,
  completedAt: null,
};

export function loadState(playerId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(playerId));
    if (!raw) return { ...DEFAULT_STATE, startedAt: Date.now() };
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_STATE, startedAt: Date.now() };
  }
}

export function saveState(state, playerId) {
  try {
    localStorage.setItem(STORAGE_KEY(playerId), JSON.stringify(state));
  } catch (e) {
    console.warn("Could not persist state:", e);
  }
}

export function completeStage(state, stageIndex, playerId) {
  const completedStages = Array.from(
    new Set([...state.completedStages, stageIndex])
  );
  const nextStage = Math.min(stageIndex + 1, 7);
  const newState = {
    ...state,
    currentStage: nextStage,
    completedStages,
  };
  saveState(newState, playerId);
  return newState;
}

export function resetState(playerId) {
  localStorage.removeItem(STORAGE_KEY(playerId));
  return { ...DEFAULT_STATE, startedAt: Date.now() };
}
