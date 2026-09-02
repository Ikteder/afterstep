import { commitLoop, createGame, move, validateLevel } from "./game.js";

const MOVE_ORDER = Object.freeze([
  Object.freeze({ name: "up", x: 0, y: -1 }),
  Object.freeze({ name: "right", x: 1, y: 0 }),
  Object.freeze({ name: "down", x: 0, y: 1 }),
  Object.freeze({ name: "left", x: -1, y: 0 })
]);

const keyOf = ({ x, y }) => `${x},${y}`;
const pointFromKey = (key) => {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
};
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

function integerSeed(seed) {
  const numeric = Number(seed);
  if (!Number.isFinite(numeric)) throw new TypeError("seed must be a finite number");
  return Math.trunc(numeric) >>> 0;
}

function randomSource(seed) {
  let state = integerSeed(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInteger(random, minimum, maximum) {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function shuffled(values, random) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

function wallSet(level) {
  return new Set((level.walls ?? []).map(keyOf));
}

function inside(level, point) {
  return point.x >= 0 && point.y >= 0 && point.x < level.width && point.y < level.height;
}

function neighborSteps(level, point, blocked = wallSet(level)) {
  return MOVE_ORDER
    .map((move) => ({ move: move.name, point: { x: point.x + move.x, y: point.y + move.y } }))
    .filter(({ point: candidate }) => inside(level, candidate) && !blocked.has(keyOf(candidate)));
}

export function dateSeed(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return Number(`${year}${month}${day}`);
}

export function shortestRoute(level, target) {
  const blocked = wallSet(level);
  const startKey = keyOf(level.start);
  const targetKey = keyOf(target);
  const queue = [level.start];
  const previous = new Map([[startKey, null]]);
  let cursor = 0;

  while (cursor < queue.length && !previous.has(targetKey)) {
    const point = queue[cursor];
    cursor += 1;
    for (const step of neighborSteps(level, point, blocked)) {
      const nextKey = keyOf(step.point);
      if (previous.has(nextKey)) continue;
      previous.set(nextKey, { key: keyOf(point), move: step.move });
      queue.push(step.point);
    }
  }

  if (!previous.has(targetKey)) return null;
  const route = [];
  let currentKey = targetKey;
  while (currentKey !== startKey) {
    const step = previous.get(currentKey);
    route.push(step.move);
    currentKey = step.key;
  }
  return route.reverse();
}

function applyMoves(state, moves) {
  return moves.reduce((current, step) => move(current, step), state);
}

export function replayCertificate(level, certificate) {
  let state = createGame(level);
  for (const route of certificate.echoRoutes) {
    state = applyMoves(state, route);
    state = commitLoop(state);
  }
  return applyMoves(state, certificate.finalRoute);
}

function estimateDifficulty(level, routes) {
  const allRoutes = [...routes.echoRoutes, routes.finalRoute];
  const targets = [...level.sigils, level.exit];
  const walkableCells = level.width * level.height - level.walls.length;
  const density = level.walls.length / (level.width * level.height);
  const detours = allRoutes.map((route, index) => {
    const direct = Math.max(1, manhattan(level.start, targets[index]));
    return Math.max(0, route.length - direct) / direct;
  });
  const meanDetour = detours.reduce((sum, value) => sum + value, 0) / detours.length;
  const longestRoute = Math.max(...allRoutes.map((route) => route.length));
  const routePressure = longestRoute / level.turnLimit;
  const echoLoad = level.sigils.length / 3;
  const score = Math.round(100 * (
    0.27 * clamp(density / 0.24, 0, 1)
    + 0.28 * clamp(meanDetour / 0.8, 0, 1)
    + 0.30 * clamp(routePressure, 0, 1)
    + 0.15 * clamp(echoLoad, 0, 1)
  ));
  const label = score < 42 ? "Calm" : score < 68 ? "Measured" : "Knotted";
  return {
    score,
    label,
    wallDensity: Number(density.toFixed(4)),
    meanDetour: Number(meanDetour.toFixed(4)),
    routePressure: Number(routePressure.toFixed(4)),
    walkableCells,
    routeLengths: allRoutes.map((route) => route.length),
    longestRoute
  };
}

export function solveLevel(level) {
  if (validateLevel(level).length) return null;
  const echoRoutes = level.sigils.map((sigil) => shortestRoute(level, sigil));
  const finalRoute = shortestRoute(level, level.exit);
  if (echoRoutes.some((route) => route === null) || finalRoute === null) return null;
  const allRoutes = [...echoRoutes, finalRoute];
  if (allRoutes.some((route) => route.length > level.turnLimit)) return null;

  const certificate = { echoRoutes, finalRoute };
  const finalState = replayCertificate(level, certificate);
  if (!finalState.won) return null;
  return {
    ...certificate,
    finalState,
    difficulty: estimateDifficulty(level, certificate)
  };
}

function reachableCells(level) {
  const blocked = wallSet(level);
  const queue = [level.start];
  const distances = new Map([[keyOf(level.start), 0]]);
  let cursor = 0;
  while (cursor < queue.length) {
    const point = queue[cursor];
    cursor += 1;
    for (const step of neighborSteps(level, point, blocked)) {
      const nextKey = keyOf(step.point);
      if (distances.has(nextKey)) continue;
      distances.set(nextKey, distances.get(keyOf(point)) + 1);
      queue.push(step.point);
    }
  }
  return [...distances].map(([key, distance]) => ({ point: pointFromKey(key), distance }));
}

function selectObjectives(level, count, random) {
  const reachable = reachableCells(level);
  const minimumArea = Math.floor(level.width * level.height * 0.62);
  if (reachable.length < minimumArea) return null;
  const distant = reachable.filter(({ point, distance }) => distance >= 4 && keyOf(point) !== keyOf(level.start));
  if (distant.length < count + 1) return null;

  const ranked = shuffled(distant, random).sort((a, b) => b.distance - a.distance);
  const exitEntry = ranked.find(({ point }) => point.x >= Math.floor(level.width * 0.55)) ?? ranked[0];
  const selected = [exitEntry.point];
  const sigils = [];
  for (const entry of ranked) {
    if (keyOf(entry.point) === keyOf(exitEntry.point)) continue;
    if (selected.every((point) => manhattan(point, entry.point) >= 3)) {
      sigils.push(entry.point);
      selected.push(entry.point);
      if (sigils.length === count) break;
    }
  }
  return sigils.length === count ? { exit: exitEntry.point, sigils } : null;
}

function candidateLevel(seed, attempt, random) {
  const width = randomInteger(random, 8, 10);
  const height = randomInteger(random, 6, 7);
  const start = { x: 1, y: height - 2 };
  const wallProbability = 0.13 + random() * 0.09;
  const walls = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x === start.x && y === start.y) continue;
      if (random() < wallProbability) walls.push({ x, y });
    }
  }
  const base = { width, height, start, walls };
  const sigilCount = random() < 0.36 ? 3 : 2;
  const objectives = selectObjectives(base, sigilCount, random);
  if (!objectives) return null;

  const provisional = {
    id: `daily-${seed}`,
    number: "D",
    name: "Daily Trace",
    lesson: "Generated locally with a solver-verified route certificate.",
    width,
    height,
    turnLimit: width + height,
    maxEchoes: sigilCount,
    start,
    exit: objectives.exit,
    sigils: objectives.sigils,
    walls,
    par: { echoes: sigilCount, turns: 0 },
    generated: { seed, attempt, fallback: false }
  };
  const initialSolution = solveLevel(provisional);
  if (!initialSolution) return null;
  const turnLimit = Math.max(8, initialSolution.difficulty.longestRoute + 2);
  const level = {
    ...provisional,
    turnLimit,
    par: { echoes: sigilCount, turns: initialSolution.finalRoute.length }
  };
  const solution = solveLevel(level);
  return solution ? { level, solution } : null;
}

