// EMBERCLASH — HUD: health bars, timer, score, combo, skill cooldowns, ult meter.
// One job: draw everything the player needs mid-fight, nothing else.
import { VIEW, ROUND_TIME, LADDER_ROUNDS } from './config.js';

function bar(ctx, x, y, w, h, frac, color, bg = 'rgba(0,0,0,0.6)') {
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x + 1, y + 1, (w - 2) * Math.max(0, Math.min(1, frac)), h - 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
}

export function drawHUD(ctx, world) {
  const s = world.state; const p = world.player; const e = world.enemy;
  if (!p || !e) return;
  ctx.textAlign = 'left';
  // Top banner: round + timer + score.
  ctx.fillStyle = 'rgba(10,4,24,0.72)'; ctx.fillRect(0, 44, VIEW.w, 46);
  ctx.fillStyle = '#fff3d6'; ctx.font = '900 20px Trebuchet MS, sans-serif';
  const roundLabel = s.endless ? `WAVE ${s.wave}` : s.round > LADDER_ROUNDS ? '👑 FINAL — ASHLORD' : `ROUND ${s.round} / ${LADDER_ROUNDS + 1}`;
  ctx.fillText(roundLabel, 24, 74);
  ctx.textAlign = 'center';
  ctx.font = '900 30px Trebuchet MS, sans-serif';
  ctx.fillStyle = s.timer <= 10 ? '#ff3b30' : '#fff3d6';
  ctx.fillText(`${Math.ceil(s.timer)}s`, 640, 78);
  ctx.textAlign = 'right'; ctx.font = '900 20px Trebuchet MS, sans-serif'; ctx.fillStyle = '#ffd94d';
  ctx.fillText(`SCORE ${s.score}`, 1256, 74);
  ctx.textAlign = 'left';
  // Player HP (left) + enemy HP (right).
  ctx.font = '900 16px Trebuchet MS, sans-serif'; ctx.fillStyle = '#fff3d6';
  ctx.fillText(`${p.def.name}  ♥ ${Math.ceil(p.hp)}/${p.maxHp}`, 24, 112);
  bar(ctx, 24, 118, 380, 18, p.hp / p.maxHp, p.hp / p.maxHp > 0.5 ? '#7dff6a' : p.hp / p.maxHp > 0.25 ? '#ffd94d' : '#ff3b30');
  ctx.textAlign = 'right';
  ctx.fillText(`${e.def.name}  ♥ ${Math.ceil(e.hp)}/${e.maxHp}`, 1256, 112);
  bar(ctx, 876, 118, 380, 18, e.hp / e.maxHp, '#ff3b30');
  ctx.textAlign = 'left';
  // Ult meter under player HP.
  ctx.fillStyle = '#fff3d6'; ctx.font = '900 13px Trebuchet MS, sans-serif';
  ctx.fillText(p.ult >= 100 ? '★ ULT READY — press U! ★' : `ULT ${Math.floor(p.ult)}%`, 24, 156);
  bar(ctx, 24, 160, 220, 10, p.ult / 100, '#b678ff');
  // Skill cooldown chips.
  const skills = [
    { label: `J ATK`, cd: p.atkCd, max: p.def.atkSpeed, ready: p.atkCd <= 0 },
    { label: `K ${p.def.skill1.name}`, cd: p.s1Cd, max: p.def.skill1.cd, ready: p.s1Cd <= 0 },
    { label: `L ${p.def.skill2.name}`, cd: p.s2Cd, max: p.def.skill2.cd, ready: p.s2Cd <= 0 },
    { label: `U ${p.def.ult.name}`, cd: 0, max: 1, ready: p.ult >= 100 },
  ];
  skills.forEach((sk, i) => {
    const x = 24 + i * 190; const y = 182;
    ctx.fillStyle = sk.ready ? 'rgba(255,217,77,0.9)' : 'rgba(10,4,24,0.7)';
    ctx.fillRect(x, y, 180, 26);
    ctx.fillStyle = sk.ready ? '#14102a' : '#cfc4e8';
    ctx.font = '900 13px Trebuchet MS, sans-serif';
    ctx.fillText(sk.ready ? sk.label : `${sk.label} (${sk.cd.toFixed(1)}s)`, x + 8, y + 18);
  });
  // Combo badge.
  if (s.combo >= 2) {
    ctx.save();
    ctx.translate(640, 250); ctx.rotate(-0.06);
    ctx.fillStyle = 'rgba(255,122,26,0.92)'; ctx.beginPath(); ctx.roundRect(-110, -26, 220, 52, 12); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '900 26px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`🔥 ${s.combo} HIT COMBO`, 0, 8);
    ctx.restore();
  }
  // Relic icons owned.
  s.relics.forEach((r, i) => {
    ctx.fillStyle = 'rgba(10,4,24,0.75)'; ctx.beginPath(); ctx.arc(40 + i * 44, 664, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = r.color; ctx.font = '20px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(r.icon, 40 + i * 44, 671);
  });
  ctx.textAlign = 'left';
  // Controls hint, bottom right.
  ctx.fillStyle = 'rgba(255,243,214,0.85)'; ctx.font = '13px Trebuchet MS, sans-serif';
  ctx.fillText('A/D move · W jump · J attack · K/L skills · U ult · P pause · M mute', 700, 700);
  // Announce banner (ROUND 1 — FIGHT!).
  if (s.announceT > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, s.announceT * 2);
    ctx.fillStyle = '#fff3d6'; ctx.font = '900 44px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
    ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(20,8,0,0.9)';
    ctx.strokeText(s.announce, 640, 300); ctx.fillText(s.announce, 640, 300);
    ctx.restore();
  }
}
