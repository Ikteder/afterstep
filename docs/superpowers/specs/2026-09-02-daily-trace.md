# Afterstep 1.1 Daily Trace Improvement Specification

Date: 2026-09-02
Status: Approved for implementation in the designated automation run

## Goal

Add a deterministic generated puzzle that gives returning players a new trace while preserving the small, inspectable, dependency-free game. Every presented generated trace must ship with a machine-checked winning certificate and a transparent difficulty estimate.

## User experience

- Add a `Daily trace` control alongside the existing sound control.
- Derive the challenge seed from the player's local date in `YYYYMMDD` form.
- Present the generated challenge in the existing board and controls, with a visible seed, difficulty label, score, and shortest-route evidence.
- Let `Restart trace` recreate the same challenge for that date.
- After a daily win, keep the player on the daily challenge rather than altering authored-level progress.
- Let the same control return to the previously selected authored trace.

## Generation and proof design

1. Use a small documented integer pseudorandom generator, seeded from `YYYYMMDD`.
2. Generate bounded rectangular boards with deterministic wall placement.
3. Flood-fill from the start, reject layouts with too little connected space, and select distant reachable cells for the exit and sigils.
4. Use breadth-first search to construct a shortest route from the shared start to every sigil and the exit.
5. Treat the sigil routes as committed echoes and the exit route as the final loop.
6. Replay that certificate through the production state engine. Present the level only when the resulting state wins within the declared turn and echo limits.
7. Keep a deterministic open-board fallback so every finite integer seed produces a valid challenge even if candidate generation exhausts its bounded attempts.

The proof is specific to Afterstep's phase-like echo rule: echoes do not collide, each begins at the shared start, and a completed route waits on its final cell. Independent reachability certificates are therefore sufficient, and production-engine replay checks the full composition.

## Difficulty estimate

Report a 0 to 100 heuristic using only generated-board evidence:

- wall density;
- shortest-path detour over Manhattan distance;
- route length relative to the turn limit;
- the number of required echo routes.

Map the score to `Calm`, `Measured`, or `Knotted`. State clearly that this estimates route complexity, not player skill or completion time.

## Code changes

- Add `src/generator.js` for seeding, board generation, BFS certificates, engine replay, and difficulty evidence.
- Update `src/app.js` to load and describe the daily challenge.
- Update `index.html` and `styles.css` for the daily control and evidence panel.
- Add generator and solver tests, including a multi-seed property sweep and certificate replay.
- Add a deterministic command-line evidence script and run it in CI.
- Update project documentation and package metadata.

## Verification plan

- Existing engine and authored-solution tests remain green.
- Validate deterministic equality for repeated seeds and variation across different seeds.
- Sweep at least 1,000 consecutive date-like integer seeds; every generated level must validate and every certificate must replay to a win.
- Assert route lengths, echo count, and difficulty bounds.
- Run syntax checks and the deterministic demo.
- Exercise authored-to-daily switching, restart stability, a daily win, and responsive layout in a browser.
- Enforce the README no-em-dash rule.

## Non-goals

- No claim that the heuristic predicts subjective difficulty.
- No globally shared daily leaderboard, network access, account, telemetry, or remote seed service.
- No arbitrary user-authored level editor.
- No guarantee that a generated solution is unique.
