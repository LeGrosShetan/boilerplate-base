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

/** A pool never drops below a single die, however harsh the modifier. */
export const MIN_POOL = 1;

/**
 * Apply a modifier to a base pool, floored at MIN_POOL.
 * @param {number} pool
 * @param {number} modifier
 * @returns {number}
 */
export function effectivePool(pool, modifier = 0) {
  return Math.max(MIN_POOL, (pool || 0) + modifier);
}

/**
 * "5 − 2 = 3d6", or just "5d6" when unmodified.
 * @param {number} pool
 * @param {number} modifier
 * @returns {string}
 */
function formatPool(pool, modifier) {
  const size = effectivePool(pool, modifier);
  if (!modifier) return `${size}d6`;
  const sign = modifier > 0 ? '+' : '−';
  return `${pool} ${sign} ${Math.abs(modifier)} = ${size}d6`;
}

/**
 * Ask the player how many dice to add or remove before rolling.
 * @param {object} options
 * @param {string} options.title     Dialog title.
 * @param {string} [options.context] What is being rolled ("Fight (Muscle + Combat)").
 * @param {number} options.pool      Base pool, before any modifier.
 * @param {number} options.threshold Success threshold, shown for reference.
 * @returns {Promise<number|null>} The chosen modifier, or null if cancelled.
 */
export async function promptPoolModifier({ title, context, pool, threshold }) {
  const content = await renderTemplate(
    'systems/zombicide-chronicles/templates/dialog/roll-modifier.hbs',
    { context, pool, threshold }
  );

  return new Promise((resolve) => {
    new Dialog(
      {
        title,
        content,
        default: 'roll',
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice-d6"></i>',
            label: game.i18n.localize('ZOMBICIDE.Dialog.Roll'),
            callback: (html) => {
              const raw = html.find('[name="modifier"]').val();
              resolve(Number.parseInt(raw, 10) || 0);
            },
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize('ZOMBICIDE.Dialog.Cancel'),
            callback: () => resolve(null),
          },
        },
        // Already-settled promises ignore this, so it only catches the X button
        close: () => resolve(null),
        render: (html) => {
          const input = html.find('[name="modifier"]');
          const total = html.find('.total-pool');

          const refresh = () => {
            const modifier = Number.parseInt(input.val(), 10) || 0;
            total.text(`${effectivePool(pool, modifier)}d6`);
          };

          html.find('[data-step]').on('click', (event) => {
            const step = Number(event.currentTarget.dataset.step);
            input.val((Number.parseInt(input.val(), 10) || 0) + step);
            refresh();
          });

          input.on('input', refresh);
          input.trigger('focus').trigger('select');
        },
      },
      { classes: ['zombicide', 'dialog', 'roll-modifier-dialog'] }
    ).render(true);
  });
}

/**
 * Roll a d6 pool, classify it, and post the result to chat.
 * @param {object} options
 * @param {number} options.pool       Base number of d6, before the modifier.
 * @param {number} [options.modifier] Dice added (+) or removed (−) by the player.
 * @param {number} options.threshold  Minimum value counting as a success.
 * @param {string} options.title      Main flavor line.
 * @param {string} [options.context]  What is being rolled; the pool maths and
 *                                    threshold are appended to it.
 * @param {object} options.speaker    ChatMessage speaker data.
 * @param {string} [options.rollMode] Roll mode; defaults to the core setting.
 * @returns {Promise<{roll: Roll, tally: object}>}
 */
export async function rollDicePool({
  pool,
  modifier = 0,
  threshold,
  title,
  context,
  speaker,
  rollMode = game.settings.get('core', 'rollMode'),
}) {
  const roll = new Roll(`${effectivePool(pool, modifier)}d6`);
  await roll.evaluate();

  const tally = analyzeDicePool(roll, threshold);
  const subtitle = [context, formatPool(pool, modifier), `≥${threshold}`]
    .filter(Boolean)
    .join(' · ');

  await roll.toMessage({
    speaker,
    rollMode,
    flavor: formatRollFlavor({ title, subtitle, tally }),
  });

  return { roll, tally };
}
