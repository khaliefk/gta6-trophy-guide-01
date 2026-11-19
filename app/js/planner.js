// Next-up planner: the first unearned trophy in roadmap order (stage, then id),
// plus the short queue after it and progress broken down by grade and stage.
export function nextUp(trophies, state, count = 5) {
  const remaining = trophies
    .filter((t) => !state.earned.includes(t.id))
    .sort((a, b) => a.stage - b.stage || a.id - b.id);
  return remaining.slice(0, count);
}

export function nextUpReason(trophy) {
  if (trophy.missable) return 'Do this one first: it is the only trophy that can lock the platinum.';
  if (trophy.kind === 'story' || trophy.kind === 'mission') return 'Story order: it unlocks as you play the chapters.';
  if (trophy.stage === 2) return 'Stage 2: part of the 100% completion grind.';
  if (trophy.kind === 'side') return 'Stage 3 cleanup: a side-story finale that stays open after the credits.';
  return 'Stage 3 cleanup: a free-roam trophy, best done after the story.';
}

export function platinumPercent(trophies, state) {
  const others = trophies.filter((t) => t.grade !== 'platinum');
  const earned = others.filter((t) => state.earned.includes(t.id)).length;
  return Math.round((earned / others.length) * 100);
}
