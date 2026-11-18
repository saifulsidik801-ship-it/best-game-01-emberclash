// EMBERCLASH — persistence: run history, best score, feats, settings.
// One job: localStorage read/write behind a safe wrapper.
const KEY = 'emberclash-save-v1';

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshSave();
    const s = JSON.parse(raw);
    return { ...freshSave(), ...s, feats: { ...freshSave().feats, ...(s.feats || {}) } };
  } catch { return freshSave(); }
}
export function freshSave() {
  return {
    bestScore: 0, bestRound: 0, wins: 0, runs: 0, endlessBest: 0,
    muted: false, difficulty: 'blaze',
    feats: { firstWin: false, bossSlayer: false, endless5: false, flawless: false, relicMaster: false, combo20: false },
    history: [],
  };
}
export function storeSave(save) {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* private mode */ }
}
export function recordRun(save, run) {
  save.runs += 1;
  save.bestScore = Math.max(save.bestScore, run.score);
  save.bestRound = Math.max(save.bestRound, run.round);
  if (run.won) save.wins += 1;
  if (run.endless) save.endlessBest = Math.max(save.endlessBest, run.wave || 0);
  save.history.unshift({ score: run.score, round: run.round, hero: run.hero, won: run.won, date: new Date().toISOString().slice(0, 10) });
  save.history = save.history.slice(0, 8);
  storeSave(save);
}
