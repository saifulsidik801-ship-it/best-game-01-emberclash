// EMBERCLASH — enemy AI brain.
// One job: decide each enemy's move / attack / skill each tick.
import { dist } from './fighter.js';

export function aiDecide(enemy, player, dt, rng) {
  const ai = enemy.ai;
  ai.think -= dt;
  if (ai.think > 0) return ai.move || 0;
  ai.think = 0.12 + rng() * 0.1;
  const d = dist(enemy, player);
  const range = enemy.def.range;
  let move = 0; let attack = false; let jump = false;
  if (player.dead) { ai.move = 0; return 0; }
  if (enemy.stunT > 0 || enemy.frozenT > 0) { ai.move = 0; return 0; }
  const style = enemy.def.style;
  if (d > range + 6) {
    move = player.x > enemy.x ? 1 : -1;
    // Rushers sometimes leap in; brawlers walk steadily.
    if (style === 'rusher' && rng() < 0.18 && enemy.onGround) jump = true;
    if (style === 'boss' && rng() < 0.1) { ai.skill = 's1'; }
  } else {
    move = 0;
    attack = rng() < 0.75;
    if (style === 'boss' && rng() < 0.25) ai.skill = 's1';
    if (style !== 'boss' && rng() < 0.10) ai.skill = 's1'; // rivals lunge-slam too
    if (style === 'rusher' && rng() < 0.12) { move = player.x > enemy.x ? -1 : 1; } // sidestep
    if (rng() < 0.08) jump = true; // hop over the player sometimes
  }
  // Retreat when badly hurt (brawlers hold ground, rushers dance).
  if (enemy.hp < enemy.maxHp * 0.25 && style === 'rusher' && rng() < 0.3) move = player.x > enemy.x ? -1 : 1;
  ai.move = move; ai.attack = attack; ai.jump = jump;
  return move;
}

export function aiWants(enemy) { return { attack: !!enemy.ai.attack, jump: !!enemy.ai.jump, skill: enemy.ai.skill || null }; }
export function aiClearSkill(enemy) { enemy.ai.skill = null; }
