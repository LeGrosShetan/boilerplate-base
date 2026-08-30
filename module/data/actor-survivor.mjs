import ZombicideActorBase from './base-actor.mjs';

/**
 * Danger level brackets, highest first so the first match wins:
 *   0–6 blue · 7–18 yellow · 19–42 orange · 43+ red
 */
const DANGER_THRESHOLDS = [
  { level: 'red', min: 43 },
  { level: 'orange', min: 19 },
  { level: 'yellow', min: 7 },
  { level: 'blue', min: 0 },
];

export default class SurvivorData extends ZombicideActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const int = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

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
    const bracket = DANGER_THRESHOLDS.find((b) => this.experience >= b.min);
    this.dangerLevel = bracket?.level ?? 'blue';
    this.dangerLevelLabel = game.i18n.localize(
      `ZOMBICIDE.DangerLevel.${this.dangerLevel.capitalize()}`
    );

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
