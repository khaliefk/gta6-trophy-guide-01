/* Leonida Trophy Atlas. Plain script, no libraries. Progress lives in localStorage. */

(() => {
  "use strict";

  const KEY = "leonida-trophy-atlas-v1";
  const DATA_URL = "data/trophies.json";

  const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  const KIND_ORDER = { story: 0, side: 1, robbery: 2, activity: 3, collectible: 4, grind: 5 };

  const STAGES = [
    { n: 1, title: "Stage 1: Play the story", hours: "about 60 hours",
      blurb: "Chapters 1 to 5, in order. Bank the missable meditation in Chapter 1, keep a save at the start of every chapter, and do the time-sensitive race in Chapter 3 the moment it shows up." },
    { n: 2, title: "Stage 2: Side stories and free roam", hours: "about 70 hours",
      blurb: "Six side-story finales, robberies, partner trophies, activities and collectibles. Everything here stays open after the credits, so work it at your own pace." },
    { n: 3, title: "Stage 3: The long grind", hours: "about 70 hours",
      blurb: "Stunts, challenges, vehicles, cards and shooting range golds. This is the slow tail of the list, and it ends with 100% completion and the platinum." },
  ];

  const KIND_LABELS = {
    story: "Story",
    side: "Side story",
    robbery: "Robbery",
    activity: "Activity",
    collectible: "Collectible",
    grind: "Grind",
  };

  const state = { earned: {}, spoilers: false };
  let trophies = [];

  const $ = (id) => document.getElementById(id);

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      if (parsed.earned && typeof parsed.earned === "object") state.earned = parsed.earned;
      if (typeof parsed.spoilers === "boolean") state.spoilers = parsed.spoilers;
    } catch (e) {
      /* a broken save starts fresh */
    }
  }

  function saveState() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* storage full or off */
    }
  }

  function make(tag, text, cls) {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  }

  const isEarned = (t) => !!state.earned[t.id];
  const gradeLabel = (g) => g.charAt(0).toUpperCase() + g.slice(1);

  function storyHidden(t) {
    return state.spoilers && t.kind === "story" && !isEarned(t);
  }

  function displayName(t) {
    return storyHidden(t) ? "Hidden story trophy" : t.name;
  }

  function passesFilters(t) {
    const q = $("q").value.trim().toLowerCase();
    const grade = $("grade").value;
    const kind = $("kind").value;
    const earned = $("earned").value;
    if (grade && t.grade !== grade) return false;
    if (kind === "missable" && !t.missable) return false;
    if (kind === "online") return false;
    if (kind && kind !== "missable" && kind !== "online" && t.kind !== kind) return false;
    if (earned === "yes" && !isEarned(t)) return false;
    if (earned === "no" && isEarned(t)) return false;
    if (q) {
      const hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  function ordered(list) {
    const mode = $("sort").value;
    const copy = list.slice();
    if (mode === "grade") {
      copy.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || (a.name < b.name ? -1 : 1));
    } else if (mode === "name") {
      copy.sort((a, b) => (a.name < b.name ? -1 : 1));
    } else {
      copy.sort((a, b) => a.stage - b.stage || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
    }
    return copy;
  }

  function renderProgress() {
    const earned = trophies.filter(isEarned).length;
    const total = trophies.length;
    $("earned-count").textContent = String(earned);
    $("total-count").textContent = String(total);
    $("earned-pct").textContent = total ? Math.round((earned / total) * 100) + "%" : "0%";
    $("bar-fill").style.width = total ? (earned / total) * 100 + "%" : "0%";
    $("grade-counts").textContent = ["platinum", "gold", "silver", "bronze"]
      .map((g) => {
        const got = trophies.filter((t) => t.grade === g && isEarned(t)).length;
        const all = trophies.filter((t) => t.grade === g).length;
        return gradeLabel(g) + " " + got + "/" + all;
      })
      .join("  ·  ");
  }

  function renderNextUp() {
    const list = $("next-list");
    list.textContent = "";
    const next = trophies.filter((t) => !isEarned(t));
    next.sort((a, b) => a.stage - b.stage || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
    next.slice(0, 5).forEach((t) => {
      const li = make("li");
      li.appendChild(make("span", displayName(t)));
      li.appendChild(make("span", gradeLabel(t.grade) + " · Stage " + t.stage, "tag"));
      if (t.missable) li.appendChild(make("span", "Missable", "tag missable"));
      list.appendChild(li);
    });
    if (!next.length) {
      list.appendChild(make("li", "Every trophy is earned. That is the platinum."));
    }
  }

  function renderStages() {
    const wrap = $("stages");
    wrap.textContent = "";
    STAGES.forEach((s) => {
      const inStage = trophies.filter((t) => t.stage === s.n);
      const got = inStage.filter(isEarned).length;
      const box = make("div", null, "stage");
      const h = make("h3", s.title + " ");
      h.appendChild(make("span", s.hours, "hours"));
      box.appendChild(h);
      box.appendChild(make("p", s.blurb));
      const bar = make("div", null, "mini-bar");
      const fill = make("div", null, "mini-fill");
      fill.style.width = inStage.length ? (got / inStage.length) * 100 + "%" : "0%";
      bar.appendChild(fill);
      box.appendChild(bar);
      box.appendChild(make("div", got + " of " + inStage.length + " trophies earned", "stage-count"));
      wrap.appendChild(box);
    });
  }

  function buildCard(t) {
    const card = make("div", null, "card" + (isEarned(t) ? " earned" : ""));
    const head = make("div", null, "card-head");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = isEarned(t);
    box.setAttribute("aria-label", "Mark " + t.name + " earned");
    box.addEventListener("change", () => {
      if (box.checked) state.earned[t.id] = true;
      else delete state.earned[t.id];
      saveState();
      renderAll();
    });
    head.appendChild(box);

    const title = make("div", null, "card-title");
    title.appendChild(make("h3", displayName(t)));
    if (storyHidden(t)) {
      title.appendChild(make("p", "Story trophy. Its name and description stay hidden until you earn it.", "official spoiled"));
    } else {
      title.appendChild(make("p", "\u201C" + t.description + "\u201D", "official"));
    }
    head.appendChild(title);
    head.appendChild(make("span", gradeLabel(t.grade), "chip " + t.grade));
    card.appendChild(head);

    const tags = make("div");
    tags.appendChild(make("span", KIND_LABELS[t.kind] || t.kind, "tag"));
    tags.appendChild(make("span", "Stage " + t.stage, "tag"));
    if (t.hidden) tags.appendChild(make("span", "Hidden on PS5", "tag hidden-flag"));
    if (t.missable) tags.appendChild(make("span", "Missable", "tag missable"));
    if (t.unconfirmed) tags.appendChild(make("span", "Method unconfirmed", "tag unconfirmed"));
    if (t.count) tags.appendChild(make("span", "Target: " + t.count.toLocaleString("en-US"), "tag"));
    card.appendChild(tags);

    if (storyHidden(t)) {
      card.appendChild(make("p", "Guide hidden with the spoiler setting on. Earn the trophy, or switch spoilers off, to read it.", "guide spoiled"));
    } else {
      card.appendChild(make("p", t.guide, "guide"));
      const meta = make("p", "Source: ", "meta");
      t.sources.forEach((s, i) => {
        if (i) meta.appendChild(document.createTextNode(", "));
        const a = document.createElement("a");
        a.href = s.url;
        a.textContent = s.name;
        a.rel = "noopener";
        meta.appendChild(a);
      });
      card.appendChild(meta);
    }
    return card;
  }

  function renderCards() {
    const wrap = $("cards");
    wrap.textContent = "";
    const shown = ordered(trophies.filter(passesFilters));
    $("count-line").textContent =
      $("kind").value === "online"
        ? "No online trophies. All 55 unlock in single-player, so this filter is empty on purpose."
        : "Showing " + shown.length + " of " + trophies.length + " trophies.";
    $("empty").hidden = shown.length > 0;
    shown.forEach((t) => wrap.appendChild(buildCard(t)));
  }

  function renderAll() {
    renderProgress();
    renderNextUp();
    renderStages();
    renderCards();
  }

  function exportProgress() {
    const data = {
      app: "leonida-trophy-atlas",
      exportedAt: new Date().toISOString(),
      earned: Object.keys(state.earned).sort(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "leonida-trophy-atlas-progress.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function importProgress(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const ids = data && Array.isArray(data.earned) ? data.earned : null;
        if (!ids) throw new Error("bad file");
        const known = {};
        trophies.forEach((t) => {
          known[t.id] = true;
        });
        const next = {};
        ids.forEach((id) => {
          if (known[id]) next[id] = true;
        });
        state.earned = next;
        saveState();
        renderAll();
      } catch (e) {
        alert("That file is not a Leonida Trophy Atlas export. Nothing changed.");
      }
    };
    reader.readAsText(file);
  }

  function init() {
    loadState();
    const params = new URLSearchParams(window.location.search);
    const presetGrade = params.get("grade");
    const presetKind = params.get("kind");
    const presetQ = params.get("q");
    if (presetGrade && ["platinum", "gold", "silver", "bronze"].includes(presetGrade)) {
      $("grade").value = presetGrade;
    }
    if (presetKind && ["story", "missable", "collectible", "activity", "robbery", "side", "grind", "online"].includes(presetKind)) {
      $("kind").value = presetKind;
    }
    if (presetQ) $("q").value = presetQ;
    if (params.get("spoilers") === "1") state.spoilers = true;
    $("spoilers").checked = state.spoilers;

    ["q", "grade", "kind", "earned", "sort"].forEach((id) => {
      $(id).addEventListener("input", renderCards);
      $(id).addEventListener("change", renderCards);
    });
    $("spoilers").addEventListener("change", () => {
      state.spoilers = $("spoilers").checked;
      saveState();
      renderAll();
    });
    $("export").addEventListener("click", exportProgress);
    $("import-btn").addEventListener("click", () => $("import-file").click());
    $("import-file").addEventListener("change", () => {
      if ($("import-file").files.length) importProgress($("import-file").files[0]);
      $("import-file").value = "";
    });
    $("reset").addEventListener("click", () => {
      if (window.confirm("Clear every earned trophy? This cannot be undone.")) {
        state.earned = {};
        saveState();
        renderAll();
      }
    });

    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error("trophy data did not load");
        return r.json();
      })
      .then((data) => {
        trophies = data.trophies || [];
        renderAll();
        if (window.location.hash) {
          const target = document.querySelector(window.location.hash);
          if (target) target.scrollIntoView();
        }
      })
      .catch(() => {
        $("cards").textContent = "";
        $("cards").appendChild(
          make("p", "The trophy data did not load. Open this page from its own files, with data/trophies.json beside it.", "empty"),
        );
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
