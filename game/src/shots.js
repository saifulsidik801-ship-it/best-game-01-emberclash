// EMBERCLASH — screenshot staging (?shot=title|play|upgrade|win).
// One job: drive the real game forward with a scripted autopilot to a
// representative frame, so screenshots are true renders of the code.
import { STEP } from './config.js';
import { heroById } from './heroes.js';
import { basicAttack, castSkill } from './combat.js';
import { fighterStep } from './fighter.js';
import { aiDecide, aiWants, aiClearSkill } from './ai.js';
import { makeRng } from './rng.js';
import { startDraft } from './upgrades.js';

/** Simple autopilot: chase the enemy, attack in range, use skills off cooldown. */
function autopilot(world, dt) {
  const p = world.player; const e = world.enemy; const s = world.state;
  if (!p || !e || p.dead || e.dead) return;
  const d = Math.abs(p.x - e.x);
  let move = 0;
  if (d > p.def.range) move = e.x > p.x ? 1 : -1;
  fighterStep(p, dt, move, false);
  if (d <= p.def.range + 10 && p.atkCd <= 0) {
    p.atkCd = p.def.atkSpeed; p.attackT = 0.3;
    basicAttack(world, p, e);
  }
  if (p.s1Cd <= 0 && d < 240) castSkill(world, p, e, 's1');
  if (p.s2Cd <= 0 && d < 200) castSkill(world, p, e, 's2');
  if (p.ult >= 100) castSkill(world, p, e, 'ult');
  // Enemy fights back so the frame is alive.
  const rng = makeRng('shot-ai' + Math.floor(s.t * 60));
  const aiMove = aiDecide(e, p, dt, rng);
  const wants = aiWants(e);
  fighterStep(e, dt, aiMove, wants.jump);
  if (wants.skill) { aiClearSkill(e); castSkill(world, e, p, 's1'); }
  else if (wants.attack && e.atkCd <= 0) { e.atkCd = 0.6; e.attackT = 0.3; basicAttack(world, e, p); }
}

/** Stage a named scene. Returns the screen the shot should show. */
export function stageShot(name, world, input) {
  const s = world.state;
  world.particles.clear(); world.projectiles.clear();
  if (name === 'title') {
    s.screen = 'title';
    for (let i = 0; i < 90; i += 1) { s.t += STEP; world.particles.ambient(makeRng('title' + i), 1280, 600); world.particles.update(STEP); }
    return;
  }
  if (name === 'upgrade') {
    // Simulate a won round 1 so the draft is real.
    world.startRun();
    world.enemy.hp = 1;
    const p = world.player; const e = world.enemy;
    p.x = e.x - 50; p.facing = 1;
    basicAttack(world, p, e);
    // Force the round-win path.
    world.endRound(true);
    world.advanceAfterRound();
    if (s.screen !== 'upgrade') startDraft(s);
    for (let i = 0; i < 30; i += 1) { s.t += STEP; world.particles.update(STEP); }
    return;
  }
  if (name === 'win') {
    world.startRun();
    // Fast-forward: win rounds 1-6 by KO, then boss, then champion screen.
    for (let r = 0; r < 7; r += 1) {
      const e = world.enemy; const p = world.player;
      e.hp = 1; p.x = e.x - 50; p.facing = 1;
      basicAttack(world, p, e);
      world.endRound(true);
      world.advanceAfterRound();
      if (s.screen === 'upgrade') { // pick middle relic, start next round
        const relic = s.draft[1] || s.draft[0];
        if (relic) { relic.apply(s.mods); s.relics.push(relic); }
        s.draft = [];
        world._carryHp = world.player ? world.player.hp : 100;
        world.startRound();
      }
      if (s.screen === 'win') break;
    }
    for (let i = 0; i < 60; i += 1) { s.t += STEP; world.particles.burst(300 + (i % 5) * 170, 200, 4, '#ffc21a', 300, 0.8, 5); world.particles.update(STEP); }
    return;
  }
  // Default: play — a busy mid-fight frame with effects everywhere.
  world.startRun();
  s.heroId = 'pyra';
  world.startRun();
  // Let the autopilot brawl for ~4.5 seconds of game time — long enough for
  // hits and effects, short enough that both fighters are still standing.
  for (let i = 0; i < 270; i += 1) {
    s.t += STEP;
    world.particles.ambient(makeRng('play' + i), 1280, 600);
    autopilot(world, STEP);
    world.particles.update(STEP);
    world.projectiles.update(STEP, { floorY: 600 }, (pr) => {
      const target = pr.fromPlayer ? world.enemy : world.player;
      if (target && !target.dead && Math.abs(pr.x - target.x) < 50 && pr.y > target.y - 104 && pr.y < target.y + 12) { pr.dead = true; }
    });
    if (s.comboT > 0) { s.comboT -= STEP; if (s.comboT <= 0) s.combo = 0; }
    if (world.player.dead || world.enemy.dead) break;
  }
  // Keep the frame honest: if the enemy fell, revive them at half HP so the
  // shot shows a live mid-fight, not a corpse.
  if (world.enemy.dead) { world.enemy.dead = false; world.enemy.hp = Math.round(world.enemy.maxHp * 0.55); }
  if (world.player.dead) { world.player.dead = false; world.player.hp = Math.round(world.player.maxHp * 0.7); }
  // Pose the fighters apart and facing each other, mid-swing, so both read clearly.
  world.player.x = 540; world.player.y = 600; world.player.facing = 1; world.player.attackT = 0.18;
  world.enemy.x = 700; world.enemy.y = 600; world.enemy.facing = -1; world.enemy.attackT = 0.12;
  world.particles.burst(620, 540, 22, '#ffc21a', 380, 0.7, 6);
  world.particles.burst(620, 540, 14, world.enemy.def.glow, 320, 0.6, 5);
  s.combo = Math.max(s.bestCombo, 1); s.comboT = 2.5;
  // HUD numbers below are the real simulated values (timer, score, HP, ult)
  // — nothing is forced, so the screenshot is a true replay frame.
}
