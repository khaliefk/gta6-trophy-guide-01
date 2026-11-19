/* Leonida Trophy Atlas. Plain script, no libraries. Progress lives in localStorage. */

(function () {
  "use strict";

  var KEY = "leonida-trophy-atlas-v1";
  var DATA_URL = "data/trophies.json";

  var GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  var KIND_ORDER = { story: 0, side: 1, robbery: 2, activity: 3, collectible: 4, grind: 5 };

  var STAGES = [
    { n: 1, title: "Stage 1: Play the story", hours: "about 60 hours",
      blurb: "Chapters 1 to 5, in order. Bank the missable meditation in Chapter 1, keep a save at the start of every chapter, and do the time-sensitive race in Chapter 3 the moment it shows up." },
    { n: 2, title: "Stage 2: Side stories and free roam", hours: "about 70 hours",
      blurb: "Six side-story finales, robberies, partner trophies, activities and collectibles. Everything here stays open after the credits, so work it at your own pace." },
    { n: 3, title: "Stage 3: The long grind", hours: "about 70 hours",
      blurb: "Stunts, challenges, vehicles, cards and shooting range golds. This is the slow tail of the list, and it ends with 100% completion and the platinum." }
  ];

  var KIND_LABELS = {
    story: "Story", side: "Side story", robbery: "Robbery",
    activity: "Activity", collectible: "Collectible", grind: "Grind"
  };

  var state = { earned: {}, spoilers: false };
  var trophies = [];

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if (parsed.earned && typeof parsed.earned === "object") state.earned = parsed.earned;
        if (typeof parsed.spoilers === "boolean") state.spoilers = parsed.spoilers;
      }
    } catch (e) { /* a broken save starts fresh */ }
  }

  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or off */ }
  }

  function $(id) { return document.getElementById(id); }

  function el(tag, text, cls) {
    var node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  }

  function isEarned(t) { return !!state.earned[t.id]; }

  function gradeLabel(g) { return g.charAt(0).toUpperCase() + g.slice(1); }

  function trophyVisible(t) {
    var q = $("q").value.trim().toLowerCase();
    var grade = $("grade").value;
    var kind = $("kind").value;
    var earned = $("earned").value;
    if (grade && t.grade !== grade) return false;
    if (kind === "missable" && !t.missable) return false;
    if (kind === "online") return false;
    if (kind && kind !== "missable" && kind !== "online" && t.kind !== kind) return false;
    if (earned === "yes" && !isEarned(t)) return false;
    if (earned === "no" && isEarned(t)) return false;
    if (q) {
      var hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function sorted(list) {
    var mode = $("sort").value;
    var copy = list.slice();
    if (mode === "grade") {
      copy.sort(function (a, b) {
        return (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || (a.name < b.name ? -1 : 1);
      });
    } else if (mode === "name") {
      copy.sort(function (a, b) { return a.name < b.name ? -1 : 1; });
    } else {
      copy.sort(function (a, b) {
        return (a.stage - b.stage) || (KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
      });
    }
    return copy;
  }

  function renderProgress() {
    var earned = trophies.filter(isEarned).length;
    var total = trophies.length;
    $("earned-count").textContent = String(earned);
    $("total-count").textContent = String(total);
    $("earned-pct").textContent = total ? Math.round(earned / total * 100) + "%" : "0%";
    $("bar-fill").style.width = total ? (earned / total * 100) + "%" : "0%";
    var parts = ["platinum", "gold", "silver", "bronze"].map(function (g) {
      var got = trophies.filter(function (t) { return t.grade === g && isEarned(t); }).length;
      var all = trophies.filter(function (t) { return t.grade === g; }).length;
      return gradeLabel(g) + " " + got + "/" + all;
    });
    $("grade-counts").textContent = parts.join("  ·  ");
  }

  function renderNextUp() {
    var list = $("next-list");
    list.textContent = "";
    var next = trophies.filter(function (t) { return !isEarned(t); });
    next.sort(function (a, b) {
      return (a.stage - b.stage) || (KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
    });
    next.slice(0, 5).forEach(function (t) {
      var li = el("li");
      li.appendChild(el("span", spoilerName(t)));
      var tag = el("span", gradeLabel(t.grade) + " · Stage " + t.stage, "tag");
      li.appendChild(tag);
      if (t.missable) li.appendChild(el("span", "Missable", "tag missable"));
      list.appendChild(li);
    });
    if (!next.length) {
      list.appendChild(el("li", "Every trophy is earned. That is the platinum."));
    }
  }

  function renderStages() {
    var wrap = $("stages");
    wrap.textContent = "";
    STAGES.forEach(function (s) {
      var inStage = trophies.filter(function (t) { return t.stage === s.n; });
      var got = inStage.filter(isEarned).length;
      var box = el("div", null, "stage");
      var h = el("h3", s.title + " ");
      h.appendChild(el("span", s.hours, "hours"));
      box.appendChild(h);
      box.appendChild(el("p", s.blurb));
      var bar = el("div", null, "mini-bar");
      bar.appendChild(el("div", null, "mini-fill"));
      bar.firstChild.style.width = inStage.length ? (got / inStage.length * 100) + "%" : "0%";
      box.appendChild(bar);
      box.appendChild(el("div", got + " of " + inStage.length + " trophies earned", "stage-count"));
      wrap.appendChild(box);
    });
  }

  function spoilerName(t) {
    if (state.spoilers && t.kind === "story" && !isEarned(t)) return "Hidden story trophy";
    return t.name;
  }

  function renderCards() {
    var wrap = $("cards");
    wrap.textContent = "";
    var shown = sorted(trophies.filter(trophyVisible));
    $("count-line").textContent = $("kind").value === "online"
      ? "No online trophies. All 55 unlock in single-player, so this filter is empty on purpose."
      : "Showing " + shown.length + " of " + trophies.length + " trophies.";
    $("empty").hidden = shown.length > 0;
    shown.forEach(function (t) {
      var card = el("div", null, "card" + (isEarned(t) ? " earned" : ""));
      var head = el("div", null, "card-head");
      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = isEarned(t);
      box.setAttribute("aria-label", "Mark " + t.name + " earned");
      box.addEventListener("change", function () {
        if (box.checked) state.earned[t.id] = true; else delete state.earned[t.id];
        saveState();
        renderAll();
      });
      head.appendChild(box);
      var title = el("div", null, "card-title");
      var h = el("h3", spoilerName(t));
      title.appendChild(h);
      var hiddenStory = state.spoilers && t.kind === "story" && !isEarned(t);
      if (hiddenStory) {
        title.appendChild(el("p", "Story trophy. Its name and description stay hidden until you earn it.", "official spoiled"));
      } else {
        title.appendChild(el("p", "“" + t.description + "”", "official"));
      }
      head.appendChild(title);
      head.appendChild(el("span", gradeLabel(t.grade), "chip " + t.grade));
      card.appendChild(head);

      var tags = el("div");
      tags.appendChild(el("span", KIND_LABELS[t.kind] || t.kind, "tag"));
      tags.appendChild(el("span", "Stage " + t.stage, "tag"));
      if (t.hidden) tags.appendChild(el("span", "Hidden on PS5", "tag hidden-flag"));
      if (t.missable) tags.appendChild(el("span", "Missable", "tag missable"));
      if (t.unconfirmed) tags.appendChild(el("span", "Method unconfirmed", "tag unconfirmed"));
      if (t.count) tags.appendChild(el("span", "Target: " + t.count.toLocaleString("en-US"), "tag"));
      card.appendChild(tags);

      if (hiddenStory) {
        card.appendChild(el("p", "Guide hidden with the spoiler setting on. Earn the trophy, or switch spoilers off, to read it.", "guide spoiled"));
      } else {
        card.appendChild(el("p", t.guide, "guide"));
      }
      if (!hiddenStory) {
        var meta = el("p", "Source: ", "meta");
        t.sources.forEach(function (s, i) {
          if (i) meta.appendChild(document.createTextNode(", "));
          var a = document.createElement("a");
          a.href = s.url;
          a.textContent = s.name;
          a.rel = "noopener";
          meta.appendChild(a);
        });
        card.appendChild(meta);
      }
      wrap.appendChild(card);
    });
  }

  function renderAll() {
    renderProgress();
    renderNextUp();
    renderStages();
    renderCards();
  }

  function exportProgress() {
    var data = {
      app: "leonida-trophy-atlas",
      exportedAt: new Date().toISOString(),
      earned: Object.keys(state.earned).sort()
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "leonida-trophy-atlas-progress.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var ids = data && Array.isArray(data.earned) ? data.earned : null;
        if (!ids) throw new Error("bad file");
        var known = {};
        trophies.forEach(function (t) { known[t.id] = true; });
        var next = {};
        ids.forEach(function (id) { if (known[id]) next[id] = true; });
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
    var params = new URLSearchParams(window.location.search);
    var presetGrade = params.get("grade");
    var presetKind = params.get("kind");
    var presetQ = params.get("q");
    if (presetGrade && ["platinum", "gold", "silver", "bronze"].indexOf(presetGrade) !== -1) {
      $("grade").value = presetGrade;
    }
    if (presetKind && ["story", "missable", "collectible", "activity", "robbery", "side", "grind", "online"].indexOf(presetKind) !== -1) {
      $("kind").value = presetKind;
    }
    if (presetQ) $("q").value = presetQ;
    if (params.get("spoilers") === "1") state.spoilers = true;
    $("spoilers").checked = state.spoilers;
    ["q", "grade", "kind", "earned", "sort"].forEach(function (id) {
      $(id).addEventListener("input", renderCards);
      $(id).addEventListener("change", renderCards);
    });
    $("spoilers").addEventListener("change", function () {
      state.spoilers = $("spoilers").checked;
      saveState();
      renderAll();
    });
    $("export").addEventListener("click", exportProgress);
    $("import-btn").addEventListener("click", function () { $("import-file").click(); });
    $("import-file").addEventListener("change", function () {
      if ($("import-file").files.length) importProgress($("import-file").files[0]);
      $("import-file").value = "";
    });
    $("reset").addEventListener("click", function () {
      if (window.confirm("Clear every earned trophy? This cannot be undone.")) {
        state.earned = {};
        saveState();
        renderAll();
      }
    });
    fetch(DATA_URL).then(function (r) {
      if (!r.ok) throw new Error("trophy data did not load");
      return r.json();
    }).then(function (data) {
      trophies = data.trophies || [];
      renderAll();
      if (window.location.hash) {
        var target = document.querySelector(window.location.hash);
        if (target) target.scrollIntoView();
      }
    }).catch(function () {
      $("cards").textContent = "";
      $("cards").appendChild(el("p", "The trophy data did not load. Open this page from its own files, with data/trophies.json beside it.", "empty"));
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
