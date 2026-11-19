// Saved progress for the Leonida Trophy Guide: earned ticks, partial counts,
// per-trophy notes and the spoiler setting, all in localStorage only.
export const STORE_KEY = 'gta6-trophy-guide-v1';

// A first-visit demo set: 13 earned, with partial counts on the long grinds.
// Applied only when the page is opened with ?seed=demo and nothing is saved yet.
export const DEMO_SEED = {
  earned: [2, 3, 8, 16, 20, 21, 36, 37, 41, 44, 46, 53, 55],
  counts: { 15: 87, 31: 34, 32: 12, 35: 41, 42: 19 },
  notes: { 28: 'Balcony meditation done in Chapter 1. Do not lose the Chapter 1 save.' },
  spoiler: 'hide',
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { earned: [], counts: {}, notes: {}, spoiler: 'hide' };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned : [],
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      spoiler: parsed.spoiler === 'show' ? 'show' : 'hide',
    };
  } catch {
    return { earned: [], counts: {}, notes: {}, spoiler: 'hide' };
  }
}

export function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

export function isEarned(state, id) {
  return state.earned.includes(id);
}

export function toggleEarned(state, id) {
  state.earned = isEarned(state, id)
    ? state.earned.filter((x) => x !== id)
    : [...state.earned, id];
  saveState(state);
  return state;
}

export function setCount(state, id, value) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  if (n === 0) delete state.counts[id];
  else state.counts[id] = n;
  saveState(state);
  return state;
}

export function setNote(state, id, text) {
  if (text.trim() === '') delete state.notes[id];
  else state.notes[id] = text;
  saveState(state);
  return state;
}

export function exportProgress(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importProgress(file) {
  const parsed = JSON.parse(await file.text());
  const next = {
    earned: Array.isArray(parsed.earned) ? parsed.earned.filter((x) => Number.isInteger(x)) : [],
    counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
    notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
    spoiler: parsed.spoiler === 'show' ? 'show' : 'hide',
  };
  saveState(next);
  return next;
}
