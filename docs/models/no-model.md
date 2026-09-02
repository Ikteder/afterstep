# Model card: no learned model

Date: 2026-08-31; updated 2026-09-02

Afterstep uses no machine learning or statistical model. Movement, echo replay, sigil activation, and win detection are explicit deterministic rules in `src/game.js`.

The project intentionally keeps AI out of the central mechanic. This makes every outcome inspectable and allows complete regression tests for the bundled solutions.

Version 1.1 implements procedural generation with deterministic pseudorandom sampling, breadth-first search, production-engine certificate replay, and a fixed arithmetic difficulty heuristic. None of these is a learned model. The heuristic has not been fitted to player data and must not be interpreted as a behavioral prediction.
