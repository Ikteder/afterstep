# Decision 0002: Proof-Carrying Daily Generation

Date: 2026-09-02
Status: Accepted

## Context

Afterstep 1.0 had four fully tested authored puzzles but no repeatable source of new play. A random board generator alone could produce disconnected, impossible, or misleading challenges. An exhaustive solver over every sequence of loops would add substantial complexity despite the game's phase-like echo rule.

## Decision

Generate a bounded wall layout from the player's local `YYYYMMDD` seed, then use breadth-first search to find a shortest path from the shared start to each sigil and the exit. Treat sigil paths as committed echoes and the exit path as the final loop. Accept the level only when replaying that certificate through the production engine reaches a winning state within the level limits.

Use at most 64 deterministic candidate attempts, followed by a deterministic open-board fallback. Estimate difficulty from wall density, shortest-path detour, route pressure, and echo count. Expose the inputs and label the result as a route-complexity heuristic.

## Why this is sufficient

Echoes do not collide. Every echo begins at the same start, follows its stored route on the shared clock, and waits at its final cell. Therefore, one reachable route per sigil plus one reachable route to the exit composes into a win. Production-engine replay protects this reasoning from drifting away from actual game behavior.

## Consequences

- Every displayed daily trace carries executable winning evidence.
- The generator remains dependency-free, fast, and deterministic.
- Shortest routes are proven for individual destinations, not as a unique or globally most elegant multi-loop solution.
- The difficulty score is interpretable but not calibrated against player completion data.
- A fallback is explicit in generated metadata and can be measured in verification.
