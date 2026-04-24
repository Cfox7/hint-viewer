export type { LevelCategory } from './games/types';
import { dk64Config } from './games/dk64';

export const levelDisplayNames = dk64Config.levelDisplayNames;
export const levelOrder = dk64Config.levelOrder;
export const getLevelCategory = dk64Config.getLevelCategory;
