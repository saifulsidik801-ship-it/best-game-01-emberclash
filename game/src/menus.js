// EMBERCLASH — all menu screens: title, hero select, difficulty, upgrade, pause,
// win, lose, almanac, options, history. One job: draw a screen, return its buttons.
import { VIEW, DIFFICULTY, DIFF_ORDER, LADDER_ROUNDS } from './config.js';
import { HEROES } from './heroes.js';
import { ENEMIES, BOSS } from './enemies.js';
import { RELICS } from './relics.js';
import { FEATS } from './state.js';
import { drawFighter } from './sprites.js';

export function panel(ctx, x, y, w, h, alpha = 0.82) {
  ctx.fillStyle = `rgba(16,8,36,${alpha})`;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(255,194,26,0.7)'; ctx.lineWidth = 2; ctx.stroke();
}
export function button(ctx, input, id, x, y, w, h, label, opts = {}) {
  const hover = input.hoverIn({ x, y, w, h });
  ctx.fillStyle = opts.hot ? '#ffc21a' : hover ? '#ff8a2a' : '#ff5e1a';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = opts.hot ? '#14102a' : '#fff';
  ctx.font = `900 ${opts.size || 20}px Trebuchet MS, sans-serif`; ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + (opts.size || 20) * 0.35);
  return { id, rect: { x, y, w, h } };
}
function titleText(ctx, text, y, size, color, stroke = true) {
  ctx.font = `900 ${size}px Trebuchet MS, sans-serif`; ctx.textAlign = 'center';
  if (stroke) { ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(20,8,0,0.9)'; ctx.strokeText(text, 640, y); }
  ctx.fillStyle = color; ctx.fillText(text, 640, y);
}

export function drawTitle(ctx, input, state) {
  titleText(ctx, '🔥 EMBERCLASH 🔥', 150, 76, '#ffc21a');
  titleText(ctx, 'ARENA OF THE LAST LIGHT', 195, 30, '#fff3d6');
  ctx.font = '18px Trebuchet MS, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe9b0';
  ctx.fillText('Five heroes. Seven rounds. One champion. Beat every rival, slay ASHLORD, take the crown!', 640, 232);
  ctx.fillText('Free brawler — no downloads, no sign-up. Pick a hero and fight!', 640, 258);
  const btns = [];
  btns.push(button(ctx, input, 'play', 490, 300, 300, 64, '▶  FIGHT!', { hot: true, size: 28 }));
  btns.push(button(ctx, input, 'howto', 490, 380, 300, 48, 'HOW TO PLAY'));
  btns.push(button(ctx, input, 'almanac', 330, 444, 300, 48, '📖 ALMANAC'));
  btns.push(button(ctx, input, 'history', 650, 444, 300, 48, '🏆 HISTORY'));
  btns.push(button(ctx, input, 'options', 490, 508, 300, 48, '⚙ OPTIONS'));
  panel(ctx, 330, 576, 620, 84, 0.7);
  ctx.fillStyle = '#fff3d6'; ctx.font = '16px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`Best score: ${state.save.bestScore}   •   Best round: ${state.save.bestRound}   •   Wins: ${state.save.wins}   •   Runs: ${state.save.runs}`, 640, 606);
  ctx.fillText('Feats unlocked: ' + FEATS.filter((f) => state.save.feats[f.id]).map((f) => f.name).join(' · ') || 'Feats unlocked: none yet — go win one!', 640, 632);
  ctx.fillStyle = '#ffb27a'; ctx.font = '14px Trebuchet MS, sans-serif';
  ctx.fillText('A/D move · W jump · J attack · K/L skills · U ultimate · P pause', 640, 686);
  return btns;
}

export function drawHowTo(ctx, input) {
  panel(ctx, 240, 90, 800, 540, 0.88);
  titleText(ctx, 'HOW TO PLAY', 150, 40, '#ffc21a');
  const lines = [
    ['GOAL', 'Defeat all 6 rivals, then slay the boss ASHLORD in round 7 and become Champion of the Arena.'],
    ['MOVE', 'A / D or ← / → to move, W / ↑ / Space to jump (double-jump with Sky Feather).'],
    ['ATTACK', 'J to strike. Chain hits to build a COMBO — bigger combos mean bigger score.'],
    ['SKILLS', 'K = skill 1, L = skill 2 (each hero has unique skills). U = ULTIMATE when the meter is full.'],
    ['BETWEEN ROUNDS', 'Pick 1 of 3 relics after every win. Relics stack — build your hero your way.'],
    ['ENDLESS', 'After the crown, keep fighting endless waves for a high score.'],
    ['TIMER', '60 seconds per round. If time runs out, the fighter with more HP wins the round.'],
    ['TOUCH', 'Tap buttons to navigate; on touch, left/right halves of the screen move you, tap the foe to attack.'],
  ];
  ctx.textAlign = 'left';
  lines.forEach(([h, b], i) => {
    const y = 210 + i * 46;
    ctx.fillStyle = '#ffc21a'; ctx.font = '900 17px Trebuchet MS, sans-serif'; ctx.fillText(h, 280, y);
    ctx.fillStyle = '#fff3d6'; ctx.font = '16px Trebuchet MS, sans-serif';
    ctx.fillText(b, 400, y);
  });
  return [button(ctx, input, 'back', 540, 580, 200, 48, '← BACK')];
}

export function drawSelect(ctx, input, state) {
  titleText(ctx, 'CHOOSE YOUR HERO', 90, 44, '#ffc21a');
  ctx.font = '18px Trebuchet MS, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe9b0';
  ctx.fillText('Every hero fights differently — pick the one that fits your style.', 640, 122);
  const btns = [];
  HEROES.forEach((h, i) => {
    const x = 60 + i * 244; const y = 150; const w = 224; const hh = 330;
    const sel = state.heroId === h.id;
    ctx.fillStyle = sel ? 'rgba(255,194,26,0.25)' : 'rgba(16,8,36,0.82)';
    ctx.beginPath(); ctx.roundRect(x, y, w, hh, 16); ctx.fill();
    ctx.strokeStyle = sel ? '#ffc21a' : h.color; ctx.lineWidth = sel ? 4 : 2; ctx.stroke();
    // Portrait: draw the fighter big.
    const fake = { def: h, x: x + w / 2, y: y + 210, vx: 0, facing: 1, onGround: true, walkPhase: 0, hurtT: 0, frozenT: 0, burnT: 0, guardT: 0, ult: 0, isPlayer: true, attackT: 0 };
    drawFighter(ctx, fake, 0, { big: true });
    ctx.fillStyle = h.color; ctx.font = '900 26px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(h.name, x + w / 2, y + 52);
    ctx.fillStyle = '#fff3d6'; ctx.font = '15px Trebuchet MS, sans-serif';
    ctx.fillText(h.title, x + w / 2, y + 76);
    ctx.fillStyle = '#ffe9b0'; ctx.font = '13px Trebuchet MS, sans-serif';
    wrapText(ctx, h.desc, x + 12, y + 250, w - 24, 17);
    ctx.fillStyle = '#cfc4e8'; ctx.font = '13px Trebuchet MS, sans-serif';
    ctx.fillText(`HP ${h.hp} · ATK ${h.atk} · SPD ${h.speed}`, x + w / 2, y + 300);
    ctx.fillText(`K: ${h.skill1.name} · L: ${h.skill2.name}`, x + w / 2, y + 320);
    btns.push({ id: 'hero:' + h.id, rect: { x, y, w, h: hh } });
  });
  btns.push(button(ctx, input, 'todiff', 440, 520, 400, 60, 'NEXT: DIFFICULTY ▶', { hot: true, size: 22 }));
  btns.push(button(ctx, input, 'back', 540, 596, 200, 44, '← BACK'));
  return btns;
}

export function drawDiff(ctx, input, state) {
  titleText(ctx, 'CHOOSE DIFFICULTY', 110, 44, '#ffc21a');
  const btns = [];
  DIFF_ORDER.forEach((key, i) => {
    const d = DIFFICULTY[key]; const x = 190 + i * 320; const y = 180;
    const sel = state.difficulty === key;
    ctx.fillStyle = sel ? 'rgba(255,194,26,0.25)' : 'rgba(16,8,36,0.82)';
    ctx.beginPath(); ctx.roundRect(x, y, 280, 240, 16); ctx.fill();
    ctx.strokeStyle = sel ? '#ffc21a' : '#ff7a1a'; ctx.lineWidth = sel ? 4 : 2; ctx.stroke();
    ctx.fillStyle = '#ffc21a'; ctx.font = '900 30px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(d.label, x + 140, y + 60);
    ctx.fillStyle = '#fff3d6'; ctx.font = '17px Trebuchet MS, sans-serif';
    ctx.fillText(d.sub, x + 140, y + 92);
    ctx.fillStyle = '#ffe9b0'; ctx.font = '15px Trebuchet MS, sans-serif';
    ctx.fillText(`Enemy HP ×${d.hp} · DMG ×${d.dmg}`, x + 140, y + 140);
    ctx.fillText(`Score ×${d.score} · Heal ${d.heal}`, x + 140, y + 168);
    btns.push({ id: 'diff:' + key, rect: { x, y, w: 280, h: 240 } });
  });
  const end = { id: 'endlesstoggle', rect: { x: 440, y: 450, w: 400, h: 52 } };
  ctx.fillStyle = state.endless ? '#ffc21a' : 'rgba(16,8,36,0.82)';
  ctx.beginPath(); ctx.roundRect(440, 450, 400, 52, 12); ctx.fill();
  ctx.fillStyle = state.endless ? '#14102a' : '#fff3d6'; ctx.font = '900 20px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(state.endless ? '☑ ENDLESS MODE: ON (waves after the crown)' : '☐ ENDLESS MODE: OFF', 640, 483);
  btns.push(end);
  btns.push(button(ctx, input, 'start', 440, 530, 400, 64, '⚔ START THE FIGHT!', { hot: true, size: 24 }));
  btns.push(button(ctx, input, 'back', 540, 610, 200, 44, '← BACK'));
  return btns;
}

export function drawUpgrade(ctx, input, state) {
  titleText(ctx, `ROUND ${state.round - 1} WON!`, 100, 46, '#7dff6a');
  ctx.font = '19px Trebuchet MS, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe9b0';
  ctx.fillText('Choose a relic — it stays with you for the rest of the run.', 640, 140);
  const btns = [];
  state.draft.forEach((r, i) => {
    const x = 190 + i * 320; const y = 180; const w = 280; const h = 280;
    ctx.fillStyle = 'rgba(16,8,36,0.85)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fill();
    ctx.strokeStyle = r.color; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = r.color; ctx.font = '54px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(r.icon, x + w / 2, y + 90);
    ctx.fillStyle = '#ffc21a'; ctx.font = '900 22px Trebuchet MS, sans-serif';
    ctx.fillText(r.name, x + w / 2, y + 140);
    ctx.fillStyle = '#fff3d6'; ctx.font = '16px Trebuchet MS, sans-serif';
    wrapText(ctx, r.desc, x + 16, y + 180, w - 32, 22);
    btns.push({ id: 'relic:' + i, rect: { x, y, w, h } });
  });
  ctx.fillStyle = '#cfc4e8'; ctx.font = '16px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Your relics: ' + (state.relics.map((r) => r.name).join(' · ') || 'none yet'), 640, 500);
  ctx.fillText(`Score ${state.score} · Next: Round ${state.round}${state.round > LADDER_ROUNDS ? ' — ASHLORD!' : ''}`, 640, 528);
  return btns;
}