function fallbackLevel(seed) {
  const mirrored = seed % 2 === 1;
  const level = {
    id: `daily-${seed}`,
    number: "D",
    name: "Daily Trace",
    lesson: "Generated locally with a solver-verified route certificate.",
    width: 8,
    height: 6,
    turnLimit: 10,
    maxEchoes: 2,
    start: { x: mirrored ? 6 : 1, y: 4 },
    exit: { x: mirrored ? 1 : 6, y: 1 },
    sigils: mirrored ? [{ x: 6, y: 1 }, { x: 2, y: 4 }] : [{ x: 1, y: 1 }, { x: 5, y: 4 }],
    walls: [{ x: 0, y: 0 }, { x: 7, y: 0 }, { x: 0, y: 5 }, { x: 7, y: 5 }],
    par: { echoes: 2, turns: 8 },
    generated: { seed, attempt: 64, fallback: true }
  };
  const solution = solveLevel(level);
  if (!solution) throw new Error("internal fallback level failed its certificate");
  level.par.turns = solution.finalRoute.length;
  return { level, solution };
}

export function generateDailyLevel(seed = dateSeed()) {
  const normalizedSeed = integerSeed(seed);
  const random = randomSource(normalizedSeed);
  for (let attempt = 1; attempt <= 64; attempt += 1) {
    const candidate = candidateLevel(normalizedSeed, attempt, random);
    if (!candidate) continue;
    candidate.level.generated.difficulty = candidate.solution.difficulty;
    candidate.level.lesson = `${candidate.solution.difficulty.label} route puzzle, solver verified for seed ${normalizedSeed}.`;
    return candidate;
  }
  const fallback = fallbackLevel(normalizedSeed);
  fallback.level.generated.difficulty = fallback.solution.difficulty;
  fallback.level.lesson = `${fallback.solution.difficulty.label} route puzzle, solver verified for seed ${normalizedSeed}.`;
  return fallback;
}
