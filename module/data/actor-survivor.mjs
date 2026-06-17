import ZombicideActorBase from './base-actor.mjs';

const DANGER_LEVELS = ['blue', 'yellow', 'orange', 'red'];

const XP_THRESHOLDS = {
  blue: 0,
  yellow: 7,
  orange: 19,
  red: 43,
};

export default class SurvivorData extends ZombicideActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const int = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.actions = new fields.SchemaField({
      value: new fields.NumberField({ ...int, initial: 3, min: 0 }),
      max: new fields.NumberField({ ...int, initial: 3 }),
    });

    schema.experience = new fields.NumberField({ ...int, initial: 0, min: 0 });

    // Core attributes used for skill checks (d6 dice pool)
    schema.attributes = new fields.SchemaField({
      muscles: new fields.SchemaField({
        value: new fields.NumberField({ ...int, initial: 3, min: 1 }),
      }),
      cerveau: new fields.SchemaField({
        value: new fields.NumberField({ ...int, initial: 3, min: 1 }),
      }),
      tripes: new fields.SchemaField({
        value: new fields.NumberField({ ...int, initial: 3, min: 1 }),
      }),
    });

    return schema;
  }

  prepareDerivedData() {
    // Derive the current danger level from experience
    this.dangerLevel = 'blue';
    for (const level of DANGER_LEVELS) {
      if (this.experience >= XP_THRESHOLDS[level]) this.dangerLevel = level;
    }

    // Localize attribute labels
    for (const key of Object.keys(this.attributes)) {
      this.attributes[key].label =
        game.i18n.localize(`ZOMBICIDE.Attribute.${key.capitalize()}`) ?? key;
    }
  }

  getRollData() {
    const data = {};
    for (const [key, attr] of Object.entries(this.attributes)) {
      data[key] = foundry.utils.deepClone(attr);
    }
    data.dangerLevel = this.dangerLevel;
    data.experience = this.experience;
    return data;
  }
}
