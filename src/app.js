import {
  commitLoop,
  createGame,
  describeState,
  echoPositions,
  energizedSigils,
  move,
  replayPosition,
  retryLoop,
  undo
} from "./game.js";
import { LEVELS } from "./levels.js";

const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const elements = {
  title: document.querySelector("#levelTitle"),
  eyebrow: document.querySelector("#levelEyebrow"),
  lesson: document.querySelector("#lesson"),
  turn: document.querySelector("#turnStat"),
  echoes: document.querySelector("#echoStat"),
  sigils: document.querySelector("#sigilStat"),
  commit: document.querySelector("#commitButton"),
  undo: document.querySelector("#undoButton"),
  retry: document.querySelector("#retryButton"),
  restart: document.querySelector("#restartButton"),
  next: document.querySelector("#nextButton"),
  winPanel: document.querySelector("#winPanel"),
  winSummary: document.querySelector("#winSummary"),
  toast: document.querySelector("#toast"),
  sound: document.querySelector("#soundButton")
};

let levelIndex = Math.min(Number.parseInt(localStorage.getItem("afterstep-level") ?? "0", 10) || 0, LEVELS.length - 1);
let state = createGame(LEVELS[levelIndex]);
let soundEnabled = true;
let toastTimer;

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function boardLayout() {
  const level = state.level;
  const padding = Math.max(28, Math.min(canvas.width, canvas.height) * 0.07);
  const cell = Math.min((canvas.width - padding * 2) / level.width, (canvas.height - padding * 2) / level.height);
  return {
    cell,
    x: (canvas.width - level.width * cell) / 2,
    y: (canvas.height - level.height * cell) / 2
  };
}

function centerOf(point, layout) {
  return {
    x: layout.x + (point.x + 0.5) * layout.cell,
    y: layout.y + (point.y + 0.5) * layout.cell
  };
}

function drawTrail(moves, turn, color, layout, width = 5) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = Math.max(3, layout.cell * 0.07);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.globalAlpha = 0.42;
  context.beginPath();
  let position = state.level.start;
  let point = centerOf(position, layout);
  context.moveTo(point.x, point.y);
  for (let index = 0; index < Math.min(turn, moves.length); index += 1) {
    position = replayPosition(state.level, moves, index + 1);
    point = centerOf(position, layout);
    context.lineTo(point.x, point.y);
  }
  context.stroke();
  context.restore();
}

