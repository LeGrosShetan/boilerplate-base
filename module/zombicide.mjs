// Import document classes.
import { ZombicideActor } from './documents/actor.mjs';
import { ZombicideItem } from './documents/item.mjs';
// Import sheet classes.
import { ZombicideActorSheet } from './sheets/actor-sheet.mjs';
import { ZombicideItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { ZOMBICIDE } from './helpers/config.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  game.zombicide = {
    ZombicideActor,
    ZombicideItem,
    rollItemMacro,
  };

  CONFIG.ZOMBICIDE = ZOMBICIDE;

  CONFIG.Combat.initiative = {
    formula: '1d6',
    decimals: 0,
  };

  CONFIG.Actor.documentClass = ZombicideActor;
  CONFIG.Item.documentClass = ZombicideItem;

  CONFIG.ActiveEffect.legacyTransferral = false;

  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('zombicide-chronicles', ZombicideActorSheet, {
    makeDefault: true,
    label: 'ZOMBICIDE.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('zombicide-chronicles', ZombicideItemSheet, {
    makeDefault: true,
    label: 'ZOMBICIDE.SheetLabels.Item',
  });

  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

async function createItemMacro(data, slot) {
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  const item = await Item.fromDropData(data);

  const command = `game.zombicide.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'zombicide-chronicles.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

function rollItemMacro(itemUuid) {
  const dropData = { type: 'Item', uuid: itemUuid };
  Item.fromDropData(dropData).then((item) => {
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }
    item.roll();
  });
}
