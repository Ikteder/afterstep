import test from "node:test";
import assert from "node:assert/strict";
import { dateSeed, generateDailyLevel, replayCertificate, shortestRoute, solveLevel } from "../src/generator.js";
import { validateLevel } from "../src/game.js";

test("local dates become YYYYMMDD integer seeds", () => {
  assert.equal(dateSeed(new Date(2026, 8, 2, 23, 59)), 20260902);
  assert.equal(dateSeed(new Date(2031, 0, 5, 0, 1)), 20310105);
});

test("shortest-route search avoids walls and returns null when sealed", () => {
  const level = {
    width: 4,
    height: 4,
    turnLimit: 8,
    maxEchoes: 1,
    start: { x: 0, y: 0 },
    exit: { x: 3, y: 3 },
    sigils: [{ x: 2, y: 0 }],
    walls: [{ x: 1, y: 0 }]
  };
  assert.deepEqual(shortestRoute(level, level.sigils[0]), ["down", "right", "right", "up"]);
  const sealed = { ...level, walls: [{ x: 1, y: 0 }, { x: 0, y: 1 }] };
  assert.equal(shortestRoute(sealed, sealed.exit), null);
  assert.equal(solveLevel(sealed), null);
});

test("the same seed reproduces the same board, certificate, and estimate", () => {
  const first = generateDailyLevel(20260902);
  const second = generateDailyLevel(20260902);
  assert.deepEqual(first, second);
  assert.notDeepEqual(first.level.walls, generateDailyLevel(20260903).level.walls);
});

test("the designated-run daily certificate wins through the production engine", () => {
  const challenge = generateDailyLevel(20260902);
  assert.deepEqual(validateLevel(challenge.level), []);
  const finalState = replayCertificate(challenge.level, challenge.solution);
  assert.equal(finalState.won, true);
  assert.equal(finalState.echoes.length, challenge.level.sigils.length);
  assert.ok(challenge.solution.difficulty.score >= 0 && challenge.solution.difficulty.score <= 100);
  assert.ok(["Calm", "Measured", "Knotted"].includes(challenge.solution.difficulty.label));
});

test("1,000 consecutive date-like seeds all produce validated winning traces", () => {
  let fallbacks = 0;
  const labels = new Set();
  for (let seed = 20260000; seed < 20261000; seed += 1) {
    const challenge = generateDailyLevel(seed);
    assert.deepEqual(validateLevel(challenge.level), [], String(seed));
    assert.equal(replayCertificate(challenge.level, challenge.solution).won, true, String(seed));
    assert.ok(challenge.solution.difficulty.routeLengths.every((length) => length <= challenge.level.turnLimit), String(seed));
    assert.equal(challenge.solution.echoRoutes.length, challenge.level.sigils.length, String(seed));
    assert.equal(challenge.level.generated.seed, seed, String(seed));
    if (challenge.level.generated.fallback) fallbacks += 1;
    labels.add(challenge.solution.difficulty.label);
  }
  assert.ok(fallbacks < 20, `too many fallbacks: ${fallbacks}`);
  assert.ok(labels.size >= 2, `expected difficulty variety, saw ${[...labels].join(", ")}`);
});
