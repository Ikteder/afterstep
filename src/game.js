export const MOVES = Object.freeze({
  up: Object.freeze({ x: 0, y: -1 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
  right: Object.freeze({ x: 1, y: 0 }),
  wait: Object.freeze({ x: 0, y: 0 })
});

const keyOf = ({ x, y }) => `${x},${y}`;
const sameCell = (a, b) => a.x === b.x && a.y === b.y;
const clonePoint = ({ x, y }) => ({ x, y });

export function validateLevel(level) {
  const errors = [];
  if (!level || typeof level !== "object") return ["level must be an object"];
  if (!Number.isInteger(level.width) || level.width < 4) errors.push("width must be an integer of at least 4");
  if (!Number.isInteger(level.height) || level.height < 4) errors.push("height must be an integer of at least 4");
  if (!Number.isInteger(level.turnLimit) || level.turnLimit < 1) errors.push("turnLimit must be positive");
  if (!Number.isInteger(level.maxEchoes) || level.maxEchoes < 1) errors.push("maxEchoes must be positive");
  if (!Array.isArray(level.sigils) || level.sigils.length < 1) errors.push("at least one sigil is required");

  const inside = (point) => point && Number.isInteger(point.x) && Number.isInteger(point.y)
    && point.x >= 0 && point.y >= 0 && point.x < level.width && point.y < level.height;
  for (const [label, point] of [["start", level.start], ["exit", level.exit]]) {
    if (!inside(point)) errors.push(`${label} must be inside the board`);
  }
  for (const point of level.walls ?? []) if (!inside(point)) errors.push("every wall must be inside the board");
  for (const point of level.sigils ?? []) if (!inside(point)) errors.push("every sigil must be inside the board");

  const walls = new Set((level.walls ?? []).map(keyOf));
  if (level.start && walls.has(keyOf(level.start))) errors.push("start cannot be a wall");
  if (level.exit && walls.has(keyOf(level.exit))) errors.push("exit cannot be a wall");
  for (const sigil of level.sigils ?? []) if (walls.has(keyOf(sigil))) errors.push("sigils cannot be walls");
  if ((level.sigils ?? []).length > level.maxEchoes) errors.push("maxEchoes must cover every sigil");
  return errors;
}

export function createGame(level) {
  const errors = validateLevel(level);
  if (errors.length) throw new Error(`Invalid level: ${errors.join("; ")}`);
  return {
    level,
    player: clonePoint(level.start),
    currentMoves: [],
    echoes: [],
    turn: 0,
    won: false,
    bumps: 0
  };
}

export function isWalkable(level, position) {
  if (position.x < 0 || position.y < 0 || position.x >= level.width || position.y >= level.height) return false;
  return !(level.walls ?? []).some((wall) => sameCell(wall, position));
}

export function advance(level, position, moveName) {
  const vector = MOVES[moveName];
  if (!vector) throw new Error(`Unknown move: ${moveName}`);
  const candidate = { x: position.x + vector.x, y: position.y + vector.y };
  return isWalkable(level, candidate) ? candidate : clonePoint(position);
}

export function replayPosition(level, moves, turn = moves.length) {
  let position = clonePoint(level.start);
  for (let index = 0; index < Math.min(turn, moves.length); index += 1) {
    position = advance(level, position, moves[index]);
  }
  return position;
}

export function echoPositions(state, turn = state.turn) {
  return state.echoes.map((echo) => replayPosition(state.level, echo.moves, turn));
}

export function energizedSigils(state) {
  const occupied = new Set(echoPositions(state).map(keyOf));
  return state.level.sigils.map((sigil) => occupied.has(keyOf(sigil)));
}

export function checkWin(state) {
  return sameCell(state.player, state.level.exit) && energizedSigils(state).every(Boolean);
}

export function move(state, moveName) {
  if (state.won || state.turn >= state.level.turnLimit) return state;
  const nextPlayer = advance(state.level, state.player, moveName);
  const bumped = moveName !== "wait" && sameCell(nextPlayer, state.player);
  const next = {
    ...state,
    player: nextPlayer,
    currentMoves: [...state.currentMoves, moveName],
    turn: state.turn + 1,
    bumps: state.bumps + (bumped ? 1 : 0)
  };
  next.won = checkWin(next);
  return next;
}

export function undo(state) {
  if (state.won || state.currentMoves.length === 0) return state;
  const moves = state.currentMoves.slice(0, -1);
  return {
    ...state,
    player: replayPosition(state.level, moves),
    currentMoves: moves,
    turn: moves.length,
    bumps: 0
  };
}

export function commitLoop(state) {
  if (state.won || state.currentMoves.length === 0 || state.echoes.length >= state.level.maxEchoes) return state;
  return {
    ...state,
    player: clonePoint(state.level.start),
    currentMoves: [],
    echoes: [...state.echoes, { moves: [...state.currentMoves] }],
    turn: 0,
    bumps: 0
  };
}

export function retryLoop(state) {
  if (state.won) return state;
  return {
    ...state,
    player: clonePoint(state.level.start),
    currentMoves: [],
    turn: 0,
    bumps: 0
  };
}

export function describeState(state) {
  const powered = energizedSigils(state).filter(Boolean).length;
  return {
    turn: state.turn,
    turnLimit: state.level.turnLimit,
    echoes: state.echoes.length,
    maxEchoes: state.level.maxEchoes,
    powered,
    sigils: state.level.sigils.length,
    won: state.won
  };
}
