import test from "node:test";
import assert from "node:assert/strict";
import {
  advance,
  commitLoop,
  createGame,
  energizedSigils,
  move,
  replayPosition,
  retryLoop,
  undo,
  validateLevel
} from "../src/game.js";
import { LEVELS } from "../src/levels.js";

function applyMoves(state, moves) {
  return moves.reduce((current, step) => move(current, step), state);
}

function solve(level, echoRoutes, finalRoute) {
  let state = createGame(level);
  for (const route of echoRoutes) state = commitLoop(applyMoves(state, route));
  return applyMoves(state, finalRoute);
}

test("all bundled levels pass structural validation", () => {
  for (const level of LEVELS) assert.deepEqual(validateLevel(level), [], level.id);
});

test("movement respects walls and board bounds", () => {
  const level = LEVELS[0];
  assert.deepEqual(advance(level, { x: 0, y: 1 }, "left"), { x: 0, y: 1 });
  assert.deepEqual(advance(level, { x: 0, y: 1 }, "up"), { x: 0, y: 1 });
  assert.deepEqual(advance(level, { x: 2, y: 2 }, "right"), { x: 3, y: 2 });
});

test("wait consumes a turn without changing position", () => {
  const state = move(createGame(LEVELS[0]), "wait");
  assert.deepEqual(state.player, LEVELS[0].start);
  assert.equal(state.turn, 1);
  assert.deepEqual(state.currentMoves, ["wait"]);
});

test("committing creates an immutable echo and resets the shared clock", () => {
  const traveled = applyMoves(createGame(LEVELS[0]), ["up", "right"]);
  const committed = commitLoop(traveled);
  assert.equal(committed.echoes.length, 1);
  assert.deepEqual(committed.echoes[0].moves, ["up", "right"]);
  assert.deepEqual(committed.player, LEVELS[0].start);
  assert.equal(committed.turn, 0);
  assert.deepEqual(committed.currentMoves, []);
});

test("echo replay uses the current loop turn and then holds its last cell", () => {
  const level = LEVELS[0];
  const route = ["up", "right", "right"];
  assert.deepEqual(replayPosition(level, route, 1), { x: 1, y: 1 });
  assert.deepEqual(replayPosition(level, route, 3), { x: 3, y: 1 });
  assert.deepEqual(replayPosition(level, route, 8), { x: 3, y: 1 });
});

test("undo removes only the current trace and recomputes position", () => {
  const original = applyMoves(createGame(LEVELS[0]), ["right", "right", "down"]);
  const changed = undo(original);
  assert.equal(changed.turn, 2);
  assert.deepEqual(changed.player, { x: 3, y: 2 });
  assert.deepEqual(changed.currentMoves, ["right", "right"]);
});

test("retry preserves committed echoes but clears the current trace", () => {
  let state = createGame(LEVELS[0]);
  state = commitLoop(applyMoves(state, ["up", "right", "right"]));
  state = applyMoves(state, ["right", "right"]);
  state = retryLoop(state);
  assert.equal(state.echoes.length, 1);
  assert.equal(state.turn, 0);
  assert.deepEqual(state.player, LEVELS[0].start);
});

test("a sigil is energized only by a committed echo", () => {
  let state = applyMoves(createGame(LEVELS[0]), ["up", "right", "right"]);
  assert.deepEqual(energizedSigils(state), [false]);
  state = commitLoop(state);
  state = applyMoves(state, ["wait", "wait", "wait"]);
  assert.deepEqual(energizedSigils(state), [true]);
});

test("turn limits stop additional moves", () => {
  const level = { ...LEVELS[0], turnLimit: 2 };
  const state = applyMoves(createGame(level), ["right", "right", "right"]);
  assert.equal(state.turn, 2);
  assert.deepEqual(state.currentMoves, ["right", "right"]);
});

const solutions = [
  {
    echoes: [["up", "right", "right"]],
    final: ["right", "right", "right", "right"]
  },
  {
    echoes: [["up", "up", "right"], ["down", "right", "right", "right"]],
    final: ["down", "right", "right", "right", "right", "right", "up"]
  },
  {
    echoes: [["up", "up", "up", "up"], ["right", "right", "right", "right", "right"]],
    final: ["right", "right", "right", "right", "right", "right", "up", "up", "up", "up"]
  },
  {
    echoes: [
      ["up", "up", "right"],
      ["right", "right", "right", "right", "down", "down"],
      ["right", "right", "right", "right", "up", "up", "right", "right"]
    ],
    final: ["right", "right", "right", "right", "up", "up", "right", "right", "right", "down", "down"]
  }
];

test("every authored puzzle has a verified winning route", () => {
  LEVELS.forEach((level, index) => {
    const result = solve(level, solutions[index].echoes, solutions[index].final);
    assert.equal(result.won, true, level.id);
    assert.deepEqual(energizedSigils(result), level.sigils.map(() => true), level.id);
  });
});

test("winning states are terminal", () => {
  const result = solve(LEVELS[0], solutions[0].echoes, solutions[0].final);
  assert.equal(move(result, "left"), result);
  assert.equal(commitLoop(result), result);
  assert.equal(undo(result), result);
});
