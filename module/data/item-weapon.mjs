import ZombicideItemBase from './base-item.mjs';

export default class WeaponData extends ZombicideItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const int = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.weaponType = new fields.StringField({
      required: true,
      initial: 'melee',
      choices: ['melee', 'ranged'],
    });

    // Damage dice/value (e.g. "1", "2", "1d6")
    schema.damage = new fields.StringField({ required: true, initial: '1', blank: false });

    // Range expressed in zones (0 = same zone as target)
    schema.rangeMin = new fields.NumberField({ ...int, initial: 0, min: 0 });
    schema.rangeMax = new fields.NumberField({ ...int, initial: 0, min: 0 });

    // Attribute used for the attack roll (muscles / cerveau / tripes)
    schema.linkedAttribute = new fields.StringField({
      required: true,
      initial: 'muscles',
      choices: ['muscles', 'cerveau', 'tripes'],
    });

    schema.noise = new fields.NumberField({ ...int, initial: 0, min: 0 });

    schema.hands = new fields.NumberField({ ...int, initial: 1, min: 1, max: 2 });

    // Minimum number of dice required to hit
    schema.accuracy = new fields.NumberField({ ...int, initial: 4, min: 1 });

    return schema;
  }

  prepareDerivedData() {
    this.isMelee = this.weaponType === 'melee';
    this.isRanged = this.weaponType === 'ranged';
  }
}
