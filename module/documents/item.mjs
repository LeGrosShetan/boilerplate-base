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
   * @param {Event} event
   */
  async roll() {
    const item = this;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    if (!this.system.formula) {
      ChatMessage.create({
        speaker,
        rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    } else {
      const rollData = this.getRollData();
      const roll = new Roll(rollData.formula, rollData);
      roll.toMessage({ speaker, rollMode, flavor: label });
      return roll;
    }
  }
}
