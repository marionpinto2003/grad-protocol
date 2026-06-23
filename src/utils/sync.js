const STORAGE_KEY = "grad_protocol_progress";

export function getProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markStageComplete(stageId) {
  const progress = getProgress();

  const updated = {
    ...progress,
    [stageId]: {
      completed: true,
      completedAt: new Date().toISOString(),
    },
  };

  saveProgress(updated);
  return updated;
}

export function isStageComplete(stageId) {
  const progress = getProgress();
  return Boolean(progress?.[stageId]?.completed);
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
