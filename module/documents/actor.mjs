/**
 * Extend the base Actor document for Zombicide Chronicles.
 * @extends {Actor}
 */
export class ZombicideActor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {}

  /** @override */
  prepareDerivedData() {
    const actorData = this;
    const flags = actorData.flags.zombicide || {};

    this._prepareSurvivorData(actorData);
    this._prepareZombieData(actorData);
  }

  _prepareSurvivorData(actorData) {
    if (actorData.type !== 'survivor') return;
    // Derived survivor data goes here (Phase 2).
  }

  _prepareZombieData(actorData) {
    if (actorData.type !== 'zombie') return;
    // Derived zombie data goes here (Phase 2).
  }

  /** @override */
  getRollData() {
    const data = { ...this.system };
    this._getSurvivorRollData(data);
    this._getZombieRollData(data);
    return data;
  }

  _getSurvivorRollData(data) {
    if (this.type !== 'survivor') return;
  }

  _getZombieRollData(data) {
    if (this.type !== 'zombie') return;
  }
}