export function drawPause(ctx, input, state) {
  panel(ctx, 390, 170, 500, 380, 0.9);
  titleText(ctx, '⏸ PAUSED', 240, 40, '#ffc21a');
  ctx.fillStyle = '#fff3d6'; ctx.font = '18px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`Round ${state.round} · Score ${state.score}`, 640, 290);
  const btns = [];
  btns.push(button(ctx, input, 'resume', 490, 320, 300, 52, '▶ RESUME', { hot: true }));
  btns.push(button(ctx, input, 'restart', 490, 386, 300, 52, '↻ RESTART RUN'));
  btns.push(button(ctx, input, 'quit', 490, 452, 300, 52, '✕ QUIT TO TITLE'));
  return btns;
}

export function drawWin(ctx, input, state) {
  titleText(ctx, '🏆 CHAMPION! 🏆', 130, 64, '#ffc21a');
  ctx.font = '22px Trebuchet MS, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff3d6';
  ctx.fillText('You defeated ASHLORD and took the crown of the Arena of the Last Light!', 640, 190);
  panel(ctx, 390, 220, 500, 190, 0.85);
  ctx.fillStyle = '#ffd94d'; ctx.font = '900 24px Trebuchet MS, sans-serif';
  ctx.fillText(`FINAL SCORE: ${state.score}`, 640, 268);
  ctx.fillStyle = '#fff3d6'; ctx.font = '18px Trebuchet MS, sans-serif';
  ctx.fillText(`Hero: ${state.heroId.toUpperCase()} · Difficulty: ${DIFFICULTY[state.difficulty].label}`, 640, 306);
  ctx.fillText(`KOs: ${state.kills} · Best combo: ${state.bestCombo} · Relics: ${state.relics.length}`, 640, 338);
  ctx.fillText('Feats: ' + (state.featsUnlocked.map((id) => FEATS.find((f) => f.id === id).name).join(' · ') || 'none this run'), 640, 372);
  const btns = [];
  btns.push(button(ctx, input, 'endlessgo', 440, 440, 400, 56, '♾ CONTINUE: ENDLESS MODE', { hot: true }));
  btns.push(button(ctx, input, 'again', 440, 510, 400, 56, '↻ PLAY AGAIN'));
  btns.push(button(ctx, input, 'title', 440, 580, 400, 48, 'TITLE SCREEN'));
  return btns;
}

