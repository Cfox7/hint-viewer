import type { SettingDefinition } from '../seed-settings-types';

export const availableSettings: SettingDefinition[] = [
  // Requirements
  { key: 'Seed', category: 'Requirements', type: 'number' },
  { key: 'Logic Type', category: 'Requirements', type: 'string', options: ['Glitchless Logic', 'Glitched Logic', 'No Logic'] },
  { key: 'Maximum B Locker', category: 'Requirements', type: 'number' },
  { key: 'Maximum B Locker ensured', category: 'Requirements', type: 'boolean' },
  { key: 'Maximum Troff N Scoff', category: 'Requirements', type: 'number' },
  { key: 'Hard Troff N Scoff', category: 'Requirements', type: 'boolean' },
  { key: 'Chaos B.Lockers', category: 'Requirements', type: 'boolean' },
  { key: 'Open Lobbies', category: 'Requirements', type: 'boolean' },
  { key: 'Smaller Shops', category: 'Requirements', type: 'boolean' },
  { key: 'Galleon Water Level', category: 'Requirements', type: 'string', options: ['lowered', 'raised', 'random'] },
  { key: 'Fungi Time of Day', category: 'Requirements', type: 'string', options: ['day', 'night', 'progressive', 'random'] },
  { key: 'Random Shop Prices', category: 'Requirements', type: 'string', options: ['vanilla', 'low', 'medium', 'high', 'free'] },
  { key: 'Activated Warps', category: 'Requirements', type: 'string', options: ['off', 'isles', 'isles_inc_helm_lobby', 'all'] },
  { key: 'Fairies Required for Rareware GB', category: 'Requirements', type: 'number' },
  { key: 'Pearls Required for Mermaid GB', category: 'Requirements', type: 'number' },
  { key: 'Random Jetpac Medal Requirement', category: 'Requirements', type: 'boolean' },

  // Progression
  { key: 'Win Condition', category: 'Progression', type: 'string', options: ['8 Keys', 'Get the Last Key', 'All Fairies', 'All Blueprints', 'All Medals', 'Poke Snap', 'Beat K. Rool'] },
  { key: 'Random Win Condition', category: 'Progression', type: 'boolean' },
  { key: 'Select Starting Keys', category: 'Progression', type: 'boolean' },
  { key: 'Number of Keys Pregiven', category: 'Progression', type: 'number' },
  { key: 'Key 8 in Helm', category: 'Progression', type: 'boolean' },
  { key: 'Helm Setting', category: 'Progression', type: 'string', options: ['default', 'skip_start', 'skip_all'] },
  { key: 'Helm Room Bonus Count', category: 'Progression', type: 'number' },
  { key: 'Crown Door Open', category: 'Progression', type: 'boolean' },
  { key: 'Coin Door Open', category: 'Progression', type: 'boolean' },
  { key: 'Chunky Phase Slam Requirement', category: 'Progression', type: 'string', options: ['green', 'blue', 'red'] },

  // Overworld
  { key: 'Loading Zones Shuffled', category: 'Overworld', type: 'string', options: ['none', 'levels', 'all'] },
  { key: 'Decoupled Loading Zones', category: 'Overworld', type: 'boolean' },
  { key: 'Helm Location Shuffled', category: 'Overworld', type: 'boolean' },
  { key: 'Complex Level Order', category: 'Overworld', type: 'boolean' },
  { key: 'Banana Port Randomization', category: 'Overworld', type: 'string', options: ['off', 'in_level', 'crossmap'] },
  { key: 'Banana port Location Shuffle', category: 'Overworld', type: 'string', options: ['off', 'on'] },
  { key: 'Randomize CB Locations', category: 'Overworld', type: 'boolean' },
  { key: 'Randomize Kasplats', category: 'Overworld', type: 'string', options: ['off', 'vanilla_locations', 'location_shuffle'] },
  { key: 'Randomize Banana Fairies', category: 'Overworld', type: 'boolean' },
  { key: 'Randomize Battle Arenas', category: 'Overworld', type: 'boolean' },
  { key: 'Randomize Shop Locations', category: 'Overworld', type: 'boolean' },
  { key: 'Randomize Coin Locations', category: 'Overworld', type: 'boolean' },
  { key: 'Randomize Pickups', category: 'Overworld', type: 'boolean' },
  { key: 'Randomize Patches', category: 'Overworld', type: 'boolean' },
  { key: 'Randomize Crates', category: 'Overworld', type: 'boolean' },
  { key: 'Vanilla Door Shuffle', category: 'Overworld', type: 'boolean' },
  { key: "Dos' Doors", category: 'Overworld', type: 'boolean' },
  { key: 'Randomize Wrinkly Doors', category: 'Overworld', type: 'boolean' },
  { key: 'Randomize T&S Portals', category: 'Overworld', type: 'boolean' },
  { key: 'Switchsanity', category: 'Overworld', type: 'boolean' },
  { key: 'Progressive Switch Strength', category: 'Overworld', type: 'boolean' },
  { key: 'Auto Complete Bonus Barrels', category: 'Overworld', type: 'boolean' },
  { key: 'Hard Mode Enabled', category: 'Overworld', type: 'boolean' },
  { key: 'Hard Bosses Enabled', category: 'Overworld', type: 'boolean' },
  { key: 'Irondonk', category: 'Overworld', type: 'boolean' },
  { key: 'Damage Amount', category: 'Overworld', type: 'string', options: ['default', 'double', 'quad', 'ohko'] },

  // Items
  { key: 'Move Randomization type', label: 'Move Rando', category: 'Items', type: 'string', options: ['off', 'start_with', 'item_shuffle', 'cross_purchase'] },
  { key: 'Starting Moves Count', category: 'Items', type: 'number' },
  { key: 'Free Trade Agreement', category: 'Items', type: 'boolean' },

  // Quality of Life
  { key: 'Kongless Hint Doors', category: 'Quality of Life', type: 'boolean' },
  { key: 'Item Reward Previews', category: 'Quality of Life', type: 'boolean' },
  { key: 'Hint Preset', category: 'Quality of Life', type: 'string', options: ['Standard', 'Cryptic', 'Item Hinting', 'Advanced Item Hinting', 'Off'] },
];

export const defaultSettings: string[] = [
  'Logic Type',
  'Win Condition',
  'Helm Setting',
  'Maximum B Locker',
  'Maximum Troff N Scoff',
  'Move Randomization type',
  'Loading Zones Shuffled',
  'Free Trade Agreement',
  'Starting Moves Count',
  'Number of Keys Pregiven',
];
