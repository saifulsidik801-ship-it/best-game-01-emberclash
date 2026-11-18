// EMBERCLASH — projectiles: arrows, fireballs, lightning bolts, ice shards.
// One job: spawn, move, collide and draw every flying object.
export class Projectiles {
  constructor() { this.list = []; }
  clear() { this.list.length = 0; }
  spawn(p) { this.list.push({ ...p, age: 0, dead: false }); }
  update(dt, arena, onHit) {
    for (const pr of this.list) {
      pr.age += dt;
      pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.vy += (pr.grav || 0) * dt;
      if (pr.x < -60 || pr.x > 1340 || pr.y > arena.floorY + 40 || pr.age > 4) pr.dead = true;
      else if (onHit) onHit(pr);
    }
    this.list = this.list.filter((p) => !p.dead);
  }
  draw(ctx) {
    for (const pr of this.list) {
      ctx.save();
      ctx.translate(pr.x, pr.y);
      ctx.rotate(Math.atan2(pr.vy, pr.vx));
      ctx.shadowColor = pr.color; ctx.shadowBlur = 16;
      if (pr.kind === 'arrow') {
        ctx.fillStyle = pr.color; ctx.fillRect(-14, -2, 26, 4);
        ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(6, -6); ctx.lineTo(6, 6); ctx.closePath(); ctx.fill();
      } else if (pr.kind === 'bolt') {
        ctx.strokeStyle = pr.color; ctx.lineWidth = 5; ctx.beginPath();
        ctx.moveTo(-16, 0); ctx.lineTo(-6, -8); ctx.lineTo(2, 6); ctx.lineTo(14, -2); ctx.stroke();
      } else {
        ctx.fillStyle = pr.color; ctx.beginPath(); ctx.arc(0, 0, pr.size || 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(0, 0, (pr.size || 9) * 0.45, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    ctx.shadowBlur = 0;
  }
}
