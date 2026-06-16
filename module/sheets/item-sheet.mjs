import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ItemSheet for Zombicide Chronicles.
 * @extends {ItemSheet}
 */
export class ZombicideItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['zombicide', 'sheet', 'item'],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/zombicide-chronicles/templates/item';
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = super.getData();
    const itemData = this.document.toObject(false);

    context.enrichedDescription = await TextEditor.enrichHTML(
      this.item.system.description,
      {
        secrets: this.document.isOwner,
        async: true,
        rollData: this.item.getRollData(),
        relativeTo: this.item,
      }
    );

    context.system = itemData.system;
    context.flags = itemData.flags;
    context.config = CONFIG.ZOMBICIDE;

    context.effects = prepareActiveEffectCategories(this.item.effects);

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    html.on('click', '.effect-control', (ev) =>
      onManageActiveEffect(ev, this.item)
    );
  }
}
