import ZombicideDataModel from './base-model.mjs';

export default class ZombicideItemBase extends ZombicideDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true });

    return schema;
  }
}
