# Milk's Sports Game Helper

Offline helpers for running career and franchise modes, one app per game (not per sport, since
two games of the same sport can play very differently). Each app is an installable PWA that keeps
its saves in the browser on your device. Nothing is sent anywhere.

| App | Folder | Dev port |
| --- | --- | --- |
| FC 27 Career Helper (EA SPORTS FC 27, Manager Career) | `apps/eafc27` | 5301 |

## FC 27 Career Helper

- **Careers:** keep several saves, each with its club, season, budgets and save rules.
- **Priorities:** open goals and signing targets in one list by priority, reorderable within each level.
- **Goals:** board objectives and your own goals, by season, with progress.
- **Players:** one list for signing targets, the watchlist, signings and players you passed on. Only
  name and position are required; everything else (OVR, potential, value, wage, PlayStyles, stats…) is optional.
- **Formation:** pick any formation and see its slots ranked by importance on a pitch. Open a slot for
  a reference card (what the position does, the role and focus, the stats that matter, PlayStyles to look
  for), plus an optional budget, notes and the players you're considering for it. Roles start filled in and
  can be changed; the importance order can be reordered.
- **Tactics:** a starting tactic for every formation that you can edit.
- **Youth:** academy prospects with age, OVR and potential, for quick reference while scouting.
- **Share and back up:** copy a one-line `FC27:` share code for a friend, or download a `.json` file. Import takes either.

### Where the reference data comes from

- PlayStyles: EA's FC 27 "What are PlayStyles" article.
- Roles and focuses: community FC 27 role guides (fifauteam.com, timesaver.gg).
- Formations: the long-standing FC formation set. No site lists FC 27's formations or the game's default role per slot,
  so the starting roles are this app's best match. Key stats, PlayStyle picks and importance rankings are guidance
  written for this app. Everything is in `apps/eafc27/src/data/` and is easy to correct.

## Development

```powershell
npm.cmd install
npm.cmd run dev      # FC 27 app on http://localhost:5301
npm.cmd test
npm.cmd run check    # svelte-check in every app
npm.cmd run build    # every app into dist/, plus the landing page
```

In Visual Studio, open `milkssportsgamehelper.sln`; F5 runs the FC 27 app.

### Adding a game

Copy `apps/eafc27` to `apps/<game>`, change its name, port, `build.outDir`, manifest and theme, replace `src/data/`
and the views, then add a card to `site/index.html`. Shared storage, sharing and UI pieces live in `packages/core`.

GitHub Pages deploys on every push to `main` (Settings → Pages → Source: GitHub Actions).
