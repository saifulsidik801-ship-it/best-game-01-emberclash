// EMBERCLASH — combat resolution: hits, crits, burn/slow, combos, skills, ults.
// One job: turn an attack or skill cast into damage numbers and effects.
import { fighterAtk, fighterArmor, fighterCenter } from './fighter.js';
import { clamp } from './config.js';

export function dealDamage(world, attacker, target, base, opts = {}) {
  if (target.dead) return 0;
  if (target.guardT > 0) {
    // Guard blocks the hit and sparks (Lava Guard / Ice Wall flavour).
    world.particles.sparks(target.x, target.y - 50, '#6fd8ff', 6);
    return 0;
  }
  let dmg = base;
  let crit = false;
  const mods = attacker.mods;
  if (mods && Math.random() < mods.crit) { dmg *= 2; crit = true; }
  if (mods && mods.comboMul > 0 && world.combo > 1) dmg *= 1 + Math.min(0.6, mods.comboMul * world.combo);
  dmg *= fighterArmor(target);
  dmg = Math.max(1, Math.round(dmg));
  target.hp -= dmg;
  target.hurtT = 0.22;
  if (opts.launch) { target.vy = -520; target.onGround = false; }
  if (opts.stun) target.stunT = Math.max(target.stunT, opts.stun);
  if (opts.freeze) target.frozenT = Math.max(target.frozenT, opts.freeze);
  if (mods && mods.burnOnHit) target.burnT = 3;
  if (mods && mods.slowOnHit) target.slowT = 2;
  if (mods && mods.lifesteal > 0 && attacker.isPlayer) {
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + mods.lifesteal);
  }
  const c = fighterCenter(target);
  world.particles.sparks(c.x, c.y, crit ? '#ffe14d' : attacker.def.color, crit ? 16 : 9);
  world.particles.text(c.x + (Math.random() - 0.5) * 20, c.y - 20, crit ? `${dmg}!` : `${dmg}`, crit ? '#ffe14d' : '#ffffff', crit ? 30 : 22);
  if (target.hp <= 0) {
    if (target.mods && target.mods.secondWind && !target.secondWindUsed) {
      target.secondWindUsed = true; target.hp = 1;
      world.particles.ring(target.x, target.y - 50, '#7dff6a', 160);
      world.particles.text(target.x, target.y - 120, 'SECOND WIND!', '#7dff6a', 30);
    } else {
      target.hp = 0; target.dead = true;
    }
  }
  return dmg;
}

/** Basic melee/ranged attack. Returns damage dealt (0 = whiff). */
export function basicAttack(world, attacker, target) {
  const d = Math.abs(attacker.x - target.x);
  const reach = attacker.def.range + 20;
  const facingOk = (target.x - attacker.x) * attacker.facing > -30;
  if (d > reach || !facingOk || target.dead) return 0;
  const dmg = dealDamage(world, attacker, target, fighterAtk(attacker));
  if (dmg > 0) {
    world.registerHit(attacker, dmg);
    world.shake = Math.min(10, world.shake + (attacker.isPlayer ? 3 : 2));
    world.audio.sfx(dmg >= 20 ? 'crit' : 'hit');
  }
  return dmg;
}

/** Enemy skill set: the boss hurls fireballs, other rivals lunge-slam. */
function castEnemySkill(world, f, target, id) {
  if (f.s1Cd > 0) return false;
  f.s1Cd = 5;
  world.audio.sfx('skill');
  const c = fighterCenter(f);
  if (f.def.id === 'ashlord') {
    for (let i = -1; i <= 1; i += 1) {
      world.projectiles.spawn({ kind: 'fire', x: c.x, y: c.y, vx: f.facing * 520, vy: i * 120, color: '#ff3b30', dmg: fighterAtk(f), fromPlayer: false, size: 10 });
    }
    world.particles.burst(c.x, c.y, 16, '#ff3b30', 300, 0.6, 6);
  } else {
    f.facing = target && target.x > f.x ? 1 : -1;
    f.dashT = 0.25;
    world.particles.embers(c.x, c.y, 14, f.def.glow);
    if (target && Math.abs(target.x - f.x) < 200) dealDamage(world, f, target, fighterAtk(f) * 1.3, {});
  }
  return true;
}

