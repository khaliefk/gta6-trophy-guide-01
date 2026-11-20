# Leonida Trophy Atlas

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/khaliefk/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/khaliefk/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

A guide and checklist tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5. It runs as plain files in a browser. No account, no network, no tracking. Your progress stays in your own browser.

## Run it

```sh
cd app && python3 -m http.server 8080
```

Then open http://localhost:8080. Any static file server works. The page fetches `data/trophies.json` from its own folder, so open it over HTTP, not straight from disk.

## What is inside

The list holds every trophy: 1 platinum, 2 gold, 6 silver and 46 bronze. 28 of them stay hidden on PlayStation until earned. Each card shows the official name, the official description, its grade, and a guide written for this page. Every guide names its source beside it.

The tracker saves each tick in localStorage. You can export your progress to a file and import it back. Search finds a trophy by name, mission or place. Filters cover grade, kind (story, missable, collectibles, activities, robberies, side stories, grinds) and earned state. This game has no online trophies. The online filter says so instead of showing nothing with no reason.

The spoiler setting hides the names and descriptions of story trophies until you earn them. Turn it on if you want to play the story blind.

Next up shows the next five unearned trophies on the roadmap. The roadmap runs in three stages and adds up to around 200 hours, by community estimates. Stage 1 is the story. Stage 2 is side stories and free roam. Stage 3 is the long grind that ends with 100% completion and the platinum.

One trophy can be missed: Positive Mental Attitude. The page says so up front, and the card tells you exactly when to do it. GTA VI has no mission replay, so the page also tells you to keep a manual save at the start of every chapter.

## What is still unknown

Five hidden trophies have no confirmed method yet: In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, and Ten Pin. Their cards say that plainly and give the official description as the only hint. Guessing at a method would waste your time, so this guide does not.

## Sources

Trophy names, descriptions and grades are the official PlayStation list, as listed by Exophase and PSNProfiles and reported on 18 November 2026. The guides draw on the Output Lag trophy list, cross-checked against the GTAVibes and EGamers lists. Each trophy card links its source. The guide text is original to this page.

Grand Theft Auto VI is developed and published by Rockstar Games. This is an unofficial fan guide. It uses no Rockstar logo, artwork, box art or game screenshot.

## Files

- `app/index.html`, `app/style.css`, `app/app.js`: the page, its look, its tracker.
- `app/data/trophies.json`: all 55 trophies, with grades, kinds, roadmap stages and guides.
- `main.ts`: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from the make.fun dossier library.
- `vendor/makefun-frontend.ts`: the make.fun dossier library, as shipped in the kit. It is plumbing, not guide content.
- `screenshots/`: three renders of the running app.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
