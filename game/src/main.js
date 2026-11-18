// EMBERCLASH — bootstrap: canvas, loop, screen navigation, pause, shot mode.
// One job: wire input + world + render together and run the frame loop.
import { VIEW, STEP } from './config.js';
import { Input } from './input.js';
import { AudioEngine } from './audio.js';
import { Particles } from './particles.js';
import { Projectiles } from './projectiles.js';
import { World } from './world.js';
import { freshState, SCREENS } from './state.js';
import { heroById } from './heroes.js';
import { render } from './render.js';
import { stageShot } from './shots.js';
import { pickRelic } from './upgrades.js';
import { storeSave } from './storage.js';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
canvas.width = VIEW.w; canvas.height = VIEW.h;
const ctx = canvas.getContext('2d');

const state = freshState();
const audio = new AudioEngine();
audio.setMuted(state.save.muted);
const particles = new Particles();
const projectiles = new Projectiles();
const world = new World(state, audio, particles, projectiles);
const input = new Input(canvas);

const params = new URLSearchParams(location.search);
const shotName = params.get('shot');
let buttons = [];
let lastStatus = '';
// Debug/verification hook (read-only state snapshot for automated playtests).
window.__emberclash = { state, world, input };

function setStatus(text) {
  if (text !== lastStatus) { lastStatus = text; statusEl.textContent = text; }
}

function go(screen) {
  state.prevScreen = state.screen === 'options' || state.screen === 'almanac' || state.screen === 'history' || state.screen === 'howto' ? state.prevScreen : state.screen;
  state.screen = screen;
  audio.sfx('click');
}

function handleButtons() {
  for (const b of buttons) {
    if (!input.clickedIn(b.rect)) continue;
    const [kind, arg] = b.id.split(':');
    audio.unlock();
    if (kind === 'hero') { state.heroId = arg; audio.sfx('click'); return; }
    if (kind === 'diff') { state.difficulty = arg; state.save.difficulty = arg; storeSave(state.save); audio.sfx('click'); return; }
    if (kind === 'relic') {
      const relic = state.draft[Number(arg)];
      if (relic) { pickRelic(state, relic); audio.sfx('coin'); world._carryHp = world.player ? world.player.hp : 100; world.startRound(); }
      return;
    }
    switch (b.id) {
      case 'play': go(SCREENS.SELECT); break;
      case 'howto': state.prevScreen = 'title'; go('howto'); break;
      case 'almanac': state.prevScreen = 'title'; go(SCREENS.ALMANAC); break;
      case 'history': state.prevScreen = 'title'; go(SCREENS.HISTORY); break;
      case 'options': state.prevScreen = 'title'; go(SCREENS.OPTIONS); break;
      case 'todiff': go(SCREENS.DIFF); break;
      case 'back': go(state.prevScreen === 'select' ? 'select' : state.prevScreen === 'diff' ? 'diff' : 'title'); break;
      case 'start': state.runSeed = 'emberclash-' + Date.now(); world.startRun(); break;
      case 'endlesstoggle': state.endless = !state.endless; audio.sfx('click'); break;
      case 'endlessgo': world.continueEndless(); break;
      case 'resume': go(SCREENS.PLAY); break;
      case 'restart': world.startRun(); break;
      case 'quit': go(SCREENS.TITLE); break;
      case 'again': state.endless = false; state.runSeed = 'emberclash-' + Date.now(); world.startRun(); break;
      case 'title': go(SCREENS.TITLE); break;
      case 'mute': state.save.muted = !state.save.muted; audio.setMuted(state.save.muted); storeSave(state.save); break;
      case 'diffcycle': {
        const order = ['ember', 'blaze', 'inferno'];
        state.difficulty = order[(order.indexOf(state.difficulty) + 1) % 3];
        state.save.difficulty = state.difficulty; storeSave(state.save);
        break;
      }
      default: break;
    }
    return;
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = STEP;
  // Keyboard shortcuts that work across screens.
  if (input.hit('mute')) { state.save.muted = !state.save.muted; audio.setMuted(state.save.muted); storeSave(state.save); }
  if (input.hit('pause')) {
    if (state.screen === SCREENS.PLAY) go(SCREENS.PAUSE);
    else if (state.screen === SCREENS.PAUSE) go(SCREENS.PLAY);
  }
  if (input.hit('confirm')) {
    if (state.screen === SCREENS.TITLE) go(SCREENS.SELECT);
    else if (state.screen === SCREENS.SELECT) go(SCREENS.DIFF);
    else if (state.screen === SCREENS.DIFF) { state.runSeed = 'emberclash-' + Date.now(); world.startRun(); }
  }
  if (state.screen === SCREENS.PLAY) audio.unlock();
  if (input.anyKey) audio.unlock();
  world.step(dt, input);
  buttons = render(ctx, world, input);
  handleButtons();
  // Screen-reader status line.
  if (state.screen === SCREENS.PLAY && world.player && world.enemy) {
    setStatus(`Round ${state.round}. ${heroById(state.heroId).name} ${Math.ceil(world.player.hp)} HP versus ${world.enemy.def.name} ${Math.ceil(world.enemy.hp)} HP. Score ${state.score}. ${Math.ceil(state.timer)} seconds left.`);
  } else if (state.screen === SCREENS.TITLE) setStatus('Emberclash title screen. Press Enter or click Fight to choose a hero.');
  else if (state.screen === SCREENS.WIN) setStatus(`Champion! Final score ${state.score}.`);
  else if (state.screen === SCREENS.LOSE) setStatus(`Knocked out in round ${state.round}. Score ${state.score}.`);
  input.endFrame();
}

if (shotName) {
  // Screenshot mode: stage the scene once, draw one frame, stop the loop.
  document.title = 'EMBERCLASH — shot:' + shotName;
  stageShot(shotName, world, input);
  render(ctx, world, input);
  window.__emberclashShot = shotName;
  setStatus('Emberclash screenshot ' + shotName);
} else {
  audio.setTrack('title');
  requestAnimationFrame(frame);
}
