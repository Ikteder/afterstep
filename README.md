# Afterstep

[![CI](https://github.com/Ikteder/afterstep/actions/workflows/ci.yml/badge.svg)](https://github.com/Ikteder/afterstep/actions/workflows/ci.yml)

Afterstep is a compact, browser-native time-loop puzzle game. Move through a trace, commit the route, and that route returns as an echo on the next loop. Park one echo on every violet sigil while the bright traveler reaches the gold gate.

The game has no runtime dependencies, accounts, analytics, network calls, or external assets. It runs from a tiny local static server and works with keyboard or on-screen controls.

## Why this game exists

Time-loop games often rely on reflexes or a long narrative. Afterstep compresses the idea into a readable planning puzzle: every prior route replays on one shared turn clock, finishes its instructions, and then waits on its final tile. The player decides which routes deserve to become permanent collaborators.

## Features

- Four authored puzzles that introduce route commitment, multiple echoes, wall-aware planning, undo, and shared-clock timing.
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

The test suite checks level structure, legal movement, walls, waiting, echo commitment, replay timing, undo, retry, sigil rules, turn limits, terminal wins, and a complete winning route for all four puzzles. The deterministic demo uses seed `20260831` as run provenance and solves the first trace with one echo in four turns on the final loop.

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
- `src/levels.js`: four authored puzzle definitions and par values.
- `src/app.js`: Canvas rendering, input, audio, progression, and responsive behavior.
- `tests/game.test.js`: engine and complete-solution verification.
- `scripts/demo.mjs`: deterministic evidence run.
- `docs/`: design, decisions, verification, limitations, and non-use cards.

## Current limitations

- The release contains four authored puzzles, not a procedural level generator or level editor.
- Progress records only the latest unlocked trace. It does not preserve best scores or route replays.
- The board is Canvas-based. Controls and status have accessible labels, but there is no complete text-grid alternative for screen-reader play.
- Synthesized audio is intentionally minimal and may remain unavailable until the browser accepts a user gesture.
- Browser checks cover the local Chromium environment and responsive viewports, not every browser or physical touch device.

## Best next improvement

Add a deterministic puzzle generator with a solver that proves every generated trace is winnable and estimates solution difficulty before presenting it to the player.

## Documentation

- [Design specification](docs/superpowers/specs/2026-08-31-afterstep.md)
- [Mechanic decision](docs/decisions/0001-shared-clock-echoes.md)
- [Verification record](docs/experiments/2026-08-31-verification.md)
- [Working notes](docs/notes/2026-08-31.md)
- [Dataset non-use card](docs/datasets/no-external-dataset.md)
- [Model non-use card](docs/models/no-model.md)

## License

MIT. See [LICENSE](LICENSE).
