// EMBERCLASH — relics: passive power-ups drafted between rounds.
// One job: the 14 relic definitions and what each one does to a fighter.
export const RELICS = [
  { id: 'ember-heart', name: 'Ember Heart', icon: '♥', color: '#ff5e3a', desc: '+25 max HP and heal 25 now.', apply: (s) => { s.maxHp += 25; s.hp = Math.min(s.maxHp, s.hp + 25); } },
  { id: 'whetstone', name: 'Whetstone', icon: '⚔', color: '#ffd94d', desc: '+20% attack damage.', apply: (s) => { s.dmgMul *= 1.2; } },
  { id: 'swift-boots', name: 'Swift Boots', icon: '»', color: '#7dffc8', desc: '+18% move speed, +10% attack speed.', apply: (s) => { s.speedMul *= 1.18; s.atkSpeedMul *= 0.9; } },
  { id: 'guard-plate', name: 'Guard Plate', icon: '▣', color: '#6fd8ff', desc: 'Take 15% less damage.', apply: (s) => { s.armorMul *= 0.85; } },
  { id: 'vampire-fang', name: 'Vampire Fang', icon: '♦', color: '#ff2e63', desc: 'Heal 3 HP on every hit you land.', apply: (s) => { s.lifesteal += 3; } },
  { id: 'crit-charm', name: 'Crit Charm', icon: '✦', color: '#ffe14d', desc: '+15% crit chance (crits hit for 2x).', apply: (s) => { s.crit += 0.15; } },
  { id: 'burn-oil', name: 'Burn Oil', icon: '♨', color: '#ff7a1a', desc: 'Your hits set foes burning for 3s.', apply: (s) => { s.burnOnHit = true; } },
  { id: 'frost-shard', name: 'Frost Shard', icon: '❄', color: '#bfe9ff', desc: 'Your hits slow foes by 30% for 2s.', apply: (s) => { s.slowOnHit = true; } },
  { id: 'ult-battery', name: 'Ult Battery', icon: '◉', color: '#b678ff', desc: 'Ultimate charges 35% faster.', apply: (s) => { s.ultMul *= 1.35; } },
  { id: 'second-wind', name: 'Second Wind', icon: '↻', color: '#7dff6a', desc: 'Once per run: survive a fatal blow at 1 HP.', apply: (s) => { s.secondWind = true; } },
  { id: 'combo-glove', name: 'Combo Glove', icon: '✊', color: '#ff9a3a', desc: 'Combo hits deal +4% damage each (max +60%).', apply: (s) => { s.comboMul += 0.04; } },
  { id: 'golden-coin', name: 'Golden Coin', icon: '◐', color: '#ffd94d', desc: '+40% score from everything.', apply: (s) => { s.scoreMul *= 1.4; } },
  { id: 'feather', name: 'Sky Feather', icon: '❖', color: '#d8f6ff', desc: 'Double jump! Press jump again in the air.', apply: (s) => { s.doubleJump = true; } },
  { id: 'rage-band', name: 'Rage Band', icon: '🔥', color: '#ff3b30', desc: 'Below half HP, deal +30% damage.', apply: (s) => { s.rage = true; } },
];

/** Fresh per-run modifier bag (mutated by relic.apply). */
export function freshMods() {
  return {
    maxHp: 0, dmgMul: 1, speedMul: 1, atkSpeedMul: 1, armorMul: 1,
    lifesteal: 0, crit: 0.05, burnOnHit: false, slowOnHit: false,
    ultMul: 1, secondWind: false, comboMul: 0, scoreMul: 1,
    doubleJump: false, rage: false,
  };
}

/** Draft 3 distinct relics not already owned. */
export function draftRelics(rng, ownedIds) {
  const pool = RELICS.filter((r) => !ownedIds.includes(r.id));
  const out = [];
  while (out.length < 3 && pool.length > 0) {
    const i = Math.floor(rng() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}
