# Dataset card: no external dataset

Date: 2026-08-31; updated 2026-09-02

Afterstep uses no training, evaluation, analytics, or content dataset. The four level definitions are original authored coordinate lists stored in `src/levels.js`. Tests use those same level definitions and explicit solution routes.

No player input, route history, personal information, or telemetry leaves the browser. The only persistence is a local integer identifying the latest unlocked trace.

Version 1.1 adds generated wall layouts and solver certificates from integer seeds. These are synthetic game states, not sampled player or world data. The 1,000-seed verification sweep is recorded in `docs/experiments/2026-09-02-daily-trace-verification.md`.

Because there is no sampled player study, the project does not claim that the par values represent population difficulty, that the generated difficulty score predicts completion effort, or that the level sequence has been usability validated.
