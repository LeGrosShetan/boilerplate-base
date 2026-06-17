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
   * Handle clickable rolls.
   * Weapons roll a d6 pool (size = linked attribute) and count successes (≥ 4).
   * Other items post their description to chat.
   */
  async roll() {
    const actor = this.actor;
    const speaker = ChatMessage.getSpeaker({ actor });
    const rollMode = game.settings.get('core', 'rollMode');

    if (this.type === 'weapon' && actor) {
      return this._rollWeaponAttack(speaker, rollMode);
    }

    // Fallback: post item description
    ChatMessage.create({
      speaker,
      rollMode,
      flavor: `[${this.type}] ${this.name}`,
      content: this.system.description ?? '',
    });
  }

  /**
   * Roll a weapon attack: [attr]d6, successes on 4+, compare to accuracy.
   * @private
   */
  async _rollWeaponAttack(speaker, rollMode) {
    const actor = this.actor;
    const linkedAttr = this.system.linkedAttribute || 'muscles';
    const attrValue = actor.system.attributes?.[linkedAttr]?.value ?? 1;
    const accuracy = this.system.accuracy;
    const attrLabel = game.i18n.localize(`ZOMBICIDE.Attribute.${linkedAttr.capitalize()}`);

    // cs>=4 instructs Foundry to count each die ≥ 4 as one success
    const roll = new Roll(`${attrValue}d6cs>=4`);
    await roll.evaluate();

    const hits = roll.total;
    const success = hits >= accuracy;
    const resultKey = success ? 'ZOMBICIDE.Roll.Hit' : 'ZOMBICIDE.Roll.Miss';

    await roll.toMessage({
      speaker,
      rollMode,
      flavor: `<strong>${this.name}</strong> (${attrLabel}) — `
        + `${hits} / ${accuracy} ${game.i18n.localize('ZOMBICIDE.Roll.Hits')} `
        + `→ <strong>${game.i18n.localize(resultKey)}</strong>`,
    });

    return roll;
  }
}
