const STORAGE_KEY = "grad_protocol_v1";

export const DEFAULT_STATE = {
  currentStage: 0,
  completedStages: [],
  startedAt: null,
  completedAt: null,
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE, startedAt: Date.now() };
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_STATE, startedAt: Date.now() };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not persist state:", e);
  }
}

export function completeStage(state, stageIndex) {
  const completedStages = Array.from(
    new Set([...state.completedStages, stageIndex])
  );
  const nextStage = Math.min(stageIndex + 1, 7);
  const newState = {
    ...state,
    currentStage: nextStage,
    completedStages,
  };
  saveState(newState);
  return newState;
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_STATE, startedAt: Date.now() };
}
