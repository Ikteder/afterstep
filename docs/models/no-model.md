# Model card: no learned model

Date: 2026-08-31

Afterstep uses no machine learning or statistical model. Movement, echo replay, sigil activation, and win detection are explicit deterministic rules in `src/game.js`.

The project intentionally keeps AI out of the central mechanic. This makes every outcome inspectable and allows complete regression tests for the bundled solutions. Future procedural generation should use a deterministic search solver before any learned difficulty estimate is considered.
