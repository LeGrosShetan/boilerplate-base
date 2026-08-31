import ZombicideActorBase from './base-actor.mjs';
import { ZOMBICIDE } from '../helpers/config.mjs';

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

    // max is always recomputed in prepareDerivedData; it is kept in the schema
    // so Foundry lists stress as a token bar candidate.
    schema.stress = new fields.SchemaField({
      value: new fields.NumberField({ ...int, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...int, initial: 0 }),
    });

    // The two halves of every action pool. Actions themselves hold no points:
    // they are derived from one attribute plus one aptitude.
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

    schema.aptitudes = new fields.SchemaField(
      Object.fromEntries(
        Object.keys(ZOMBICIDE.aptitudes).map((key) => [
          key,
          new fields.SchemaField({
            value: new fields.NumberField({ ...int, initial: 1, min: 0 }),
          }),
        ])
      )
    );

    return schema;
  }

  prepareDerivedData() {
    // Health and stress capacities are dictated by the attributes
    const { muscles, cerveau, tripes } = this.attributes;
    this.health.max = muscles.value + tripes.value;
    this.stress.max = (cerveau.value + tripes.value) * 2;

    // Derive the current danger level from experience
    const bracket = DANGER_THRESHOLDS.find((b) => this.experience >= b.min);
    this.dangerLevel = bracket?.level ?? 'blue';
    this.dangerLevelLabel = game.i18n.localize(
      `ZOMBICIDE.DangerLevel.${this.dangerLevel.capitalize()}`
    );

    // Localize attribute and aptitude labels
    for (const key of Object.keys(this.attributes)) {
      this.attributes[key].label = game.i18n.localize(
        `ZOMBICIDE.Attribute.${key.capitalize()}`
      );
    }
    for (const key of Object.keys(this.aptitudes)) {
      this.aptitudes[key].label = game.i18n.localize(ZOMBICIDE.aptitudes[key]);
    }

    this.actions = this.#deriveActions();
  }

  /**
   * Build the 18 actions from the aptitude × attribute grid. An action holds no
   * points of its own: its pool is the sum of the two stats it sits between.
   * @returns {Object<string, object>} Action key → derived action data.
   */
  #deriveActions() {
    const actions = {};

    for (const [key, def] of Object.entries(ZOMBICIDE.actions)) {
      const attribute = this.attributes[def.attribute];
      const aptitude = this.aptitudes[def.aptitude];

      actions[key] = {
        key,
        attribute: def.attribute,
        aptitude: def.aptitude,
        label: game.i18n.localize(def.labelKey),
        attributeLabel: attribute.label,
        aptitudeLabel: aptitude.label,
        pool: attribute.value + aptitude.value,
      };
    }

    return actions;
  }

  getRollData() {
    const data = {};
    for (const [key, attr] of Object.entries(this.attributes)) {
      data[key] = foundry.utils.deepClone(attr);
    }
    data.attributes = foundry.utils.deepClone(this.attributes);
    data.aptitudes = foundry.utils.deepClone(this.aptitudes);
    data.actions = foundry.utils.deepClone(this.actions);
    data.dangerLevel = this.dangerLevel;
    data.experience = this.experience;
    return data;
  }
}
