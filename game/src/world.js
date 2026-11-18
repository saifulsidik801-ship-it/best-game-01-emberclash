// EMBERCLASH — world: the live fight. Rounds, timer, scoring, win/lose flow.
// One job: step the simulation forward one fixed tick.
import { STEP, ROUND_TIME, LADDER_ROUNDS, DIFFICULTY, clamp } from './config.js';
import { heroById } from './heroes.js';
import { ladderOrder, endlessEnemy, BOSS } from './enemies.js';
import { makeFighter, fighterStep, fighterCenter } from './fighter.js';
import { aiDecide, aiWants, aiClearSkill } from './ai.js';
import { basicAttack, castSkill, dealDamage } from './combat.js';
import { makeRng } from './rng.js';
import { arenaFor } from './arena.js';
import { unlockFeat } from './state.js';
import { recordRun, storeSave } from './storage.js';
import { startDraft } from './upgrades.js';

export class World {
  constructor(state, audio, particles, projectiles) {
    this.state = state; this.audio = audio;
    this.particles = particles; this.projectiles = projectiles;
    this.player = null; this.enemy = null; this.arena = arenaFor(1, LADDER_ROUNDS + 1);
    this.combo = 0; this.shake = 0; this.flash = 0; this.roundOverT = 0;
    this.crowdSeed = 7;
  }

  startRun() {
    const s = this.state;
    s.round = 1; s.wave = 0; s.score = 0; s.kills = 0; s.bestCombo = 0; s.combo = 0;
    s.relics = []; s.mods = freshModsImport(); s.featsUnlocked = [];
    s.damageDealt = 0; s.damageTaken = 0;
    const rng = makeRng(s.runSeed);
    s.ladder = ladderOrder(rng);
    this.audio.setTrack('ember');
    this.startRound();
  }

  startRound() {
    const s = this.state;
    const hero = heroById(s.heroId);
    const diff = DIFFICULTY[s.difficulty];
    s.timer = ROUND_TIME; s.roundWon = false; s.roundLost = false; s.combo = 0;
    this.roundOverT = 0;
    this.arena = arenaFor(s.endless ? 8 : s.round, LADDER_ROUNDS + 1);
    this.audio.setTrack(s.endless ? 'inferno' : this.arena.music);
    this.player = makeFighter(hero, 340, true, s.mods, null);
    // Keep HP across rounds (heal a little between rounds).
    if (this._carryHp !== undefined) { this.player.hp = Math.min(this.player.maxHp, this._carryHp + diff.heal); }
    let def;
    if (s.endless) { def = endlessEnemy(makeRng(s.runSeed + '-w' + s.wave), s.wave); }
    else if (s.round > LADDER_ROUNDS) { def = BOSS; }
    else { def = s.ladder[s.round - 1]; }
    s.enemyDef = def;
    this.enemy = makeFighter(def, 940, false, null, diff);
    this.enemy.facing = -1;
    this.particles.clear(); this.projectiles.clear();
    s.bossPhase = 0;
    s.announce = s.endless ? `WAVE ${s.wave} — ${def.name}` : s.round > LADDER_ROUNDS ? 'FINAL ROUND — ASHLORD!' : `ROUND ${s.round} — ${def.name}!`;
    s.announceT = 1.6;
    this.audio.sfx('round');
    this.crowdSeed = (this.crowdSeed * 31 + s.round * 7) % 997;
    s.screen = 'play';
  }

  registerHit(attacker, dmg) {
    const s = this.state;
    if (!attacker.isPlayer) { s.damageTaken += dmg; return; }
    s.damageDealt += dmg;
    s.combo += 1; s.comboT = 2.2;
    s.bestCombo = Math.max(s.bestCombo, s.combo);
    if (s.combo >= 20) unlockFeat(s, 'combo20');
    const gain = Math.round((10 + dmg) * (s.mods.scoreMul || 1));
    s.score += gain;
    attacker.ult = Math.min(100, attacker.ult + (4 + dmg * 0.25) * (s.mods.ultMul || 1));
  }

  endRound(won) {
    const s = this.state;
    if (s.roundWon || s.roundLost) return;
    if (won) {
      s.roundWon = true; s.kills += 1;
      const timeBonus = Math.round(s.timer * 10 * DIFFICULTY[s.difficulty].score * (s.mods.scoreMul || 1));
      s.score += timeBonus;
      if (s.damageTaken === 0) unlockFeat(s, 'flawless');
      this.audio.sfx('win');
      this.particles.burst(640, 300, 80, '#ffc21a', 500, 1.2, 7);
      this.particles.ring(640, 300, '#ffd94d', 260);
      s.announce = s.round > LADDER_ROUNDS ? '👑 CHAMPION!' : 'ROUND WON!'; s.announceT = 2;
    } else {
      s.roundLost = true;
      this.audio.sfx('lose');
      s.announce = 'KNOCKED OUT'; s.announceT = 2;
    }
    this.roundOverT = 2.0;
    this._carryHp = won ? this.player.hp : undefined;
  }

  finishRun(won) {
    const s = this.state;
    if (won && s.round > LADDER_ROUNDS && !s.endless) unlockFeat(s, 'bossSlayer');
    if (won && s.round === 1 && !s.endless) unlockFeat(s, 'firstWin');
    if (s.endless && s.wave >= 5) unlockFeat(s, 'endless5');
    recordRun(s.save, { score: s.score, round: s.round, hero: s.heroId, won, endless: s.endless, wave: s.wave });
    storeSave(s.save);
  }

