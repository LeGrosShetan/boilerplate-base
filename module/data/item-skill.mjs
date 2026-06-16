import ZombicideItemBase from './base-item.mjs';

export default class SkillData extends ZombicideItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // At which danger level the skill becomes available
    schema.dangerLevel = new fields.StringField({
      required: true,
      initial: 'blue',
      choices: ['blue', 'yellow', 'orange', 'red'],
    });

    schema.actionType = new fields.StringField({
      required: true,
      initial: 'passive',
      choices: ['passive', 'active', 'free'],
    });

    // Optional: the attribute this skill uses for rolls
    schema.linkedAttribute = new fields.StringField({
      required: false,
      blank: true,
      initial: '',
    });

    return schema;
  }

  prepareDerivedData() {
    this.dangerLevel.label =
      game.i18n.localize(`ZOMBICIDE.DangerLevel.${this.dangerLevel.capitalize()}`) ?? this.dangerLevel;
  }
}