export function drawLose(ctx, input, state) {
  titleText(ctx, '💥 KNOCKED OUT', 130, 60, '#ff3b30');
  ctx.font = '22px Trebuchet MS, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff3d6';
  const who = state.enemyDef ? state.enemyDef.name : 'THE ARENA';
  ctx.fillText(`${who} takes this round. The crowd still chants your name — come back stronger!`, 640, 190);
  panel(ctx, 390, 220, 500, 160, 0.85);
  ctx.fillStyle = '#ffd94d'; ctx.font = '900 24px Trebuchet MS, sans-serif';
  ctx.fillText(`SCORE: ${state.score}`, 640, 268);
  ctx.fillStyle = '#fff3d6'; ctx.font = '18px Trebuchet MS, sans-serif';
  ctx.fillText(`Reached round ${state.round} · KOs: ${state.kills} · Best combo: ${state.bestCombo}`, 640, 306);
  ctx.fillText('Tip: grab Guard Plate or Vampire Fang next run — survival wins tournaments.', 640, 338);
  const btns = [];
  btns.push(button(ctx, input, 'again', 440, 420, 400, 56, '↻ REMATCH', { hot: true }));
  btns.push(button(ctx, input, 'title', 440, 490, 400, 48, 'TITLE SCREEN'));
  return btns;
}

