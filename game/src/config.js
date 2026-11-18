// EMBERCLASH — Arena of the Last Light. Shared tuning constants.
// One job: every number the rest of the game balances against lives here.
export const VIEW = { w: 1280, h: 720 };
export const ARENA = { floorY: 600, left: 90, right: 1190, gravity: 2400 };
export const STEP = 1 / 60;
export const ROUND_TIME = 60;
export const LADDER_ROUNDS = 6; // rounds 1-6, then round 7 = boss, then endless
export const MAX_HP = 100;

export const COLORS = {
  ember: '#ff7a1a', flame: '#ffc21a', gold: '#ffd94d', red: '#ff3b30',
  ice: '#6fd8ff', volt: '#ffe14d', leaf: '#7dff6a', void: '#b678ff',
  ink: '#1a1030', panel: 'rgba(20,10,40,0.82)', cream: '#fff3d6',
};

export const KEYS = {
  left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'],
  jump: ['ArrowUp', 'KeyW', 'Space'],
  attack: ['KeyJ', 'KeyZ'], skill1: ['KeyK', 'KeyX'],
  skill2: ['KeyL', 'KeyC'], ult: ['KeyU', 'KeyV'],
  pause: ['KeyP', 'Escape'], mute: ['KeyM'], confirm: ['Enter'],
};

// Difficulty multipliers applied to enemy stats and player healing.
export const DIFFICULTY = {
  ember: { label: 'EMBER', sub: 'Warm-up brawl', hp: 0.85, dmg: 0.85, speed: 0.95, heal: 26, score: 1 },
  blaze: { label: 'BLAZE', sub: 'A real fight', hp: 1.0, dmg: 1.0, speed: 1.0, heal: 20, score: 1.25 },
  inferno: { label: 'INFERNO', sub: 'No mercy', hp: 1.25, dmg: 1.2, speed: 1.1, heal: 14, score: 1.6 },
};
export const DIFF_ORDER = ['ember', 'blaze', 'inferno'];

/** Clamp a number into [lo, hi]. */
export function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
/** Linear interpolation. */
export function lerp(a, b, t) { return a + (b - a) * t; }
/** Random float in [lo, hi) from a rng function. */
export function rand(rng, lo, hi) { return lo + rng() * (hi - lo); }
/** Pick one element with a rng function. */
export function pick(rng, arr) { return arr[Math.floor(rng() * arr.length) % arr.length]; }
