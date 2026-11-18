// EMBERCLASH — between-round upgrade draft.
// One job: roll the 3-choice draft and apply the picked relic.
import { draftRelics } from './relics.js';
import { makeRng } from './rng.js';
import { unlockFeat } from './state.js';

export function startDraft(state) {
  const rng = makeRng(state.runSeed + '-draft-' + state.round);
  state.draft = draftRelics(rng, state.relics.map((r) => r.id));
  state.screen = 'upgrade';
}

export function pickRelic(state, relic) {
  relic.apply(state.mods);
  // Ember Heart also heals via apply; re-sync fighter max HP in world.
  state.relics.push(relic);
  state.draft = [];
  if (state.relics.length >= 5) unlockFeat(state, 'relicMaster');
}