  step(dt, input) {
    const s = this.state;
    s.t += dt;
    if (s.announceT > 0) s.announceT -= dt;
    if (s.comboT > 0) { s.comboT -= dt; if (s.comboT <= 0) s.combo = 0; }
    this.particles.ambient(makeRng('amb' + Math.floor(s.t * 10)), 1280, 600);
    this.particles.update(dt);
    if (s.screen !== 'play') { if (this.flash > 0) this.flash -= dt; if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 30); return; }
    if (s.roundWon || s.roundLost) {
      this.roundOverT -= dt;
      this.player && fighterStep(this.player, dt, 0, false);
      if (this.roundOverT <= 0) this.advanceAfterRound();
      return;
    }
    // Timer.
    s.timer -= dt;
    if (s.timer <= 0) { this.endRound(this.player.hp >= this.enemy.hp); return; }
    const p = this.player; const e = this.enemy;
    if (!p || !e) return;
    // Burn damage over time.
    for (const f of [p, e]) {
      if (f.burnT > 0) { f.hp -= 6 * dt; if (f.hp <= 0 && !f.dead) { f.hp = 0; f.dead = true; } }
    }
    // Player input.
    let move = 0;
    if (input.down('left')) move -= 1;
    if (input.down('right')) move += 1;
    if (input.touchDir() !== 0) move = input.touchDir();
    const jump = input.hit('jump');
    fighterStep(p, dt, move, jump);
    if (jump && p.onGround) this.audio.sfx('jump');
    if (input.hit('attack') && p.atkCd <= 0 && p.attackT <= 0) {
      p.atkCd = p.def.atkSpeed * (p.mods ? p.mods.atkSpeedMul : 1); p.attackT = 0.3; p.attackId += 1;
      this.audio.sfx('swing');
      const hit = basicAttack(this, p, e);
      if (hit === 0) this.particles.sparks(p.x + p.facing * 60, p.y - 60, p.def.glow, 3);
    }
    if (input.hit('skill1')) castSkill(this, p, e, 's1');
    if (input.hit('skill2')) castSkill(this, p, e, 's2');
    if (input.hit('ult')) castSkill(this, p, e, 'ult');
    // Enemy AI.
    const rng = makeRng('ai' + Math.floor(s.t * 60) + e.x);
    const aiMove = aiDecide(e, p, dt, rng);
    const wants = aiWants(e);
    fighterStep(e, dt, aiMove, wants.jump);
    if (wants.skill) { aiClearSkill(e); castSkill(this, e, p, 's1'); }
    else if (wants.attack && e.atkCd <= 0 && e.attackT <= 0) {
      e.atkCd = 0.6; e.attackT = 0.3;
      basicAttack(this, e, p);
    }
    // Boss phase triggers.
    if (e.def.id === 'ashlord') {
      const frac = e.hp / e.maxHp;
      if (s.bossPhase === 0 && frac < 0.66) { s.bossPhase = 1; s.announce = 'ASHLORD RAGES!'; s.announceT = 1.4; e.def.speed = 360; this.audio.sfx('ult'); }
      if (s.bossPhase === 1 && frac < 0.33) {
        s.bossPhase = 2; s.announce = 'FIRE RAIN!'; s.announceT = 1.4;
        for (let i = 0; i < 8; i += 1) this.projectiles.spawn({ kind: 'fire', x: 120 + i * 150, y: 40, vx: 0, vy: 500, grav: 300, color: '#ff3b30', dmg: 12, fromPlayer: false, size: 10 });
      }
    }
    // Projectiles collide with the opposite fighter.
    this.projectiles.update(dt, { floorY: 600 }, (pr) => {
      const target = pr.fromPlayer ? e : p;
      if (target.dead) return;
      // Hit the whole body column (head to feet), not just the centre point,
      // so a jumping fighter is still hittable.
      if (Math.abs(pr.x - target.x) < 50 && pr.y > target.y - 104 && pr.y < target.y + 12) {
        pr.dead = true;
        const fake = pr.fromPlayer ? p : e;
        dealDamage(this, fake, target, pr.dmg || 10, {});
        this.registerHit(fake, pr.dmg || 10);
      }
    });
    // Dash trail.
    if (p.dashT > 0) this.particles.trail(p.x, p.y - 50, p.def.glow, 12);
    if (e.dashT > 0) this.particles.trail(e.x, e.y - 50, e.def.glow, 12);
    // Death checks.
    if (e.dead) { this.audio.sfx('ko'); this.particles.burst(e.x, e.y - 50, 50, e.def.glow, 480, 1.0, 7); this.particles.ring(e.x, e.y - 50, '#ffd94d', 200); s.score += Math.round(200 * DIFFICULTY[s.difficulty].score * (s.mods.scoreMul || 1)); this.endRound(true); }
    else if (p.dead) { this.audio.sfx('ko'); this.particles.burst(p.x, p.y - 50, 50, p.def.glow, 480, 1.0, 7); this.endRound(false); }
    if (this.flash > 0) this.flash -= dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 26);
  }

  advanceAfterRound() {
    const s = this.state;
    if (s.roundLost) { this.finishRun(false); s.screen = 'lose'; return; }
    // Won the round.
    if (s.endless) {
      s.wave += 1;
      this._carryHp = this.player.hp;
      this.startRound();
      return;
    }
    if (s.round > LADDER_ROUNDS) { this.finishRun(true); s.screen = 'win'; return; }
    if (s.round === LADDER_ROUNDS) { // round 6 won -> boss round 7
      s.round += 1; this._carryHp = this.player.hp;
      startDraft(s);
      return;
    }
    s.round += 1; this._carryHp = this.player.hp;
    startDraft(s);
  }

  continueEndless() {
    const s = this.state;
    s.endless = true; s.wave = 1; s.round = LADDER_ROUNDS + 2;
    this._carryHp = this.player ? this.player.hp : 100;
    this.startRound();
  }
}

import { freshMods as freshModsImport } from './relics.js';
