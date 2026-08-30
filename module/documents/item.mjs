import { rollDicePool, SKILL_THRESHOLD } from '../helpers/dice.mjs';

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
   * Weapons roll an attack pool against their accuracy; skills bound to an
   * attribute roll a skill check. Anything else posts its description to chat.
   */
  async roll() {
    const actor = this.actor;
    const speaker = ChatMessage.getSpeaker({ actor });
    const rollMode = game.settings.get('core', 'rollMode');

    if (actor && this.type === 'weapon') {
      return this._rollWeaponAttack(speaker, rollMode);
    }

    if (actor && this.type === 'skill' && this.system.linkedAttribute) {
      return this._rollSkillCheck(speaker, rollMode);
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
   * Attack roll: [linked attribute]d6, each die ≥ accuracy is a success.
   * @private
   */
  async _rollWeaponAttack(speaker, rollMode) {
    const linkedAttr = this.system.linkedAttribute || 'muscles';
    const pool = this.actor.system.attributes?.[linkedAttr]?.value ?? 1;
    const threshold = this.system.accuracy ?? 4;

    return rollDicePool({
      pool,
      threshold,
      title: `${game.i18n.localize('ZOMBICIDE.Roll.Attack')} — ${this.name}`,
      subtitle: this._rollSubtitle(linkedAttr, pool, threshold),
      speaker,
      rollMode,
    });
  }

  /**
   * Skill check: [linked attribute]d6, only a natural 6 is a success.
   * @private
   */
  async _rollSkillCheck(speaker, rollMode) {
    const linkedAttr = this.system.linkedAttribute;
    const pool = this.actor.system.attributes?.[linkedAttr]?.value ?? 1;

    return rollDicePool({
      pool,
      threshold: SKILL_THRESHOLD,
      title: `${game.i18n.localize('ZOMBICIDE.Roll.SkillCheck')} — ${this.name}`,
      subtitle: this._rollSubtitle(linkedAttr, pool, SKILL_THRESHOLD),
      speaker,
      rollMode,
    });
  }

  /**
   * "Muscles · 4d6 · ≥5" — describes the pool that was rolled.
   * @private
   */
  _rollSubtitle(attributeKey, pool, threshold) {
    const attrLabel = game.i18n.localize(
      `ZOMBICIDE.Attribute.${attributeKey.capitalize()}`
    );
    return `${attrLabel} · ${pool}d6 · ≥${threshold}`;
  }
}
