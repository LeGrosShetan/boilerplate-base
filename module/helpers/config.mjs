export const ZOMBICIDE = {};

ZOMBICIDE.dangerLevels = {
  blue:   'ZOMBICIDE.DangerLevel.Blue',
  yellow: 'ZOMBICIDE.DangerLevel.Yellow',
  orange: 'ZOMBICIDE.DangerLevel.Orange',
  red:    'ZOMBICIDE.DangerLevel.Red',
};

ZOMBICIDE.attributes = {
  muscles: 'ZOMBICIDE.Attribute.Muscles',
  cerveau: 'ZOMBICIDE.Attribute.Cerveau',
  tripes:  'ZOMBICIDE.Attribute.Tripes',
};

ZOMBICIDE.aptitudes = {
  athletics:  'ZOMBICIDE.Aptitude.Athletics',
  attitude:   'ZOMBICIDE.Aptitude.Attitude',
  background: 'ZOMBICIDE.Aptitude.Background',
  combat:     'ZOMBICIDE.Aptitude.Combat',
  perception: 'ZOMBICIDE.Aptitude.Perception',
  survival:   'ZOMBICIDE.Aptitude.Survival',
};

/**
 * The action grid: each aptitude (row) crossed with each attribute (column)
 * yields one of the 18 actions. Rows and columns follow the rulebook's layout.
 */
ZOMBICIDE.actionMatrix = {
  athletics:  { muscles: 'stunt',    cerveau: 'sneak',     tripes: 'endure'   },
  attitude:   { muscles: 'appeal',   cerveau: 'convince',  tripes: 'hearten'  },
  background: { muscles: 'security', cerveau: 'education', tripes: 'contacts' },
  combat:     { muscles: 'fight',    cerveau: 'shoot',     tripes: 'cool'     },
  perception: { muscles: 'spot',     cerveau: 'evaluate',  tripes: 'scout'    },
  survival:   { muscles: 'scavenge', cerveau: 'tinker',    tripes: 'heal'     },
};

/**
 * Flat lookup derived from the matrix: action key → its aptitude, attribute and
 * label key. Built here so the matrix stays the single source of truth.
 * @type {Object<string, {aptitude: string, attribute: string, labelKey: string}>}
 */
ZOMBICIDE.actions = {};

/** Action key → label key, in the shape `selectOptions` expects. */
ZOMBICIDE.actionLabels = {};

for (const [aptitude, row] of Object.entries(ZOMBICIDE.actionMatrix)) {
  for (const [attribute, action] of Object.entries(row)) {
    const labelKey = `ZOMBICIDE.Action.Name.${action[0].toUpperCase()}${action.slice(1)}`;
    ZOMBICIDE.actions[action] = { aptitude, attribute, labelKey };
    ZOMBICIDE.actionLabels[action] = labelKey;
  }
}

ZOMBICIDE.weaponTypes = {
  melee:  'ZOMBICIDE.Weapon.Type.Melee',
  ranged: 'ZOMBICIDE.Weapon.Type.Ranged',
};


ZOMBICIDE.skillActionTypes = {
  passive: 'ZOMBICIDE.Skill.ActionType.Passive',
  active:  'ZOMBICIDE.Skill.ActionType.Active',
  free:    'ZOMBICIDE.Skill.ActionType.Free',
};

ZOMBICIDE.zombieTypes = {
  walker:      'ZOMBICIDE.ZombieType.Walker',
  runner:      'ZOMBICIDE.ZombieType.Runner',
  fatty:       'ZOMBICIDE.ZombieType.Fatty',
  abomination: 'ZOMBICIDE.ZombieType.Abomination',
};
