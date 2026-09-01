# Decision 0001: Use shared-clock echoes without collisions

Date: 2026-08-31  
Status: Accepted

## Context

A time-loop puzzle needs enough coordination to be interesting, but exact collision ordering can make a small game opaque. The mechanic also needs deterministic, easily tested behavior.

## Decision

All committed echoes begin at the same start cell and replay one stored instruction per current-loop turn. An echo that exhausts its instructions remains on its final cell. Echoes and the player may overlap, while walls block all routes. Only echoes energize sigils, so the player must still create and coordinate prior traces before exiting.

## Consequences

- Timing is visible and deterministic.
- Short routes naturally become stable switch holders.
- Level solutions can be tested as ordinary state transitions.
- The design avoids ambiguous simultaneous collision rules.
- Some spatial tension is reduced because entities can overlap. Later levels should add interest through topology, turn budgets, and varied interactive cells rather than hidden ordering rules.
