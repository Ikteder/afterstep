# Afterstep design specification

Date: 2026-08-31  
Status: Approved for the seeded automation run before implementation  
Selection: Seed `20260831`, new-project mode, games lane

## Product goal

Create a complete small puzzle game that demonstrates an original temporal coordination mechanic without external assets, an engine download, or network services.

## Player promise

The player can record a route, see it replay as a translucent echo, and use several prior routes as stable collaborators. The board must make cause and effect legible enough that failure feels explainable.

## Core loop

1. Move on an orthogonal tile board or wait.
2. Undo mistakes within the current trace.
3. Commit the route as an echo and reset the shared turn clock.
4. Watch every echo replay while planning the current route.
5. Hold every sigil with committed echoes and reach the exit.

## Scope

- Four authored levels with increasing echo count and spatial constraints.
- One pure JavaScript rules engine.
- Responsive Canvas presentation with keyboard and pointer controls.
- Status text, turn limits, echo limits, restart, current-loop retry, undo, and level progression.
- Deterministic tests, including a known complete solution for every level.
- No backend, account, telemetry, downloadable media, or generated art dependency.

## Non-goals

- Procedural generation, online leaderboards, user accounts, monetization, real-time multiplayer, narrative cutscenes, or downloadable level packs.
- Physics simulation or reflex-heavy action.
- Claims of formal accessibility conformance.

## Acceptance criteria

- Every bundled level passes schema validation and a verified solution route.
- Illegal wall and boundary moves remain deterministic.
- Echoes replay from the shared clock and hold their final cells.
- The game can be completed using keyboard and on-screen controls.
- Wide and narrow layouts remain usable without page-level horizontal overflow.
- Documentation records actual verification and known accessibility boundaries.
