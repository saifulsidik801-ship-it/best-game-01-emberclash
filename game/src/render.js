// EMBERCLASH — render orchestration: background, fighters, effects, HUD, menus.
// One job: draw one frame for the current screen.
import { VIEW } from './config.js';
import { drawArena } from './arena.js';
import { drawFighter } from './sprites.js';
import { drawHUD } from './hud.js';
import * as menus from './menus.js';

export function render(ctx, world, input) {
  const s = world.state;
  ctx.save();
  // Screen shake.
  if (world.shake > 0) ctx.translate((Math.random() - 0.5) * world.shake, (Math.random() - 0.5) * world.shake);
  const inFight = ['play', 'pause', 'upgrade'].includes(s.screen) || (s.screen === 'win' || s.screen === 'lose') && world.player;
  if (inFight || s.screen === 'upgrade') {
    drawArena(ctx, world.arena, s.t, world.crowdSeed);
    if (world.player && !world.player.dead) drawFighter(ctx, world.player, s.t);
    if (world.enemy && !world.enemy.dead) drawFighter(ctx, world.enemy, s.t);
    world.projectiles.draw(ctx);
    world.particles.draw(ctx);
    if (s.screen === 'play' || s.screen === 'pause') drawHUD(ctx, world);
  } else {
    // Menu backdrop: bright arena with idle embers.
    drawArena(ctx, world.arena, s.t, world.crowdSeed);
    world.particles.draw(ctx);
  }
  ctx.restore();
  // Flash overlay (ult).
  if (world.flash > 0) { ctx.fillStyle = `rgba(255,220,120,${world.flash})`; ctx.fillRect(0, 0, VIEW.w, VIEW.h); }
  // Screens on top.
  let btns = [];
  switch (s.screen) {
    case 'title': btns = menus.drawTitle(ctx, input, s); break;
    case 'howto': btns = menus.drawHowTo(ctx, input); break;
    case 'select': btns = menus.drawSelect(ctx, input, s); break;
    case 'diff': btns = menus.drawDiff(ctx, input, s); break;
    case 'upgrade': btns = menus.drawUpgrade(ctx, input, s); break;
    case 'pause': btns = menus.drawPause(ctx, input, s); break;
    case 'win': btns = menus.drawWin(ctx, input, s); break;
    case 'lose': btns = menus.drawLose(ctx, input, s); break;
    case 'almanac': btns = menus.drawAlmanac(ctx, input, s); break;
    case 'options': btns = menus.drawOptions(ctx, input, s); break;
    case 'history': btns = menus.drawHistory(ctx, input, s); break;
    default: break;
  }
  // Feat toast.
  if (s.featsUnlocked.length > 0) {
    ctx.fillStyle = 'rgba(20,10,40,0.9)'; ctx.beginPath(); ctx.roundRect(390, 640, 500, 44, 12); ctx.fill();
    ctx.fillStyle = '#7dff6a'; ctx.font = '900 18px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`★ FEAT UNLOCKED: ${s.featsUnlocked[s.featsUnlocked.length - 1].toUpperCase()}`, 640, 668);
  }
  return btns;
}