export function drawAlmanac(ctx, input, state) {
  titleText(ctx, '📖 ALMANAC — RIVALS & RELICS', 90, 40, '#ffc21a');
  ctx.textAlign = 'left';
  panel(ctx, 60, 120, 580, 300, 0.85);
  ctx.fillStyle = '#ffc21a'; ctx.font = '900 20px Trebuchet MS, sans-serif'; ctx.fillText('RIVALS', 90, 152);
  ENEMIES.forEach((e, i) => {
    ctx.fillStyle = e.color; ctx.font = '900 17px Trebuchet MS, sans-serif'; ctx.fillText(e.name, 90, 186 + i * 36);
    ctx.fillStyle = '#fff3d6'; ctx.font = '15px Trebuchet MS, sans-serif';
    ctx.fillText(`${e.title} — HP ${e.hp} · ATK ${e.atk} · ${e.style}`, 190, 186 + i * 36);
  });
  ctx.fillStyle = '#ff2e63'; ctx.font = '900 17px Trebuchet MS, sans-serif'; ctx.fillText('ASHLORD', 90, 186 + 6 * 36);
  ctx.fillStyle = '#fff3d6'; ctx.font = '15px Trebuchet MS, sans-serif';
  ctx.fillText(`${BOSS.title} — HP ${BOSS.hp} · ATK ${BOSS.atk} · final boss`, 190, 186 + 6 * 36);
  panel(ctx, 660, 120, 560, 300, 0.85);
  ctx.fillStyle = '#ffc21a'; ctx.font = '900 20px Trebuchet MS, sans-serif'; ctx.fillText('RELICS (14)', 690, 152);
  RELICS.forEach((r, i) => {
    const col = i % 2; const x = 690 + col * 280; const y = 186 + Math.floor(i / 2) * 32;
    ctx.fillStyle = r.color; ctx.font = '17px Trebuchet MS, sans-serif'; ctx.fillText(r.icon + ' ' + r.name, x, y);
  });
  panel(ctx, 60, 440, 1160, 150, 0.85);
  ctx.fillStyle = '#ffc21a'; ctx.font = '900 20px Trebuchet MS, sans-serif'; ctx.fillText('FEATS', 90, 472);
  FEATS.forEach((f, i) => {
    const done = state.save.feats[f.id];
    ctx.fillStyle = done ? '#7dff6a' : '#8f86ad'; ctx.font = '16px Trebuchet MS, sans-serif';
    ctx.fillText(`${done ? '★' : '☆'} ${f.name} — ${f.desc}`, 90 + (i % 3) * 390, 502 + Math.floor(i / 3) * 32);
  });
  return [button(ctx, input, 'back', 540, 612, 200, 48, '← BACK')];
}

