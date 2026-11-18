// EMBERCLASH — arena themes, crowd and background.
// One job: the look of each arena (sky, stands, torches, floor) per round.
import { ARENA, VIEW } from './config.js';

export const ARENAS = [
  { id: 'ember', name: 'Ember Court', sky: ['#ffb347', '#ff8a3d', '#c24a7a'], floor: '#7a4030', floorLine: '#ffc21a', crowd: 46, music: 'ember' },
  { id: 'blaze', name: 'Blaze Colosseum', sky: ['#ffe14d', '#ff9a2a', '#7a2a8a'], floor: '#6b3548', floorLine: '#ffe14d', crowd: 58, music: 'blaze' },
  { id: 'inferno', name: 'Inferno Peak', sky: ['#ff6a4d', '#c22a5e', '#4a2060'], floor: '#4d2848', floorLine: '#ff3b30', crowd: 66, music: 'inferno' },
  { id: 'boss', name: 'Throne of Ash', sky: ['#c98aff', '#8a3ab0', '#3a1a5e'], floor: '#3a2050', floorLine: '#b678ff', crowd: 72, music: 'boss' },
];

export function arenaFor(round, totalRounds) {
  if (round >= totalRounds) return ARENAS[3];
  return ARENAS[(round - 1) % 3];
}

/** Draw the arena background: sky, sun, stands full of crowd, torches, floor. */
export function drawArena(ctx, arena, t, crowdSeed) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW.h);
  g.addColorStop(0, arena.sky[0]); g.addColorStop(0.55, arena.sky[1]); g.addColorStop(1, arena.sky[2]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  // Big glowing sun / ember moon.
  ctx.save();
  ctx.shadowColor = '#ffd94d'; ctx.shadowBlur = 90;
  ctx.fillStyle = 'rgba(255,217,77,0.95)';
  ctx.beginPath(); ctx.arc(640, 130, 52 + Math.sin(t * 1.4) * 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Distant towers.
  ctx.fillStyle = 'rgba(30,10,40,0.55)';
  for (let i = 0; i < 7; i += 1) {
    const x = 40 + i * 180; const h = 120 + ((i * 67) % 90);
    ctx.fillRect(x, 300 - h, 70, h + 60);
    ctx.beginPath(); ctx.moveTo(x - 6, 300 - h); ctx.lineTo(x + 35, 300 - h - 34); ctx.lineTo(x + 76, 300 - h); ctx.closePath(); ctx.fill();
  }
  // Stands: two tiers packed with crowd dots that bounce.
  for (let tier = 0; tier < 2; tier += 1) {
    const y0 = 330 + tier * 62;
    ctx.fillStyle = tier === 0 ? 'rgba(60,24,60,0.85)' : 'rgba(80,30,80,0.85)';
    ctx.fillRect(0, y0, VIEW.w, 62);
    for (let i = 0; i < arena.crowd; i += 1) {
      const px = ((i * 97 + crowdSeed * 13 + tier * 41) % 1260) + 10;
      const bounce = Math.abs(Math.sin(t * 3 + i * 1.7 + tier)) * (i % 5 === 0 ? 10 : 4);
      const hue = (i * 47 + crowdSeed) % 360;
      ctx.fillStyle = `hsl(${hue},85%,${55 + (i % 3) * 8}%)`;
      ctx.beginPath(); ctx.arc(px, y0 + 34 - bounce, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(px - 8, y0 + 40 - bounce, 16, 16);
    }
  }
  // Torches with flame flicker.
  for (let i = 0; i < 6; i += 1) {
    const x = 110 + i * 216;
    ctx.fillStyle = '#3a2410'; ctx.fillRect(x - 4, 470, 8, 60);
    const fl = 16 + Math.sin(t * 9 + i * 2.2) * 5;
    ctx.save(); ctx.shadowColor = '#ff7a1a'; ctx.shadowBlur = 26;
    ctx.fillStyle = i % 2 ? '#ffc21a' : '#ff7a1a';
    ctx.beginPath(); ctx.ellipse(x, 462 - fl / 2, 10, fl, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // Floor: warm boards + glowing centre line + side glow.
  ctx.fillStyle = arena.floor; ctx.fillRect(0, ARENA.floorY + 30, VIEW.w, VIEW.h - ARENA.floorY - 30);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i < 12; i += 1) ctx.fillRect(40 + i * 105, ARENA.floorY + 34, 4, 86);
  ctx.fillStyle = arena.floorLine; ctx.fillRect(0, ARENA.floorY + 28, VIEW.w, 5);
  ctx.save(); ctx.shadowColor = arena.floorLine; ctx.shadowBlur = 18;
  ctx.fillStyle = arena.floorLine; ctx.beginPath(); ctx.ellipse(640, ARENA.floorY + 30, 320, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Arena name banner ribbon.
  ctx.fillStyle = 'rgba(10,4,24,0.55)'; ctx.fillRect(430, 8, 420, 30);
  ctx.fillStyle = '#fff3d6'; ctx.font = '900 17px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`★ ${arena.name.toUpperCase()} ★`, 640, 29);
}
