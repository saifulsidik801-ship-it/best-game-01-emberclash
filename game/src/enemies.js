// EMBERCLASH — enemy roster, ladder order and the final boss.
// One job: who you fight, in what order, and how tough each one is.
export const ENEMIES = [
  { id: 'scrap', name: 'SCRAP', title: 'Rookie Brawler', color: '#9aa5b1', glow: '#d7dee8', dark: '#3d4750', hp: 70, speed: 250, atk: 7, range: 52, style: 'brawler', taunt: 'I just got here!' },
  { id: 'cinder', name: 'CINDER', title: 'Ember Imp', color: '#ff9a3a', glow: '#ffd94d', dark: '#8a3d00', hp: 80, speed: 300, atk: 8, range: 56, style: 'rusher', taunt: 'Burn, burn, burn!' },
  { id: 'gale', name: 'GALE', title: 'Wind Dancer', color: '#7dffc8', glow: '#d8ffe9', dark: '#0a6b44', hp: 85, speed: 340, atk: 9, range: 60, style: 'rusher', taunt: 'Catch me if you can!' },
  { id: 'bramble', name: 'BRAMBLE', title: 'Thorn Guard', color: '#7dff6a', glow: '#d8ffb0', dark: '#1d5c0a', hp: 120, speed: 240, atk: 10, range: 62, style: 'brawler', taunt: 'The arena grows thorns.' },
  { id: 'onyx', name: 'ONYX', title: 'Shadow Blade', color: '#b678ff', glow: '#e6ccff', dark: '#2c1150', hp: 100, speed: 360, atk: 12, range: 66, style: 'rusher', taunt: 'You never saw me coming.' },
  { id: 'titan', name: 'TITAN', title: 'Arena Colossus', color: '#ffb400', glow: '#ffe14d', dark: '#6b4a00', hp: 160, speed: 230, atk: 15, range: 84, style: 'brawler', taunt: 'I am the wall.' },
];

export const BOSS = {
  id: 'ashlord', name: 'ASHLORD', title: 'The Last Light Eater', color: '#ff2e63', glow: '#ff9a3a', dark: '#4d0013',
  hp: 320, speed: 300, atk: 16, range: 96, style: 'boss',
  taunt: 'I swallowed the last light. You are next.',
  phases: [
    { at: 1.0, note: 'ASHLORD enters the arena!' },
    { at: 0.66, note: 'ASHLORD rages — speed up!' },
    { at: 0.33, note: 'ASHLORD burns — fire rain!' },
  ],
};

/** Ladder order for rounds 1..6 (shuffled per run by world.js). */
export function ladderOrder(rng) {
  const list = ENEMIES.slice();
  for (let i = list.length - 1; i > 0; i -= 1) { const j = Math.floor(rng() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  return list;
}

/** Endless-mode opponent: a scaled remix of a random roster enemy. */
export function endlessEnemy(rng, wave) {
  const base = ENEMIES[Math.floor(rng() * ENEMIES.length) % ENEMIES.length];
  const scale = 1 + wave * 0.18;
  return { ...base, name: `${base.name} +${wave}`, hp: Math.round(base.hp * scale), atk: Math.round(base.atk * (1 + wave * 0.08)), speed: Math.min(420, base.speed * (1 + wave * 0.03)) };
}
