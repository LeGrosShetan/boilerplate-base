/**
 * Extend the base Actor document for Zombicide Chronicles.
 *
 * Data preparation lives in the data models (module/data/actor-*.mjs), so this
 * class deliberately does not override prepareData, prepareBaseData or
 * prepareDerivedData: the base implementations do real initialisation work and
 * silently swallowing them breaks Active Effect application.
 *
 * @extends {Actor}
 */
export class ZombicideActor extends Actor {
  /**
   * Return roll data as a shallow copy, so callers that annotate it — item roll
   * data nests the actor's under `actor` — cannot mutate the live data model.
   * @override
   */
  getRollData() {
    return { ...this.system };
  }
}
