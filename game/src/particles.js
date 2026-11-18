// EMBERCLASH — particles, floating text, shockwaves and trails.
// One job: spawn, update and draw every transient visual effect.
import { rand } from './config.js';

export class Particles {
  constructor() { this.list = []; this.texts = []; this.rings = []; this.trails = []; }
  clear() { this.list.length = 0; this.texts.length = 0; this.rings.length = 0; this.trails.length = 0; }
  burst(x, y, n, color, speed = 260, life = 0.6, size = 5, grav = 500) {
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2; const s = speed * (0.3 + Math.random() * 0.9);
      this.list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: life * (0.5 + Math.random() * 0.8), max: life, size: size * (0.5 + Math.random()), color, grav, glow: true });
    }
  }
  embers(x, y, n, color) { this.burst(x, y, n, color, 160, 0.9, 4, -60); }
  sparks(x, y, color, n = 10) { this.burst(x, y, n, color, 420, 0.35, 3, 200); }
  smoke(x, y, n = 6) { for (let i = 0; i < n; i += 1) this.list.push({ x: x + (Math.random() - 0.5) * 30, y, vx: (Math.random() - 0.5) * 40, vy: -40 - Math.random() * 60, life: 1.1, max: 1.1, size: 14 + Math.random() * 12, color: 'rgba(120,110,130,0.5)', grav: -40, glow: false }); }
  ring(x, y, color, maxR = 120) { this.rings.push({ x, y, r: 8, maxR, life: 0.45, max: 0.45, color }); }
  text(x, y, str, color = '#fff3d6', size = 22) { this.texts.push({ x, y, str, color, size, life: 0.9, max: 0.9 }); }
  trail(x, y, color, size = 10) { this.trails.push({ x, y, color, size, life: 0.28, max: 0.28 }); if (this.trails.length > 220) this.trails.shift(); }
  ambient(rng, w, floorY) {
    // Drifting embers that keep the arena alive even when nobody moves.
    if (this.list.length < 260 && Math.random() < 0.5) {
      this.list.push({ x: rand(rng, 0, w), y: floorY - rand(rng, 0, 320), vx: (Math.random() - 0.5) * 24, vy: -14 - Math.random() * 26, life: 2.4, max: 2.4, size: 2 + Math.random() * 3, color: Math.random() < 0.7 ? '#ffc21a' : '#ff7a1a', grav: -12, glow: true });
    }
  }
  update(dt) {
    for (const p of this.list) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.grav * dt; }
    this.list = this.list.filter((p) => p.life > 0);
    for (const t of this.texts) { t.life -= dt; t.y -= 55 * dt; }
    this.texts = this.texts.filter((t) => t.life > 0);
    for (const r of this.rings) { r.life -= dt; r.r += (r.maxR - r.r) * dt * 14; }
    this.rings = this.rings.filter((r) => r.life > 0);
    for (const t of this.trails) t.life -= dt;
    this.trails = this.trails.filter((t) => t.life > 0);
  }
  draw(ctx) {
    for (const t of this.trails) { ctx.globalAlpha = (t.life / t.max) * 0.55; ctx.fillStyle = t.color; ctx.beginPath(); ctx.arc(t.x, t.y, t.size * (t.life / t.max), 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    for (const p of this.list) {
      const a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = a;
      if (p.glow) { ctx.shadowColor = p.color; ctx.shadowBlur = 12; } else ctx.shadowBlur = 0;
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.4 + a * 0.6), 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    for (const r of this.rings) {
      ctx.globalAlpha = Math.max(0, r.life / r.max) * 0.9; ctx.strokeStyle = r.color; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (const t of this.texts) {
      ctx.globalAlpha = Math.max(0, t.life / t.max);
      ctx.font = `900 ${t.size}px Trebuchet MS, sans-serif`; ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(20,8,0,0.85)'; ctx.strokeText(t.str, t.x, t.y);
      ctx.fillStyle = t.color; ctx.fillText(t.str, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }
}
