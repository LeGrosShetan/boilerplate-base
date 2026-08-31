import { rollDicePool } from '../helpers/dice.mjs';

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
   */
  async roll() {
    const actor = this.actor;
    const speaker = ChatMessage.getSpeaker({ actor });
    const rollMode = game.settings.get('core', 'rollMode');

    if (actor && this.type === 'weapon' && this._linkedAction) {
      return this._rollWeaponAttack(speaker, rollMode);
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
   * Attack roll: the linked action's pool, each die ≥ accuracy is a success.
   * @private
   */
  async _rollWeaponAttack(speaker, rollMode) {
    const action = this._linkedAction;
    const threshold = this.system.accuracy ?? 4;

    return rollDicePool({
      pool: action.pool,
      threshold,
      title: `${game.i18n.localize('ZOMBICIDE.Roll.Attack')} — ${this.name}`,
      subtitle: `${action.label} (${action.attributeLabel} + ${action.aptitudeLabel})`
        + ` · ${action.pool}d6 · ≥${threshold}`,
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
