// All views of the guide: the checklist with its detail pane, the roadmap,
// the missables page, the 100% completion tables and the Next up planner.
import { KIND_FILTERS, KIND_LABELS, applyFilters, gradeCounts, isMasked, stageCounts } from './filters.js';
import { nextUp, nextUpReason, platinumPercent } from './planner.js';
import { isEarned, setCount, setNote, toggleEarned } from './store.js';

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function gradePill(grade) {
  return `<span class="pill ${grade}">${grade}</span>`;
}

function targetChip(trophy, state) {
  if (!trophy.target) return '';
  const have = state.counts[trophy.id] || 0;
  return `<span class="count">${have} / ${trophy.target} ${esc(trophy.targetLabel)}</span>`;
}

function trophyRow(trophy, state, ctx) {
  const masked = isMasked(trophy, state);
  const earned = isEarned(state, trophy.id);
  const row = document.createElement('div');
  row.className = 'row' + (earned ? ' earned' : '') + (ctx.selectedId === trophy.id ? ' selected' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', 'Mark ' + trophy.name + ' earned');
  box.addEventListener('change', (e) => { e.stopPropagation(); toggleEarned(ctx.state, trophy.id); ctx.rerender(); });
  row.append(box);
  const grow = document.createElement('div');
  grow.className = 'grow';
  if (masked) {
    grow.innerHTML = `<div class="name masked">Hidden trophy, story trophy, earn it to reveal</div><div class="desc">Its name and description stay hidden while spoilers are off.</div><div class="meta">${gradePill(trophy.grade)}<span class="pill tag">Story</span></div>`;
  } else {
    grow.innerHTML = `<div class="name">${esc(trophy.name)}</div><div class="desc">${esc(trophy.description)}</div><div class="meta">${gradePill(trophy.grade)}<span class="pill tag">${esc(KIND_LABELS[trophy.kind] || trophy.kind)}</span>${trophy.missable ? '<span class="pill miss">Missable</span>' : ''}${trophy.hidden ? '<span class="pill tag">Hidden on PSN</span>' : ''}${targetChip(trophy, state)}</div>`;
  }
  row.append(grow);
  row.addEventListener('click', () => ctx.select(trophy.id));
  return row;
}

export function renderChecklist(view, ctx) {
  const { trophies, state } = ctx;
  const q = ctx.query;
  view.innerHTML = '';
  const bar = document.createElement('div');
  bar.className = 'toolbar';
  bar.innerHTML = `<input type="text" id="search" placeholder="Search trophies, descriptions, guides" value="${esc(q.search || '')}" aria-label="Search trophies">
    <select id="gradeSel" aria-label="Filter by grade">
      <option value="all">All grades</option><option value="platinum">Platinum</option>
      <option value="gold">Gold</option><option value="silver">Silver</option><option value="bronze">Bronze</option>
    </select>
    <select id="statusSel" aria-label="Filter by earned state">
      <option value="all">All trophies</option><option value="earned">Earned</option><option value="remaining">Still to earn</option>
    </select>
    <span id="shownCount"></span>`;
  const chips = document.createElement('div');
  chips.className = 'chips';
  for (const [value, label] of KIND_FILTERS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (q.kind === value ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', () => { ctx.setQuery({ kind: value }); });
    chips.append(b);
  }
  bar.append(chips);
  view.append(bar);
  bar.querySelector('#gradeSel').value = q.grade;
  bar.querySelector('#statusSel').value = q.status;
  bar.querySelector('#search').addEventListener('input', (e) => ctx.setQuery({ search: e.target.value }, true));
  bar.querySelector('#gradeSel').addEventListener('change', (e) => ctx.setQuery({ grade: e.target.value }));
  bar.querySelector('#statusSel').addEventListener('change', (e) => ctx.setQuery({ status: e.target.value }));

  const split = document.createElement('div');
  split.className = 'split';
  const list = document.createElement('div');
  list.className = 'list';
  const up = nextUp(trophies, state, 1)[0];
  if (up) {
    const strip = document.createElement('div');
    strip.className = 'warn';
    strip.innerHTML = `<strong>Next up: ${esc(up.name)}</strong>, ${esc(nextUpReason(up))} <button type="button" id="openUp">Open its guide</button>`;
    strip.querySelector('#openUp').addEventListener('click', () => ctx.select(up.id));
    list.append(strip);
  }
  const shown = applyFilters(trophies, state, q);
  bar.querySelector('#shownCount').textContent = shown.length + ' of 55 shown · ' + state.earned.length + ' earned';
  if (shown.length === 0) {
    list.innerHTML = '<div class="empty">Nothing matches those filters. Clear the search or pick another kind.</div>';
  }
  for (const t of shown) list.append(trophyRow(t, state, ctx));
  split.append(list);
  const detail = document.createElement('div');
  detail.className = 'detail';
  const selected = trophies.find((t) => t.id === ctx.selectedId) || shown[0];
  renderDetail(detail, selected, ctx);
  split.append(detail);
  view.append(split);
}

function renderDetail(box, trophy, ctx) {
  const { state } = ctx;
  if (!trophy) { box.innerHTML = '<p class="empty">Pick a trophy to see its guide.</p>'; return; }
  const earned = isEarned(state, trophy.id);
  if (isMasked(trophy, state)) {
    box.innerHTML = `<h2>Hidden trophy</h2>
      <p class="official">This is a story trophy. Its name and description stay hidden while spoilers are off.</p>
      <p>Switch spoilers to "Show all" at the top of the page, or earn it in the game, to see its guide.</p>
      <button class="earnBtn" type="button">Mark earned</button>
      <p class="sources">Sources: Exophase + PSNProfiles (official list).</p>`;
    box.querySelector('.earnBtn').addEventListener('click', () => { toggleEarned(ctx.state, trophy.id); ctx.rerender(); });
    return;
  }
  box.innerHTML = `<div class="meta">${gradePill(trophy.grade)}<span class="pill tag">${esc(KIND_LABELS[trophy.kind] || trophy.kind)}</span>${trophy.missable ? ' <span class="pill miss">Missable</span>' : ''}${trophy.hidden ? ' <span class="pill tag">Hidden on PSN</span>' : ''}</div>
    <h2>${esc(trophy.name)}</h2>
    <p class="official">Official description: "${esc(trophy.description)}"</p>
    ${trophy.target ? `<div class="countEdit"><label>Your count <input type="number" id="countInput" min="0" max="${trophy.target}" value="${state.counts[trophy.id] || 0}"></label><span> / ${trophy.target} ${esc(trophy.targetLabel)}</span></div>` : ''}
    <p class="guide">${esc(trophy.guide)}</p>
    <h3>How to do it</h3>
    <ol>${trophy.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    <button class="earnBtn${earned ? ' earned' : ''}" type="button">${earned ? 'Earned, tap to unmark' : 'Mark earned'}</button>
    <p class="sources"><strong>Sources:</strong> ${esc(trophy.sources)}</p>
    <h3>Your note</h3>
    <textarea id="noteInput" placeholder="Where you left off, a spot that worked, a save to keep" aria-label="Your note for this trophy"></textarea>`;
  box.querySelector('.earnBtn').addEventListener('click', () => { toggleEarned(ctx.state, trophy.id); ctx.rerender(); });
  const countInput = box.querySelector('#countInput');
  if (countInput) countInput.addEventListener('change', (e) => { setCount(ctx.state, trophy.id, e.target.value); ctx.rerender(); });
  const noteInput = box.querySelector('#noteInput');
  noteInput.value = state.notes[trophy.id] || '';
  noteInput.addEventListener('input', (e) => setNote(ctx.state, trophy.id, e.target.value));
}

export function renderRoadmap(view, ctx) {
  const r = ctx.roadmap;
  view.innerHTML = `<h2>The road to the platinum</h2>
    <p>${r.stages.length} stages, about 200 hours in total. Story first, then the 100% checklist, then cleanup. Everything outside the story stays open after the credits.</p>
    <div class="factsGrid">${r.facts.map((f) => `<div class="fact"><span class="factLabel">${esc(f.label)}</span><span>${esc(f.value)}</span></div>`).join('')}</div>
    <div class="cards">${r.stages.map((s) => `<section class="card"><h3>${esc(s.name)}</h3><p><strong>${esc(s.hours)}</strong></p><ol>${s.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></section>`).join('')}</div>
    <h2>Save before you need it</h2>
    <p>There is no mission replay and no New Game Plus. Keep one manual save per chapter and one untouched save from just before the final mission.</p>
    <ul class="checklist">${r.saveChecklist.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>Do not waste hours</h2>
    <ul class="checklist">${r.notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <p class="sources">Sources: ${esc(r.sources)}</p>`;
}

export function renderMissables(view, ctx) {
  const r = ctx.roadmap;
  const story = ctx.trophies.filter((t) => t.kind === 'story' || t.kind === 'mission');
  const hiddenLeft = story.filter((t) => !ctx.state.earned.includes(t.id)).length;
  view.innerHTML = `<h2>Missables: what can actually go wrong</h2>
    <p>One trophy can lock the platinum. One race is time-sensitive. Everything else stays open after the credits.</p>
    ${r.missables.map((m) => `<section class="warn"><h2>${esc(m.name)}</h2><p><strong>${esc(m.risk)}</strong> ${esc(m.detail)}</p><ol>${m.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></section>`).join('')}
    <h2>The spoiler setting, at work</h2>
    <p>Spoilers are currently <strong>${ctx.state.spoiler === 'hide' ? 'hidden' : 'shown'}</strong>. The ${hiddenLeft} story trophies not earned yet show as masked rows; earned ones always show their names.</p>
    <div class="list" id="spoilerDemo"></div>`;
  const demo = view.querySelector('#spoilerDemo');
  for (const t of story.filter((x) => !ctx.state.earned.includes(x.id)).slice(0, 2)) {
    const row = document.createElement('div');
    row.className = 'row demoRow';
    row.innerHTML = `<span class="name masked">Hidden trophy, story trophy, earn it to reveal</span><span class="meta">${gradePill(t.grade)}<span class="pill tag">Story</span></span>`;
    demo.append(row);
  }
}

export function renderCompletion(view, ctx) {
  const r = ctx.roadmap;
  view.innerHTML = `<h2>100% completion: the A Long Road checklist</h2>
    <p>Reach 100% and the gold trophy <strong>A Long Road</strong> pops. You do not need everything in the game, only these numbers. The checklist appears under Progress, then Stats, then 100% Completion after the story, and work from earlier already counts.</p>
    <div class="tables">${r.tables.map((t) => `<section class="card"><h3>${esc(t.title)}</h3><table class="data"><tbody>${t.rows.map((row) => `<tr><td>${esc(row[0])}</td><td><strong>${esc(row[1])}</strong></td></tr>`).join('')}</tbody></table></section>`).join('')}</div>
    <p><button type="button" id="openLongRoad">Open the A Long Road guide</button></p>
    <p class="sources">Sources: ${esc(r.sources)}</p>`;
  view.querySelector('#openLongRoad').addEventListener('click', () => ctx.select(14, 'checklist'));
}

export function renderNext(view, ctx) {
  const { trophies, state } = ctx;
  const queue = nextUp(trophies, state, 5);
  const grades = gradeCounts(trophies, state);
  const stages = stageCounts(trophies, state);
  const pct = platinumPercent(trophies, state);
  const first = queue[0];
  view.innerHTML = `<h2>Next up</h2>
    ${first ? `<section class="nextCard"><p><strong>Your next trophy</strong></p><h2>${esc(first.name)}</h2><p>${esc(first.description)}</p><p>${esc(nextUpReason(first))}</p><p>${esc(first.guide)}</p><p><button type="button" id="openNext">Open its guide</button></p></section>` : '<section class="nextCard"><h2>That is the platinum.</h2><p>Every trophy is earned. Vice Got a Price! should already be yours.</p></section>'}
    <h2>After that</h2>
    <div class="list">${queue.slice(1).map((t) => `<div class="row"><div class="grow"><div class="name">${esc(t.name)}</div><div class="desc">${esc(t.description)}</div><div class="meta">${gradePill(t.grade)}<span class="pill tag">${esc(KIND_LABELS[t.kind] || t.kind)}</span></div></div></div>`).join('') || '<p class="empty">Nothing left.</p>'}</div>
    <h2>Progress by grade</h2>
    ${[['Platinum', grades.platinum, 1], ['Gold', grades.gold, 2], ['Silver', grades.silver, 6], ['Bronze', grades.bronze, 46]].map(([label, got, total]) => `<div class="meterRow"><span class="lab">${label}</span><div class="bar"><span style="width:${Math.round((got / total) * 100)}%"></span></div><span class="val">${got} / ${total}</span></div>`).join('')}
    <h2>Progress by stage</h2>
    ${[1, 2, 3].map((s) => `<div class="meterRow"><span class="lab">Stage ${s}</span><div class="bar"><span style="width:${Math.round(((stages[s]?.earned || 0) / (stages[s]?.total || 1)) * 100)}%"></span></div><span class="val">${stages[s]?.earned || 0} / ${stages[s]?.total || 0}</span></div>`).join('')}
    <p>Platinum progress: <strong>${pct}%</strong> of the other 54 trophies earned.</p>`;
  const btn = view.querySelector('#openNext');
  if (btn && first) btn.addEventListener('click', () => ctx.select(first.id, 'checklist'));
}
