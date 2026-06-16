/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/zombicide-chronicles/templates/actor/parts/actor-weapons.hbs',
    'systems/zombicide-chronicles/templates/actor/parts/actor-equipment.hbs',
    'systems/zombicide-chronicles/templates/actor/parts/actor-skills.hbs',
    'systems/zombicide-chronicles/templates/actor/parts/actor-effects.hbs',
    // Item partials
    'systems/zombicide-chronicles/templates/item/parts/item-effects.hbs',
  ]);
};
