[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/saifulsidik801-ship-it/best-game-01-emberclash/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/saifulsidik801-ship-it/best-game-01-emberclash/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

# 🔥 EMBERCLASH — Arena of the Last Light

**Every hero you pick rewrites the whole tournament — five original fighters, fourteen stackable relics, and a boss who eats light.**

Pick one of five original heroes — flameblade duelist Pyra, stormhammer bruiser Volt, sunbow ranger Luma, molten-fist brawler Magma, or glacier-spear warden Frost — and fight a 7-round ladder through a roaring arena: six rivals, a relic draft after every win, then the final boss ASHLORD. Win the crown and keep going in Endless mode. Bright, loud, particle-packed brawling with procedural WebAudio music that changes per arena, a cheering crowd, screen shake, combos, crits, burns, freezes and ultimates.

## How to play

1. Open `game/index.html` in desktop Chrome (or serve `game/` with any static server). No install, no network, no sign-up.
2. Click **FIGHT!**, choose your hero, pick a difficulty (Ember / Blaze / Inferno), optionally turn on Endless mode.
3. Beat your rival before the 60-second timer ends — the fighter with more HP wins a timed round.
4. After every win, draft 1 of 3 relics. Relics stack: lifesteal, crits, burning hits, double jump, second wind and more.
5. Round 7 is ASHLORD, the Last Light Eater — he rages at 66% HP and calls down fire rain at 33%. Beat him to become Champion.

## Controls

| Key | Action |
| --- | --- |
| A / D or ← / → | Move |
| W / ↑ / Space | Jump (double-jump with Sky Feather) |
| J | Attack (chain hits for combos) |
| K | Skill 1 (unique per hero) |
| L | Skill 2 (unique per hero) |
| U | Ultimate (when the meter is full) |
| P / Esc | Pause · M mute · Enter confirm |

Touch works too: tap buttons to navigate; the left/right halves of the screen move you in a fight.

## Features

- 5 playable heroes, each with a basic attack, 2 unique skills and an ultimate
- 7-round tournament ladder + final boss with 3 phases + Endless waves
- 14 stackable relics drafted between rounds, 3 difficulties, run history, feats, almanac/bestiary
- Procedural music per arena + synthesized SFX (WebAudio only, zero audio files)
- Bright arena with animated crowd, torches, drifting embers, trails, shockwaves and screen shake
- Full loop: title → hero select → fight → pause → win/lose → restart, with local run history

## Tech

Zero dependencies, zero network requests. Plain ES modules under `game/src/` (24 modules, one job each), canvas 2D rendering, all art drawn procedurally in code. `main.ts` (Node 22, stdlib only) copies `game/` + `screenshots/` to `/output` and writes `dossier.json` via the vendored `vendor/makefun-game.ts`.

## License

MIT — see [LICENSE](LICENSE).
