import { commitLoop, createGame, describeState, move } from "../src/game.js";
import { LEVELS } from "../src/levels.js";

const apply = (state, route) => route.reduce((current, step) => move(current, step), state);
let game = createGame(LEVELS[0]);
game = commitLoop(apply(game, ["up", "right", "right"]));
game = apply(game, ["right", "right", "right", "right"]);

console.log(JSON.stringify({
  seed: 20260831,
  level: game.level.id,
  result: describeState(game),
  finalPosition: game.player,
  committedRoute: game.echoes[0].moves
}, null, 2));
