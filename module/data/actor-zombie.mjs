import ZombicideActorBase from './base-actor.mjs';

export default class ZombieData extends ZombicideActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const int = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.zombieType = new fields.StringField({
      required: true,
      initial: 'walker',
      choices: ['walker', 'runner', 'fatty', 'abomination'],
    });

    schema.activations = new fields.NumberField({ ...int, initial: 1, min: 1 });

    schema.damage = new fields.NumberField({ ...int, initial: 1, min: 1 });

    // Targeting priority: 0 = highest noise, 1 = most visible, etc.
    schema.priority = new fields.NumberField({ ...int, initial: 1, min: 1 });

    return schema;
  }

  prepareDerivedData() {
    this.zombieType.label =
      game.i18n.localize(`ZOMBICIDE.ZombieType.${this.zombieType.capitalize()}`) ?? this.zombieType;
  }
}
