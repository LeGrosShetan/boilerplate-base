import ZombicideDataModel from './base-model.mjs';

export default class ZombicideActorBase extends ZombicideDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.health = new fields.SchemaField({
      value: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 10, min: 0 }),
      max: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 10 }),
    });

    schema.biography = new fields.StringField({ required: true, blank: true });

    return schema;
  }
}