function drawEntity(position, color, layout, isPlayer = false, index = 0) {
  const point = centerOf(position, layout);
  const radius = layout.cell * (isPlayer ? 0.25 : 0.21);
  context.save();
  context.shadowColor = color;
  context.shadowBlur = isPlayer ? 24 : 15;
  context.fillStyle = color;
  context.beginPath();
  context.arc(point.x, point.y, radius, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = isPlayer ? "#07101d" : "rgba(7,16,29,.78)";
  context.font = `800 ${Math.max(10, layout.cell * 0.17)}px system-ui`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(isPlayer ? "+" : String(index + 1), point.x, point.y + 0.5);
  context.restore();
}

function renderBoard() {
  if (canvas.width < 100 || canvas.height < 100) return;
  const layout = boardLayout();
  const level = state.level;
  context.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = context.createRadialGradient(canvas.width * 0.5, canvas.height * 0.46, 10, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.64);
  gradient.addColorStop(0, "#12263a");
  gradient.addColorStop(1, "#07111f");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < level.height; y += 1) {
    for (let x = 0; x < level.width; x += 1) {
      const inset = layout.cell * 0.08;
      roundedRect(context, layout.x + x * layout.cell + inset, layout.y + y * layout.cell + inset, layout.cell - inset * 2, layout.cell - inset * 2, layout.cell * 0.14);
      context.fillStyle = (x + y) % 2 ? "rgba(136,180,210,.045)" : "rgba(136,180,210,.025)";
      context.fill();
    }
  }

  for (const wall of level.walls) {
    const inset = layout.cell * 0.11;
    roundedRect(context, layout.x + wall.x * layout.cell + inset, layout.y + wall.y * layout.cell + inset, layout.cell - inset * 2, layout.cell - inset * 2, layout.cell * 0.16);
    context.fillStyle = "#1a2b3e";
    context.fill();
    context.strokeStyle = "rgba(167,201,225,.13)";
    context.lineWidth = 2;
    context.stroke();
  }

  const powered = energizedSigils(state);
  level.sigils.forEach((sigil, index) => {
    const point = centerOf(sigil, layout);
    context.save();
    context.strokeStyle = powered[index] ? "#dcceff" : "#8d73ec";
    context.fillStyle = powered[index] ? "rgba(165,139,255,.38)" : "rgba(165,139,255,.08)";
    context.lineWidth = Math.max(2, layout.cell * 0.055);
    context.shadowColor = "#a58bff";
    context.shadowBlur = powered[index] ? 24 : 6;
    context.beginPath();
    context.arc(point.x, point.y, layout.cell * 0.3, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.beginPath();
    context.arc(point.x, point.y, layout.cell * 0.12, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  });

  const exit = centerOf(level.exit, layout);
  context.save();
  context.translate(exit.x, exit.y);
  context.rotate(Math.PI / 4);
  context.fillStyle = state.won ? "#fff1b8" : "rgba(255,209,102,.14)";
  context.strokeStyle = "#ffd166";
  context.lineWidth = Math.max(2, layout.cell * 0.055);
  context.shadowColor = "#ffd166";
  context.shadowBlur = state.won ? 30 : 10;
  context.fillRect(-layout.cell * 0.23, -layout.cell * 0.23, layout.cell * 0.46, layout.cell * 0.46);
  context.strokeRect(-layout.cell * 0.23, -layout.cell * 0.23, layout.cell * 0.46, layout.cell * 0.46);
  context.restore();

  const palette = ["#a58bff", "#ff8bc4", "#83a8ff"];
  state.echoes.forEach((echo, index) => drawTrail(echo.moves, state.turn, palette[index % palette.length], layout));
  drawTrail(state.currentMoves, state.turn, "#72e2ff", layout, 6);
  echoPositions(state).forEach((position, index) => drawEntity(position, palette[index % palette.length], layout, false, index));
  drawEntity(state.player, "#72e2ff", layout, true);

  const start = centerOf(level.start, layout);
  context.save();
  context.strokeStyle = "rgba(114,226,255,.35)";
  context.setLineDash([4, 6]);
  context.lineWidth = 2;
  context.beginPath();
  context.arc(start.x, start.y, layout.cell * 0.34, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function updateUi() {
  const summary = describeState(state);
  elements.title.textContent = state.level.name;
  elements.eyebrow.textContent = `Trace ${String(state.level.number).padStart(2, "0")} / ${String(LEVELS.length).padStart(2, "0")}`;
  elements.lesson.textContent = state.level.lesson;
  elements.turn.textContent = `${summary.turn} / ${summary.turnLimit}`;
  elements.echoes.textContent = `${summary.echoes} / ${summary.maxEchoes}`;
  elements.sigils.textContent = `${summary.powered} / ${summary.sigils}`;
  elements.commit.disabled = state.won || state.currentMoves.length === 0 || state.echoes.length >= state.level.maxEchoes;
  elements.undo.disabled = state.won || state.currentMoves.length === 0;
  elements.retry.disabled = state.won || state.currentMoves.length === 0;
  elements.winPanel.hidden = !state.won;
  if (state.won) {
    elements.winSummary.textContent = `${state.echoes.length} echoes and ${state.turn} turns on the final loop. Par is ${state.level.par.echoes} echoes and ${state.level.par.turns} turns.`;
    elements.next.textContent = levelIndex === LEVELS.length - 1 ? "Play from the beginning" : "Next trace";
  }
  renderBoard();
}

function tone(frequency, duration = 0.07) {
  if (!soundEnabled) return;
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextClass) return;
  const audio = tone.context ??= new AudioContextClass();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  gain.gain.setValueAtTime(0.045, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 1500);
}

function doMove(name) {
  if (state.won) return;
  if (state.turn >= state.level.turnLimit) {
    showToast("This trace is out of turns. Commit it or retry.");
    tone(130);
    return;
  }
  const previous = state;
  state = move(state, name);
  tone(state.bumps > previous.bumps ? 145 : 260 + state.turn * 8);
  if (state.won) {
    tone(520, 0.18);
    localStorage.setItem("afterstep-level", String(Math.min(levelIndex + 1, LEVELS.length - 1)));
  }
  updateUi();
}

function doCommit() {
  const next = commitLoop(state);
  if (next === state) {
    showToast(state.echoes.length >= state.level.maxEchoes ? "No echo slots remain." : "Move before committing a trace.");
    return;
  }
  state = next;
  tone(410, 0.14);
  updateUi();
}

function loadLevel(index) {
  levelIndex = (index + LEVELS.length) % LEVELS.length;
  state = createGame(LEVELS[levelIndex]);
  localStorage.setItem("afterstep-level", String(levelIndex));
  updateUi();
}

document.querySelectorAll("[data-move]").forEach((button) => {
  button.addEventListener("click", () => doMove(button.dataset.move));
});
elements.commit.addEventListener("click", doCommit);
elements.undo.addEventListener("click", () => { state = undo(state); tone(190); updateUi(); });
elements.retry.addEventListener("click", () => { state = retryLoop(state); tone(180); updateUi(); });
elements.restart.addEventListener("click", () => loadLevel(levelIndex));
elements.next.addEventListener("click", () => loadLevel(levelIndex === LEVELS.length - 1 ? 0 : levelIndex + 1));
elements.sound.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  elements.sound.textContent = soundEnabled ? "Sound on" : "Sound off";
  elements.sound.setAttribute("aria-pressed", String(soundEnabled));
  if (soundEnabled) tone(330);
});

window.addEventListener("keydown", (event) => {
  const moveKeys = {
    ArrowUp: "up", w: "up", W: "up",
    ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left",
    ArrowRight: "right", d: "right", D: "right",
    " ": "wait"
  };
  if (moveKeys[event.key]) {
    event.preventDefault();
    doMove(moveKeys[event.key]);
  } else if (event.key === "Enter") {
    event.preventDefault();
    doCommit();
  } else if (event.key === "z" || event.key === "Z") {
    state = undo(state);
    updateUi();
  } else if (event.key === "r" || event.key === "R") {
    state = retryLoop(state);
    updateUi();
  }
});

function resizeCanvas() {
  const rectangle = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.round(rectangle.width * ratio);
  const height = Math.round(rectangle.height * ratio);
  if (width < 100 || height < 100) return;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  renderBoard();
}

new ResizeObserver(resizeCanvas).observe(canvas);
updateUi();
