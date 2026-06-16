export default class ZombicideDataModel extends foundry.abstract.TypeDataModel {
  /**
   * Return a plain object including derived data (toObject() strips it).
   * @returns {object}
   */
  toPlainObject() {
    return { ...this };
  }
}
