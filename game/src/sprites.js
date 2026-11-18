// EMBERCLASH — procedural character art: every hero and enemy drawn from shapes.
// One job: draw one fighter (body, head, weapon, glow, walk/hurt animation).
import { fighterCenter } from './fighter.js';

function limb(ctx, x, y, len, ang, color, w = 7) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); ctx.stroke();
}

/** Draw a fighter at its position. opts: {big} for select-screen portraits. */
export function drawFighter(ctx, f, t, opts = {}) {
  const s = opts.big ? 1.7 : 1;
  const cx = f.x; const feet = f.y;
  const bob = f.onGround ? Math.abs(Math.sin(f.walkPhase)) * 5 * s : 0;
  const hurt = f.hurtT > 0;
  const frozen = f.frozenT > 0;
  const col = f.def.color; const glow = f.def.glow; const dark = f.def.dark;
  const dir = f.facing;
  ctx.save();
  ctx.translate(cx, feet - bob);
  if (hurt) ctx.globalAlpha = 0.75;
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, bob + 4, 34 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill();
  // Glow aura when ult ready or guarding.
  if ((f.isPlayer && f.ult >= 100) || f.guardT > 0) {
    ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 30;
    ctx.strokeStyle = glow; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -48 * s, 52 * s, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  const legSwing = f.onGround && Math.abs(f.vx) > 20 ? Math.sin(f.walkPhase) * 0.7 : 0;
  // Legs.
  limb(ctx, -6 * s, -34 * s, 34 * s, Math.PI / 2 + legSwing * 0.4, dark, 8 * s);
  limb(ctx, 6 * s, -34 * s, 34 * s, Math.PI / 2 - legSwing * 0.4, dark, 8 * s);
  // Body (armoured torso).
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.roundRect(-20 * s, -78 * s, 40 * s, 48 * s, 10 * s); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-20 * s, -78 * s, 40 * s, 10 * s);
  // Belt + emblem.
  ctx.fillStyle = dark; ctx.fillRect(-20 * s, -38 * s, 40 * s, 8 * s);
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, -34 * s, 6 * s, 0, Math.PI * 2); ctx.fill();
  // Head with crest / horns by hero flavour.
  ctx.fillStyle = '#ffd9b0';
  ctx.beginPath(); ctx.arc(2 * s * dir, -92 * s, 15 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(2 * s * dir, -96 * s, 15 * s, Math.PI, Math.PI * 2); ctx.fill();
  // Crest plume.
  ctx.strokeStyle = glow; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -108 * s); ctx.quadraticCurveTo(-14 * s * dir, -126 * s, -4 * s * dir, -118 * s); ctx.stroke();
  // Eyes (angry).
  ctx.fillStyle = '#14102a';
  ctx.beginPath(); ctx.arc((6 * dir) * s, -94 * s, 2.6 * s, 0, Math.PI * 2); ctx.fill();
  // Arms + weapon, animated by attack swing.
  const swing = f.attackT > 0 ? Math.sin((0.3 - f.attackT) / 0.3 * Math.PI) * 1.6 : 0;
  const armAng = -0.5 * dir + swing * dir;
  limb(ctx, 10 * s * dir, -66 * s, 30 * s, armAng, '#ffd9b0', 7 * s);
  drawWeapon(ctx, f.def, 10 * s * dir + Math.cos(armAng) * 30 * s, -66 * s + Math.sin(armAng) * 30 * s, dir, swing, s);
  // Back arm.
  limb(ctx, -10 * s * dir, -66 * s, 26 * s, 0.9 * dir, '#e8b48c', 7 * s);
  // Burn / freeze status tint.
  if (f.burnT > 0) { ctx.fillStyle = 'rgba(255,110,20,0.35)'; ctx.beginPath(); ctx.arc(0, -55 * s, 34 * s, 0, Math.PI * 2); ctx.fill(); }
  if (frozen) { ctx.fillStyle = 'rgba(140,220,255,0.45)'; ctx.beginPath(); ctx.arc(0, -55 * s, 36 * s, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  if (opts.big) return;
  // HP mini-bar above non-player fighters.
  if (!f.isPlayer) {
    const w = 64;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(f.x - w / 2, f.y - 128, w, 9);
    ctx.fillStyle = f.hp / f.maxHp > 0.5 ? '#7dff6a' : f.hp / f.maxHp > 0.25 ? '#ffd94d' : '#ff3b30';
    ctx.fillRect(f.x - w / 2 + 1, f.y - 127, (w - 2) * (f.hp / f.maxHp), 7);
  }
}

/** Weapon shapes per hero id (fallback: generic blade). */
function drawWeapon(ctx, def, x, y, dir, swing, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(dir * (0.7 + swing * 0.9));
  ctx.shadowColor = def.glow; ctx.shadowBlur = 14;
  const L = 46 * s;
  switch (def.id) {
    case 'volt': // maul
      ctx.fillStyle = '#7a5230'; ctx.fillRect(-3 * s, 0, 6 * s, 30 * s);
      ctx.fillStyle = def.color; ctx.beginPath(); ctx.roundRect(-20 * s, -22 * s, 40 * s, 24 * s, 6 * s); ctx.fill();
      ctx.fillStyle = def.glow; ctx.fillRect(-20 * s, -12 * s, 40 * s, 5 * s);
      break;
    case 'luma': // bow
      ctx.strokeStyle = def.color; ctx.lineWidth = 5 * s;
      ctx.beginPath(); ctx.arc(0, 0, 26 * s, -1.2, 1.2); ctx.stroke();
      ctx.strokeStyle = def.glow; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(Math.cos(-1.2) * 26 * s, Math.sin(-1.2) * 26 * s); ctx.lineTo(Math.cos(1.2) * 26 * s, Math.sin(1.2) * 26 * s); ctx.stroke();
      break;
    case 'magma': // gauntlet fist
      ctx.fillStyle = def.color; ctx.beginPath(); ctx.arc(4 * s, 0, 13 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = def.glow; ctx.beginPath(); ctx.arc(8 * s, -4 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
      break;
    case 'frost': // spear
      ctx.fillStyle = '#c8b28a'; ctx.fillRect(-3 * s, -6 * s, 6 * s, 44 * s);
      ctx.fillStyle = def.glow; ctx.beginPath(); ctx.moveTo(0, -34 * s); ctx.lineTo(8 * s, -6 * s); ctx.lineTo(-8 * s, -6 * s); ctx.closePath(); ctx.fill();
      break;
    default: // saber / generic blade
      ctx.fillStyle = '#5a3a22'; ctx.fillRect(-3 * s, 0, 6 * s, 14 * s);
      ctx.fillStyle = def.color; ctx.beginPath(); ctx.moveTo(0, -L); ctx.lineTo(7 * s, -6 * s); ctx.lineTo(-7 * s, -6 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-1.5 * s, -L + 4, 3 * s, L - 14);
      break;
  }
  ctx.restore();
}
