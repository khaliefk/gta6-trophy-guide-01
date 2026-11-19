// Filtering for the trophy checklist: kind, grade, earned state, search text
// and the spoiler rule (hidden story trophies stay masked until earned).
export const KIND_FILTERS = [
  ['all', 'All'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectible', 'Collectibles'],
  ['activity', 'Activities'],
  ['robbery', 'Robbery'],
  ['partner', 'Partner'],
  ['side', 'Side stories'],
];

export const KIND_LABELS = {
  story: 'Story',
  mission: 'Mission',
  side: 'Side story',
  collectible: 'Collectible',
  activity: 'Activity',
  robbery: 'Robbery',
  partner: 'Partner',
  misc: 'Misc',
  meta: 'Platinum path',
};

export function isHiddenTrophy(trophy) {
  return trophy.hidden === true;
}

export function isMasked(trophy, state) {
  return state.spoiler === 'hide' && isHiddenTrophy(trophy) && !state.earned.includes(trophy.id);
}

export function applyFilters(trophies, state, query) {
  const q = (query.search || '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (query.kind === 'missable') {
      if (!t.missable) return false;
    } else if (query.kind !== 'all') {
      if (query.kind === 'story') {
        if (t.kind !== 'story' && t.kind !== 'mission') return false;
      } else if (t.kind !== query.kind) {
        return false;
      }
    }
    if (query.grade !== 'all' && t.grade !== query.grade) return false;
    if (query.status === 'earned' && !state.earned.includes(t.id)) return false;
    if (query.status === 'remaining' && state.earned.includes(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

export function gradeCounts(trophies, state) {
  const out = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (state.earned.includes(t.id)) out[t.grade] += 1;
  return out;
}

export function stageCounts(trophies, state) {
  const out = {};
  for (const t of trophies) {
    out[t.stage] = out[t.stage] || { total: 0, earned: 0 };
    out[t.stage].total += 1;
    if (state.earned.includes(t.id)) out[t.stage].earned += 1;
  }
  return out;
}
