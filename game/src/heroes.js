// EMBERCLASH — the five playable heroes. All original: names, weapons, skills.
// One job: hero definitions (stats, colours, skill text, draw palette).
// Attack numbers are base damage; relics and upgrades scale them in combat.js.
export const HEROES = [
  {
    id: 'pyra', name: 'PYRA', title: 'Flameblade Duelist', weapon: 'Twin ember sabers',
    color: '#ff7a1a', glow: '#ffc21a', dark: '#a83208', accent: '#ff5e3a',
    hp: 100, speed: 340, jump: 880, atk: 11, atkSpeed: 0.34, range: 64,
    desc: 'Fast slashes that leave burning trails. Her fire keeps hurting after the hit.',
    skill1: { name: 'Ember Dash', key: 'K', cd: 4, desc: 'Dash forward through foes, burning everything crossed.' },
    skill2: { name: 'Flame Arc', key: 'L', cd: 7, desc: 'A wide burning arc that launches enemies into the air.' },
    ult: { name: 'PHOENIX RUSH', key: 'U', desc: 'Five blazing strikes in a storm of fire. Unstoppable.' },
    taunt: 'The last light never goes out!',
  },
  {
    id: 'volt', name: 'VOLT', title: 'Stormhammer Bruiser', weapon: 'Thunder maul',
    color: '#ffe14d', glow: '#fff6a0', dark: '#8a6d00', accent: '#ffb400',
    hp: 130, speed: 275, jump: 780, atk: 17, atkSpeed: 0.55, range: 78,
    desc: 'Slow, heavy, enormous. Every hammer swing shakes the arena floor.',
    skill1: { name: 'Quake Slam', key: 'K', cd: 5, desc: 'Slam the ground: shockwave + stun in a wide ring.' },
    skill2: { name: 'Storm Chain', key: 'L', cd: 8, desc: 'Lightning arcs to the nearest foe and chains onward.' },
    ult: { name: 'SKYFALL', key: 'U', desc: 'Call down a storm: lightning strikes the whole arena.' },
    taunt: 'Thunder answers when I call!',
  },
  {
    id: 'luma', name: 'LUMA', title: 'Sunbow Ranger', weapon: 'Light longbow',
    color: '#6fd8ff', glow: '#d8f6ff', dark: '#0b5a8a', accent: '#37b6ff',
    hp: 85, speed: 330, jump: 860, atk: 9, atkSpeed: 0.30, range: 420,
    desc: 'Fights from range with piercing arrows of light. Keep your distance, keep shooting.',
    skill1: { name: 'Triple Volley', key: 'K', cd: 4, desc: 'Fire three piercing arrows in a fan.' },
    skill2: { name: 'Gale Step', key: 'L', cd: 6, desc: 'Backflip away leaving a blinding flash that stuns.' },
    ult: { name: 'DAWN RAIN', key: 'U', desc: 'A rain of a hundred light arrows over the whole arena.' },
    taunt: 'You cannot outrun the dawn.',
  },
  {
    id: 'magma', name: 'MAGMA', title: 'Molten Fist Brawler', weapon: 'Magma gauntlets',
    color: '#ff3b30', glow: '#ff9a3a', dark: '#7a0d08', accent: '#ff6a4d',
    hp: 115, speed: 315, jump: 820, atk: 13, atkSpeed: 0.40, range: 56,
    desc: 'Close-range fists that erupt. Builds heat with every hit, then bursts.',
    skill1: { name: 'Eruption Punch', key: 'K', cd: 4, desc: 'A rising uppercut that erupts magma under the foe.' },
    skill2: { name: 'Lava Guard', key: 'L', cd: 9, desc: 'A molten shield: block the next hits, burn attackers.' },
    ult: { name: 'VOLCANO', key: 'U', desc: 'The floor erupts in lava geysers all across the arena.' },
    taunt: 'Feel the mountain wake up!',
  },
  {
    id: 'frost', name: 'FROST', title: 'Glacier Spear Warden', weapon: 'Frost spear',
    color: '#b678ff', glow: '#e6ccff', dark: '#4a1a8a', accent: '#9d6bff',
    hp: 95, speed: 325, jump: 900, atk: 12, atkSpeed: 0.38, range: 84,
    desc: 'Long spear reach with freezing strikes. Frozen foes shatter for bonus damage.',
    skill1: { name: 'Glacier Thrust', key: 'K', cd: 4, desc: 'A long lunging thrust that freezes on hit.' },
    skill2: { name: 'Ice Wall', key: 'L', cd: 8, desc: 'Raise a wall of ice that blocks and damages on touch.' },
    ult: { name: 'ETERNAL WINTER', key: 'U', desc: 'Freeze the whole arena: everything stops, then shatters.' },
    taunt: 'Winter does not negotiate.',
  },
];

export function heroById(id) { return HEROES.find((h) => h.id === id) || HEROES[0]; }
