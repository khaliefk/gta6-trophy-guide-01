// Boot, routing and header for the Leonida Trophy Guide.
// Deep links: #/checklist, #/roadmap, #/missables, #/completion, #/next,
// plus ?seed=demo (first-visit demo progress), ?spoiler=hide|show,
// ?trophy=<id> and ?kind=<kind> for the checklist.
import { DEMO_SEED, exportProgress, importProgress, loadState, saveState } from './store.js';
import { gradeCounts } from './filters.js';
import { renderChecklist, renderCompletion, renderMissables, renderNext, renderRoadmap } from './views.js';

const viewEl = document.getElementById('view');
const tabsEl = document.getElementById('tabs');
const spoilerSelect = document.getElementById('spoilerSelect');

const doc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const trophies = doc.trophies;

let state = loadState();
const params = new URLSearchParams(location.search);
const hadSave = localStorage.getItem('gta6-trophy-guide-v1') !== null;
if (params.get('seed') === 'demo' && !hadSave) {
  state = { earned: [...DEMO_SEED.earned], counts: { ...DEMO_SEED.counts }, notes: { ...DEMO_SEED.notes }, spoiler: DEMO_SEED.spoiler };
  saveState(state);
}
if (params.get('spoiler') === 'show' || params.get('spoiler') === 'hide') {
  state.spoiler = params.get('spoiler');
  saveState(state);
}

let query = {
  kind: params.get('kind') || 'all',
  grade: 'all',
  status: 'all',
  search: '',
};
let selectedId = Number(params.get('trophy')) || null;

function currentView() {
  const hash = location.hash.replace(/^#\/?/, '');
  const name = hash.split('/')[0];
  return ['checklist', 'roadmap', 'missables', 'completion', 'next'].includes(name) ? name : 'checklist';
}

function renderHeader() {
  const earned = state.earned.length;
  document.getElementById('progressBig').textContent = earned + ' / ' + trophies.length;
  document.getElementById('progressFill').style.width = Math.round((earned / trophies.length) * 100) + '%';
  const g = gradeCounts(trophies, state);
  document.getElementById('progressGrades').textContent =
    `Platinum ${g.platinum}/1 · Gold ${g.gold}/2 · Silver ${g.silver}/6 · Bronze ${g.bronze}/46`;
  spoilerSelect.value = state.spoiler;
}

const ctx = {
  get trophies() { return trophies; },
  get roadmap() { return roadmapDoc; },
  get state() { return state; },
  get query() { return query; },
  get selectedId() { return selectedId; },
  select(id, viewName) {
    selectedId = id;
    if (viewName) location.hash = '#/' + viewName;
    else render();
  },
  setQuery(patch, keepFocus) {
    query = { ...query, ...patch };
    render(keepFocus);
  },
  rerender() { render(); },
};

function render(keepFocus) {
  renderHeader();
  const name = currentView();
  for (const a of tabsEl.querySelectorAll('a')) a.classList.toggle('active', a.dataset.view === name);
  const searchValue = keepFocus ? document.getElementById('search')?.value : null;
  if (name === 'roadmap') renderRoadmap(viewEl, ctx);
  else if (name === 'missables') renderMissables(viewEl, ctx);
  else if (name === 'completion') renderCompletion(viewEl, ctx);
  else if (name === 'next') renderNext(viewEl, ctx);
  else renderChecklist(viewEl, ctx);
  if (keepFocus && searchValue !== null) {
    const input = document.getElementById('search');
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }
}

spoilerSelect.addEventListener('change', () => {
  state.spoiler = spoilerSelect.value;
  saveState(state);
  render();
});

document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state));
document.getElementById('importInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    state = await importProgress(file);
    render();
  } catch {
    alert('That file is not a trophy progress export.');
  }
  e.target.value = '';
});

window.addEventListener('hashchange', () => render());
render();
