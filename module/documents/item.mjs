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
    const accuracy = this.system.accuracy ?? 4;
    const attrLabel = game.i18n.localize(`ZOMBICIDE.Attribute.${linkedAttr.capitalize()}`);

    const roll = new Roll(`${attrValue}d6`);
    await roll.evaluate();

    const diceResults = roll.dice[0]?.results.filter(r => r.active) ?? [];
    const hits = diceResults.filter(r => r.result >= accuracy).length;
    const ones = diceResults.filter(r => r.result === 1).length;

    const onesText = ones > 0
      ? ` | ${ones} ${game.i18n.localize('ZOMBICIDE.Roll.Ones')}`
      : '';

    await roll.toMessage({
      speaker,
      rollMode,
      flavor: `<strong>${this.name}</strong> (${attrLabel}, ≥${accuracy}) — `
        + `${hits} ${game.i18n.localize('ZOMBICIDE.Roll.Hits')}${onesText}`,
    });

    return roll;
  }
}
