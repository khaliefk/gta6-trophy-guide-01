[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/khaliefk/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/khaliefk/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Guide, GTA VI, all 55 trophies

An offline, open-source trophy guide and tracker for Grand Theft Auto VI on
PlayStation 5. A static web app: open `app/index.html` from any static file
server and it works with the network off. No build step, no accounts, no
tracking. Your ticks, counts and notes stay in your browser (localStorage)
and can be exported to a file and imported back.

## What it covers

- **All 55 trophies** with their official PlayStation names, descriptions and
  grades (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PSN).
- **A guide for every trophy in our own words**, with steps and a named source
  beside each one. Where no published guide has confirmed a method yet (five
  hidden trophies at launch), this guide says so instead of guessing.
- **A roadmap to the platinum**: about 200 hours, difficulty 4/10, one
  playthrough, zero online trophies. Three stages, plus the full 100%
  completion checklist with its numbers.
- **Missables flagged**: Positive Mental Attitude is the one trophy that can
  lock the platinum (Lucia's balcony meditation in Chapter 1), and the
  Chapter 3 Race Against Yago is time-sensitive.
- **A tracker**: checklist saved in the browser, export and import, search,
  filters by kind (story, missable, collectibles, activities, robbery,
  partner, side stories) and by grade, a spoiler setting that hides story
  trophies until earned, per-trophy progress counts and notes, and a Next up
  planner that picks your next trophy in roadmap order.

## Run it

```sh
node serve.ts            # serves app/ on http://localhost:8080
```

Or serve `app/` with any static file server. Deep links work:
`#/roadmap`, `#/missables`, `#/completion`, `#/next`, plus
`?seed=demo` for a first-visit demo state (13 of 55 earned, counters part
way), `?spoiler=hide|show`, `?trophy=<id>` and `?kind=<kind>`.

## Screenshots

Taken at 1280x800 in Chromium, JPEG quality 82, from the app served locally:

1. `1-checklist.jpg`, checklist with the Positive Mental Attitude guide open
2. `2-roadmap.jpg`, the road to the platinum
3. `3-missables.jpg`, missables, with the spoiler setting hiding story trophies
4. `4-completion.jpg`, the 100% completion checklist

## Sources

See `SOURCES.md` for every source used, with access dates.

## License

MIT. Unofficial fan guide, not affiliated with Rockstar Games or PlayStation.
No game art, logos or screenshots of the game are used.
