import ZombicideItemBase from './base-item.mjs';

export default class EquipmentData extends ZombicideItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const int = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({ ...int, initial: 1, min: 0 });

    schema.slots = new fields.NumberField({ ...int, initial: 1, min: 0 });

    schema.passive = new fields.BooleanField({ initial: false });

    return schema;
  }
}
