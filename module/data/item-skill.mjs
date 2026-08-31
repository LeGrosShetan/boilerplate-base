import ZombicideItemBase from './base-item.mjs';

export default class SkillData extends ZombicideItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // At which danger level the skill becomes available
    schema.dangerLevel = new fields.StringField({
      required: true,
      initial: 'blue',
    });

    schema.actionType = new fields.StringField({
      required: true,
      initial: 'passive',
    });

    return schema;
  }

  prepareDerivedData() {
    this.dangerLevelLabel = game.i18n.localize(`ZOMBICIDE.DangerLevel.${this.dangerLevel.capitalize()}`);
  }
}
