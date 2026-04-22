import { dk64Config } from './dk64';
import type { GameConfig } from './types';

export const GAMES: GameConfig[] = [dk64Config];
export const DEFAULT_GAME = dk64Config;
export type { GameConfig, SpoilerLog, SpoilerResponse, LevelCategory } from './types';
