/**
 * Shared d6 pool mechanic for Zombicide Chronicles.
 *
 * Every roll classifies each die into one of three outcomes:
 *   - success     : the die meets the roll's success threshold
 *   - recoverable : a failure that can still be salvaged in play
 *   - failure     : a natural 1, always a hard failure
 *
 * Only the threshold changes between roll kinds:
 *   - action checks  → 6 (only a natural 6 succeeds)
 *   - weapon attacks → the weapon's accuracy
 */

export const DIE_OUTCOME = {
  SUCCESS: 'success',
  RECOVERABLE: 'recoverable',
  FAILURE: 'failure',
};

/** Only a natural 6 succeeds on an action check. */
export const ACTION_THRESHOLD = 6;

/**
 * Classify a single die result.
 * A natural 1 is always a hard failure, even if the threshold would allow it.
 * @param {number} result     The face value of the die.
 * @param {number} threshold  Minimum value counting as a success.
 * @returns {string} One of DIE_OUTCOME.
 */
export function classifyDie(result, threshold) {
  if (result === 1) return DIE_OUTCOME.FAILURE;
  if (result >= threshold) return DIE_OUTCOME.SUCCESS;
  return DIE_OUTCOME.RECOVERABLE;
}

/**
 * Tally the outcomes of an evaluated Roll.
 * @param {Roll} roll         An already evaluated Roll.
 * @param {number} threshold  Minimum value counting as a success.
 * @returns {{successes: number, recoverable: number, failures: number, threshold: number, faces: number[]}}
 */
export function analyzeDicePool(roll, threshold) {
  const faces = roll.dice
    .flatMap((die) => die.results.filter((r) => r.active))
    .map((r) => r.result);

  const tally = {
    successes: 0,
    recoverable: 0,
    failures: 0,
    threshold,
    faces,
  };

  for (const face of faces) {
    switch (classifyDie(face, threshold)) {
      case DIE_OUTCOME.SUCCESS:
        tally.successes++;
        break;
      case DIE_OUTCOME.RECOVERABLE:
        tally.recoverable++;
        break;
      default:
        tally.failures++;
    }
  }

  return tally;
}

/**
 * Build the chat flavor markup for a pool roll.
 * @param {object} options
 * @param {string} options.title     Main line (weapon or skill name, attribute…).
 * @param {string} [options.subtitle] Secondary line (threshold, attribute used…).
 * @param {object} options.tally     Result of analyzeDicePool.
 * @returns {string} HTML flavor text.
 */
export function formatRollFlavor({ title, subtitle, tally }) {
  const cell = (kind, key, count) => `
    <div class="tally ${kind}">
      <span class="tally-count">${count}</span>
      <span class="tally-label">${game.i18n.localize(key)}</span>
    </div>`;

  return `
    <div class="zombicide-roll">
      <div class="roll-title">${title}</div>
      ${subtitle ? `<div class="roll-subtitle">${subtitle}</div>` : ''}
      <div class="roll-tally">
        ${cell('success', 'ZOMBICIDE.Roll.Successes', tally.successes)}
        ${cell('recoverable', 'ZOMBICIDE.Roll.Recoverable', tally.recoverable)}
        ${cell('failure', 'ZOMBICIDE.Roll.Failures', tally.failures)}
      </div>
    </div>`;
}

/**
 * Roll a d6 pool, classify it, and post the result to chat.
 * @param {object} options
 * @param {number} options.pool       Number of d6 to roll.
 * @param {number} options.threshold  Minimum value counting as a success.
 * @param {string} options.title      Main flavor line.
 * @param {string} [options.subtitle] Secondary flavor line.
 * @param {object} options.speaker    ChatMessage speaker data.
 * @param {string} [options.rollMode] Roll mode; defaults to the core setting.
 * @returns {Promise<{roll: Roll, tally: object}>}
 */
export async function rollDicePool({
  pool,
  threshold,
  title,
  subtitle,
  speaker,
  rollMode = game.settings.get('core', 'rollMode'),
}) {
  const size = Math.max(1, pool || 1);
  const roll = new Roll(`${size}d6`);
  await roll.evaluate();

  const tally = analyzeDicePool(roll, threshold);

  await roll.toMessage({
    speaker,
    rollMode,
    flavor: formatRollFlavor({ title, subtitle, tally }),
  });

  return { roll, tally };
}
