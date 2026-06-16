import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet for Zombicide Chronicles.
 * @extends {ActorSheet}
 */
export class ZombicideActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['zombicide', 'sheet', 'actor'],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'skills',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/zombicide-chronicles/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = super.getData();
    const actorData = this.document.toObject(false);

    context.system = actorData.system;
    context.flags = actorData.flags;
    context.config = CONFIG.ZOMBICIDE;

    if (actorData.type === 'survivor') {
      this._prepareItems(context);
      this._prepareSurvivorData(context);
    }

    if (actorData.type === 'zombie') {
      this._prepareItems(context);
    }

    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        secrets: this.document.isOwner,
        async: true,
        rollData: this.actor.getRollData(),
        relativeTo: this.actor,
      }
    );

    context.effects = prepareActiveEffectCategories(
      this.actor.allApplicableEffects()
    );

    return context;
  }

  _prepareSurvivorData(context) {}

  /**
   * Organize and classify Items for Actor sheets.
   * @param {object} context
   */
  _prepareItems(context) {
    const weapons = [];
    const equipment = [];
    const skills = [];

    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      if (i.type === 'weapon') weapons.push(i);
      else if (i.type === 'equipment') equipment.push(i);
      else if (i.type === 'skill') skills.push(i);
    }

    context.weapons = weapons;
    context.equipment = equipment;
    context.skills = skills;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    if (!this.isEditable) return;

    html.on('click', '.item-create', this._onItemCreate.bind(this));

    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    html.on('click', '.rollable', this._onRoll.bind(this));

    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);
    const name = `New ${type.capitalize()}`;
    const itemData = { name, type, system: data };
    delete itemData.system['type'];
    return await Item.create(itemData, { parent: this.actor });
  }

  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.rollType) {
      if (dataset.rollType === 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }
}
