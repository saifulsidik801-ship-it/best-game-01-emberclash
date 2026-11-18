// EMBERCLASH — fighter entity: one hero or enemy on the arena floor.
// One job: physics, facing, hit state, cooldowns and the per-hero skill casts.
import { ARENA, clamp } from './config.js';

export function makeFighter(def, x, isPlayer, mods, diffMul) {
  const hpMul = isPlayer ? 1 + (mods.maxHp / def.hp) : (diffMul ? diffMul.hp : 1);
  return {
    def, isPlayer, x, y: ARENA.floorY, vx: 0, vy: 0, w: 56, h: 96,
    facing: isPlayer ? 1 : -1, onGround: true, jumps: 0,
    maxHp: Math.round(def.hp * hpMul), hp: Math.round(def.hp * hpMul),
    atkCd: 0, s1Cd: 0, s2Cd: 0, ult: isPlayer ? 0 : 0, ultReady: false,
    hurtT: 0, stunT: 0, frozenT: 0, burnT: 0, slowT: 0, guardT: 0,
    attackT: 0, attackId: 0, dashT: 0, dead: false, walkPhase: 0,
    comboGiven: 0, lastHitAt: -99, heat: 0,
    mods: mods || null, diffMul: diffMul || null, ai: { think: 0, plan: 'chase', skillAt: 2 },
  };
}

export function fighterSpeed(f) {
  let s = f.def.speed * (f.mods ? f.mods.speedMul : 1) * (f.diffMul ? f.diffMul.speed : 1);
  if (f.slowT > 0) s *= 0.7;
  return s;
}
export function fighterAtk(f) {
  let a = f.def.atk * (f.mods ? f.mods.dmgMul : 1) * (f.diffMul ? f.diffMul.dmg : 1);
  if (f.mods && f.mods.rage && f.hp < f.maxHp / 2) a *= 1.3;
  return a;
}
export function fighterArmor(f) { return f.mods ? f.mods.armorMul : 1; }

export function fighterStep(f, dt, move, wantJump) {
  if (f.dead) return;
  if (f.stunT > 0) f.stunT -= dt;
  if (f.frozenT > 0) f.frozenT -= dt;
  if (f.burnT > 0) f.burnT -= dt;
  if (f.slowT > 0) f.slowT -= dt;
  if (f.guardT > 0) f.guardT -= dt;
  if (f.hurtT > 0) f.hurtT -= dt;
  if (f.atkCd > 0) f.atkCd -= dt;
  if (f.s1Cd > 0) f.s1Cd -= dt;
  if (f.s2Cd > 0) f.s2Cd -= dt;
  if (f.attackT > 0) f.attackT -= dt;
  if (f.dashT > 0) f.dashT -= dt;
  const frozen = f.frozenT > 0 || f.stunT > 0;
  const speed = fighterSpeed(f);
  if (!frozen) {
    if (f.dashT > 0) { f.vx = f.facing * 900; }
    else { f.vx = move * speed; if (move !== 0) f.facing = move > 0 ? 1 : -1; }
    if (wantJump && f.onGround) { f.vy = -f.def.jump; f.onGround = false; f.jumps = 1; }
    else if (wantJump && f.mods && f.mods.doubleJump && f.jumps < 2 && f.vy > -200) { f.vy = -f.def.jump * 0.92; f.jumps = 2; }
  } else { f.vx = 0; }
  f.vy += ARENA.gravity * dt;
  f.x += f.vx * dt; f.y += f.vy * dt;
  if (f.x < ARENA.left) f.x = ARENA.left;
  if (f.x > ARENA.right) f.x = ARENA.right;
  if (f.y >= ARENA.floorY) { f.y = ARENA.floorY; f.vy = 0; f.onGround = true; f.jumps = 0; }
  if (Math.abs(f.vx) > 20 && f.onGround) f.walkPhase += dt * Math.abs(f.vx) / 40;
}

export function fighterCenter(f) { return { x: f.x, y: f.y - f.h / 2 }; }
export function fighterRange(f) { return f.def.range; }
export function dist(a, b) { return Math.abs(a.x - b.x); }
export function clampHp(f) { f.hp = clamp(f.hp, 0, f.maxHp); }
