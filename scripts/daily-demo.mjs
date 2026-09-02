import assert from "node:assert/strict";
import { generateDailyLevel, replayCertificate } from "../src/generator.js";

const seed = 20260902;
const challenge = generateDailyLevel(seed);
const finalState = replayCertificate(challenge.level, challenge.solution);
assert.equal(finalState.won, true);

console.log(JSON.stringify({
  seed,
  board: `${challenge.level.width}x${challenge.level.height}`,
  attempt: challenge.level.generated.attempt,
  fallback: challenge.level.generated.fallback,
  walls: challenge.level.walls.length,
  sigils: challenge.level.sigils.length,
  turnLimit: challenge.level.turnLimit,
  routeLengths: challenge.solution.difficulty.routeLengths,
  difficulty: {
    label: challenge.solution.difficulty.label,
    score: challenge.solution.difficulty.score,
    wallDensity: challenge.solution.difficulty.wallDensity,
    meanDetour: challenge.solution.difficulty.meanDetour,
    routePressure: challenge.solution.difficulty.routePressure
  },
  certificateWon: finalState.won
}, null, 2));