/** Cast a hero skill. id 's1' | 's2' | 'ult'. Returns true if cast. */
export function castSkill(world, f, target, id) {
  const hero = f.def;
  // Enemies have no hero skills — they use their own skill set instead.
  if (!hero.skill1 || !hero.skill2 || !hero.ult) return castEnemySkill(world, f, target, id);
  const c = fighterCenter(f);
  if (id === 's1') {
    if (f.s1Cd > 0) return false;
    f.s1Cd = hero.skill1.cd; world.audio.sfx('skill');
    switch (hero.id) {
      case 'pyra': f.dashT = 0.28; world.particles.embers(c.x, c.y, 24, '#ff7a1a'); if (target && Math.abs(target.x - f.x) < 260) dealDamage(world, f, target, fighterAtk(f) * 1.4, { launch: false }); break;
      case 'volt': world.particles.ring(f.x, f.y - 10, '#ffe14d', 200); world.shake = 12; if (target && Math.abs(target.x - f.x) < 220) dealDamage(world, f, target, fighterAtk(f) * 1.3, { stun: 0.9 }); break;
      case 'luma': for (let i = -1; i <= 1; i += 1) world.projectiles.spawn({ kind: 'arrow', x: c.x, y: c.y, vx: f.facing * 900, vy: i * 160, color: '#6fd8ff', dmg: fighterAtk(f) * 0.9, fromPlayer: f.isPlayer, size: 9 }); break;
      case 'magma': world.particles.burst(c.x, c.y - 40, 26, '#ff3b30', 380, 0.7, 7); if (target && Math.abs(target.x - f.x) < 150) dealDamage(world, f, target, fighterAtk(f) * 1.8, { launch: true }); break;
      case 'frost': world.particles.burst(c.x + f.facing * 60, c.y, 20, '#b678ff', 300, 0.6, 6); if (target && Math.abs(target.x - f.x) < 200) dealDamage(world, f, target, fighterAtk(f) * 1.2, { freeze: 1.4 }); break;
      default: if (target && Math.abs(target.x - f.x) < 200) dealDamage(world, f, target, fighterAtk(f) * 1.4, {}); break;
    }
    return true;
  }
  if (id === 's2') {
    if (f.s2Cd > 0) return false;
    f.s2Cd = hero.skill2.cd; world.audio.sfx('skill');
    switch (hero.id) {
      case 'pyra': world.particles.ring(f.x, f.y - 40, '#ffc21a', 170); if (target && Math.abs(target.x - f.x) < 190) dealDamage(world, f, target, fighterAtk(f) * 1.5, { launch: true }); break;
      case 'volt': world.projectiles.spawn({ kind: 'bolt', x: c.x, y: c.y - 20, vx: f.facing * 750, vy: 0, color: '#ffe14d', dmg: fighterAtk(f) * 1.4, fromPlayer: f.isPlayer, size: 10 }); world.projectiles.spawn({ kind: 'bolt', x: c.x, y: c.y - 60, vx: f.facing * 750, vy: -120, color: '#ffe14d', dmg: fighterAtk(f) * 1.4, fromPlayer: f.isPlayer, size: 10 }); break;
      case 'luma': f.x -= f.facing * 170; f.x = clamp(f.x, 90, 1190); world.particles.burst(c.x, c.y, 18, '#d8f6ff', 300, 0.5, 5); if (target) target.stunT = Math.max(target.stunT, 0.8); break;
      case 'magma': f.guardT = 2.5; world.particles.ring(f.x, f.y - 50, '#ff9a3a', 130); break;
      case 'frost': f.guardT = 2.0; world.particles.burst(c.x, c.y - 40, 16, '#bfe9ff', 200, 0.6, 6); if (target && Math.abs(target.x - f.x) < 120) dealDamage(world, f, target, fighterAtk(f) * 0.8, {}); break;
      default: if (target && Math.abs(target.x - f.x) < 200) dealDamage(world, f, target, fighterAtk(f) * 1.3, {}); break;
    }
    return true;
  }
  // Ultimate: needs full meter.
  if (f.ult < 100) return false;
  f.ult = 0; world.audio.sfx('ult'); world.shake = 16; world.flash = 0.35;
  const ultDmg = fighterAtk(f) * 2.2;
  switch (hero.id) {
    case 'pyra': world.particles.burst(c.x, c.y - 40, 60, '#ff7a1a', 520, 1.0, 8); world.particles.burst(c.x, c.y - 40, 40, '#ffc21a', 420, 0.9, 6); if (target) dealDamage(world, f, target, ultDmg, { launch: true }); break;
    case 'volt': for (let i = 0; i < 5; i += 1) world.particles.burst(200 + i * 220, 120, 14, '#ffe14d', 300, 0.6, 6); if (target) dealDamage(world, f, target, ultDmg, { stun: 1.2 }); break;
    case 'luma': for (let i = 0; i < 12; i += 1) world.projectiles.spawn({ kind: 'arrow', x: 120 + i * 95, y: 60, vx: (Math.random() - 0.5) * 60, vy: 620, color: '#6fd8ff', dmg: fighterAtk(f) * 0.7, fromPlayer: f.isPlayer, size: 8 }); break;
    case 'magma': for (let i = 0; i < 6; i += 1) world.particles.burst(160 + i * 190, 590, 20, '#ff3b30', 380, 0.8, 7); if (target) dealDamage(world, f, target, ultDmg, { launch: true }); break;
    case 'frost': world.particles.burst(640, 300, 50, '#e6ccff', 420, 1.0, 7); if (target) dealDamage(world, f, target, ultDmg * 0.8, { freeze: 2.2 }); break;
    default: if (target) dealDamage(world, f, target, ultDmg, {}); break;
  }
  world.particles.text(f.x, f.y - 150, hero.ult.name + '!', hero.glow, 34);
  return true;
}
