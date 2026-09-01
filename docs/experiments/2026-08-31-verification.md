# Verification record: 2026-08-31

## Environment

- Local platform: Windows
- Runtime: Node.js v26.5.0
- External runtime dependencies: none
- Random provenance seed: `20260831`

## Checks

| Check | Result |
|---|---|
| Engine tests | 11/11 passed |
| Bundled level validation | 4/4 valid |
| Known winning routes | 4/4 puzzles solved by tests |
| JavaScript syntax | Passed for engine, levels, app, and server |
| Deterministic demo | First Trace won with 1 echo, 1/1 sigils, and 4/8 final-loop turns |
| Package dry run | 18 intended files, 49,386 unpacked bytes, no bundled dependencies |
| README punctuation rule | 0 em dash matches |
| Wide browser interaction | Route committed and First Trace completed through on-screen controls at 1280 by 900 |
| Narrow browser layout | 390 by 844 viewport; 336 by 405 CSS-pixel Canvas; document scroll width equaled client width at 375 pixels |
| Keyboard interaction | ArrowUp advanced the turn and Z restored it |
| Final browser diagnostics | 0 warnings and 0 errors after wide-to-narrow resize |

## Demo evidence

Command:

```text
npm run demo
```

Expected stable facts:

- seed `20260831`;
- level `first-trace`;
- committed route `up, right, right`;
- final position `(5, 2)`;
- `won: true`;
- one powered sigil and one echo.

## Interpretation

The checks establish deterministic rules behavior and prove that every shipped puzzle has at least one winning route. They do not establish that the par values are optimal, that the puzzles have unique solutions, or that the difficulty progression works equally well for all players.

Browser layout and public CI evidence are added to this record only after those checks run.

## Browser correction

The first responsive pass exposed two `IndexSizeError` console entries while changing viewport size. The Canvas briefly reported a sub-100-pixel dimension, which made a rounded-cell radius negative. Rendering now skips those transient dimensions and clamps the helper radius. A fresh browser tab was moved from 1280 by 900 to 390 by 844 after the correction and reported no warnings or errors.

## Public CI

The first public GitHub Actions run, `33548493648`, passed on Node.js 20, 22, and 24 for commit `45d726146e312cd4f068c427d3b80fc30da4f97d`. Each matrix job ran the engine tests, syntax checks, deterministic demo, and README punctuation rule. The final catalog entry records the documentation commit and its replacement CI run.
