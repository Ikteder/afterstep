# Afterstep

[![CI](https://github.com/Ikteder/afterstep/actions/workflows/ci.yml/badge.svg)](https://github.com/Ikteder/afterstep/actions/workflows/ci.yml)

Afterstep is a compact, browser-native time-loop puzzle game. Move through a trace, commit the route, and that route returns as an echo on the next loop. Park one echo on every violet sigil while the bright traveler reaches the gold gate.

Version 1.1 adds a locally generated Daily Trace. Its seed comes from the local date, and the game presents a challenge only after a solver-produced route certificate wins through the same production engine used for play.

The game has no runtime dependencies, accounts, analytics, network calls, or external assets. It runs from a tiny local static server and works with keyboard or on-screen controls.

## Why this game exists

Time-loop games often rely on reflexes or a long narrative. Afterstep compresses the idea into a readable planning puzzle: every prior route replays on one shared turn clock, finishes its instructions, and then waits on its final tile. The player decides which routes deserve to become permanent collaborators.

## Features

- Four authored puzzles that introduce route commitment, multiple echoes, wall-aware planning, undo, and shared-clock timing.
- A deterministic Daily Trace with generated walls, two or three sigils, and a stable local-date seed.
- Breadth-first shortest-route certificates that are replayed through the production engine before a generated trace is shown.
- A visible `Calm`, `Measured`, or `Knotted` route-complexity estimate with its numeric score and shortest route lengths.
- Pure deterministic game engine separated from Canvas rendering.
- Echo trails, energized-sigil feedback, responsive board scaling, and a low-distraction visual style.
- Arrow keys and WASD for movement, Space to wait, Enter to commit, Z to undo, and R to retry the current loop.
- Equivalent touch controls for phones and tablets.
- Optional synthesized sound with no downloaded audio files.
- Local progress that remembers the latest unlocked trace.
- Verified solution route for every bundled puzzle.

## Run

Requires Node.js 20 or newer.

```bash
npm start
```

Open `http://127.0.0.1:4173`.

## Verify

```bash
npm test
npm run check
npm run demo
```

The test suite checks level structure, legal movement, walls, waiting, echo commitment, replay timing, undo, retry, sigil rules, turn limits, terminal wins, and a complete winning route for all four authored puzzles. It also sweeps 1,000 seeds and requires every generated certificate to win. The deterministic demos solve the first authored trace and report the generated evidence for seed `20260902`.

## Daily Trace proof boundary

Every echo begins at the same start, ignores collisions, and waits after its stored route ends. The generator uses those rules to find one shortest route to each sigil and one to the exit, then composes and replays them through the game engine. This proves the displayed challenge has at least one winning solution. It does not prove the solution is unique or the most elegant.

The 0 to 100 difficulty score combines wall density, route detour, turn-limit pressure, and echo count. It estimates route complexity only. It is not calibrated to player skill or completion time.

## Rules

1. Each movement or wait consumes one turn.
2. `Commit echo` stores the current route and resets the shared clock.
3. Every echo starts with you, repeats its stored route, and waits at its last tile.
4. Only committed echoes can energize violet sigils.
5. Reach the gold gate while all sigils are energized.
6. A trace has a fixed turn limit and a fixed number of echo slots.

Echoes are phase-like and may overlap each other or the player. Walls still block every route. This keeps the puzzle focused on timing and path design rather than collision ordering.

## Project structure

- `src/game.js`: pure state transitions, replay, validation, and win logic.
- `src/generator.js`: seeded generation, shortest-route certificates, engine replay, and difficulty evidence.
- `src/levels.js`: four authored puzzle definitions and par values.
- `src/app.js`: Canvas rendering, input, audio, progression, and responsive behavior.
- `tests/game.test.js`: engine and complete-solution verification.
- `scripts/demo.mjs`: deterministic evidence run.
- `docs/`: design, decisions, verification, limitations, and non-use cards.

## Current limitations

- Generated puzzles are deterministic daily challenges, not an arbitrary seed browser or level editor.
- A generated solution is certified as winning but is not guaranteed to be unique.
- The difficulty estimate is transparent but has not been calibrated with player data.
- Progress records only the latest unlocked trace. It does not preserve best scores or route replays.
- The board is Canvas-based. Controls and status have accessible labels, but there is no complete text-grid alternative for screen-reader play.
- Synthesized audio is intentionally minimal and may remain unavailable until the browser accepts a user gesture.
- Browser checks cover the local Chromium environment and responsive viewports, not every browser or physical touch device.

## Best next improvement

Add an optional solver hint that reveals one route at a time, then test whether the route-complexity estimate tracks completion effort in an opt-in, local-only playtest dataset.

## Documentation

- [Design specification](docs/superpowers/specs/2026-08-31-afterstep.md)
- [Mechanic decision](docs/decisions/0001-shared-clock-echoes.md)
- [Daily generation decision](docs/decisions/0002-proof-carrying-daily-generation.md)
- [Version 1.0 verification](docs/experiments/2026-08-31-verification.md)
- [Version 1.1 verification](docs/experiments/2026-09-02-daily-trace-verification.md)
- [Version 1.1 working notes](docs/notes/2026-09-02.md)
- [Dataset non-use card](docs/datasets/no-external-dataset.md)
- [Model non-use card](docs/models/no-model.md)

## License

MIT. See [LICENSE](LICENSE).