export function drawOptions(ctx, input, state) {
  panel(ctx, 390, 150, 500, 380, 0.9);
  titleText(ctx, '⚙ OPTIONS', 220, 40, '#ffc21a');
  const btns = [];
  btns.push(button(ctx, input, 'mute', 490, 260, 300, 52, state.save.muted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON'));
  const d = DIFFICULTY[state.difficulty];
  btns.push(button(ctx, input, 'diffcycle', 490, 330, 300, 52, `DIFFICULTY: ${d.label}`));
  ctx.fillStyle = '#fff3d6'; ctx.font = '16px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Sound is 100% procedural WebAudio.', 640, 420);
  ctx.fillText('No files, no downloads, no network.', 640, 446);
  btns.push(button(ctx, input, 'back', 490, 470, 300, 48, '← BACK'));
  return btns;
}

export function drawHistory(ctx, input, state) {
  panel(ctx, 290, 110, 700, 500, 0.9);
  titleText(ctx, '🏆 RUN HISTORY', 170, 40, '#ffc21a');
  ctx.textAlign = 'left';
  const rows = state.save.history;
  if (rows.length === 0) {
    ctx.fillStyle = '#fff3d6'; ctx.font = '18px Trebuchet MS, sans-serif';
    ctx.fillText('No runs yet — your first fight writes history!', 330, 240);
  }
  rows.forEach((r, i) => {
    ctx.fillStyle = r.won ? '#7dff6a' : '#fff3d6'; ctx.font = '17px Trebuchet MS, sans-serif';
    ctx.fillText(`${r.won ? '👑 WIN' : '💥 OUT'}  ${r.hero.toUpperCase()}  ·  Round ${r.round}  ·  Score ${r.score}  ·  ${r.date}`, 330, 220 + i * 36);
  });
  ctx.fillStyle = '#ffd94d'; ctx.font = '900 18px Trebuchet MS, sans-serif';
  ctx.fillText(`Best score ${state.save.bestScore} · Best round ${state.save.bestRound} · Wins ${state.save.wins} · Endless best ${state.save.endlessBest}`, 330, 220 + Math.max(rows.length, 1) * 36 + 20);
  return [button(ctx, input, 'back', 540, 540, 200, 48, '← BACK')];
}

function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = ''; let yy = y;
  ctx.textAlign = 'left';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; }
    else line = test;
  }
  ctx.fillText(line, x, yy);
  ctx.textAlign = 'center';
}
