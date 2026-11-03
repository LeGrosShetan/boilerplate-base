import {
  rollDicePool,
  promptPoolModifier,
  formatSigned,
} from '../helpers/dice.mjs';

/**
 * Extend the basic Item for Zombicide Chronicles.
 * @extends {Item}
 */
export class ZombicideItem extends Item {
  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  getRollData() {
    const rollData = { ...this.system };
    if (!this.actor) return rollData;
    rollData.actor = this.actor.getRollData();
    return rollData;
  }

  /**
   * Handle clickable items.
   * Weapons roll their attack action against the weapon's accuracy.
   * Everything else — skills included — just posts its description to chat.
   * @param {object} [options]
   * @param {boolean} [options.skipDialog] Roll without prompting for a modifier.
   */
  async roll({ skipDialog = false } = {}) {
    const actor = this.actor;
    const speaker = ChatMessage.getSpeaker({ actor });
    const rollMode = game.settings.get('core', 'rollMode');

    if (actor && this.type === 'weapon' && this._linkedAction) {
      return this._rollWeaponAttack(speaker, rollMode, skipDialog);
    }

    return this._postDescription(speaker, rollMode);
  }

  /**
   * The derived action this weapon attacks with, if the owner has one.
   * @returns {object|undefined}
   * @private
   */
  get _linkedAction() {
    const key = this.system.linkedAction;
    if (!key) return undefined;
    return this.actor?.system?.actions?.[key];
  }

  /**
   * Attack roll: the linked action's pool plus the weapon's own dice, with each
   * die ≥ accuracy counting as a hit. The weapon's dice are part of the base
   * pool, so the situational modifier from the dialog applies on top of them.
   * @private
   */
  async _rollWeaponAttack(speaker, rollMode, skipDialog = false) {
    const action = this._linkedAction;
    const diceBonus = this.system.diceBonus ?? 0;
    const pool = Math.max(0, action.pool + diceBonus);
    const threshold = this.system.accuracy ?? 4;
    const title = `${game.i18n.localize('ZOMBICIDE.Roll.Attack')} — ${this.name}`;

    const parts = [`${action.label} (${action.attributeLabel} + ${action.aptitudeLabel})`];
    if (diceBonus) {
      parts.push(
        `${game.i18n.localize('ZOMBICIDE.Weapon.DiceBonus')} ${formatSigned(diceBonus)}`
      );
    }
    const context = parts.join(' · ');

    let modifier = 0;
    if (!skipDialog) {
      modifier = await promptPoolModifier({ title, context, pool, threshold });
      if (modifier === null) return;
    }

    return rollDicePool({
      pool,
      modifier,
      threshold,
      title,
      context,
      speaker,
      rollMode,
    });
  }

  /**
   * Post the item's description to chat. This is how skills are "used": they
   * carry rules text rather than a roll.
   * @private
   */
  async _postDescription(speaker, rollMode) {
    const typeLabel = game.i18n.localize(`TYPES.Item.${this.type}`);

    return ChatMessage.create({
      speaker,
      rollMode,
      flavor: `[${typeLabel}] ${this.name}`,
      content: await TextEditor.enrichHTML(this.system.description ?? '', {
        async: true,
        rollData: this.getRollData(),
        relativeTo: this,
      }),
    });
  }
}
