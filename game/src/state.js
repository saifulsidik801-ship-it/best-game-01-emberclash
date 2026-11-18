// EMBERCLASH — run state: screens, score, round flow, feats.
// One job: the single state object every screen reads and writes.
import { freshMods } from './relics.js';
import { loadSave } from './storage.js';

export const SCREENS = {
  TITLE: 'title', SELECT: 'select', DIFF: 'diff', PLAY: 'play',
  UPGRADE: 'upgrade', PAUSE: 'pause', WIN: 'win', LOSE: 'lose',
  ALMANAC: 'almanac', OPTIONS: 'options', HISTORY: 'history',
};

export function freshState() {
  return {
    screen: SCREENS.TITLE, prevScreen: SCREENS.TITLE,
    save: loadSave(),
    heroId: 'pyra', difficulty: 'blaze', endless: false,
    round: 1, wave: 0, score: 0, kills: 0, bestCombo: 0,
    combo: 0, comboT: 0, timer: 60, roundWon: false, roundLost: false,
    mods: freshMods(), relics: [], draft: [],
    ladder: [], enemyDef: null, bossPhase: 0,
    t: 0, shake: 0, flash: 0, announce: '', announceT: 0,
    featsUnlocked: [], damageDealt: 0, damageTaken: 0,
    runSeed: 'emberclash-' + Date.now(),
  };
}

export const FEATS = [
  { id: 'firstWin', name: 'First Crown', desc: 'Win your first tournament.' },
  { id: 'bossSlayer', name: 'Boss Slayer', desc: 'Defeat ASHLORD.' },
  { id: 'endless5', name: 'Endless V', desc: 'Survive 5 endless waves.' },
  { id: 'flawless', name: 'Flawless', desc: 'Win a round without taking damage.' },
  { id: 'relicMaster', name: 'Relic Master', desc: 'Hold 5 relics in one run.' },
  { id: 'combo20', name: 'Combo King', desc: 'Reach a 20-hit combo.' },
];

export function unlockFeat(state, id) {
  if (!state.save.feats[id]) {
    state.save.feats[id] = true;
    state.featsUnlocked.push(id);
  }
}
