export interface SpoilerLog {
  hints: Record<string, string>;
}

export interface SpoilerResponse {
  data: SpoilerLog;
  uploadedAt: string;
}

export type LevelCategory = 'regions' | 'direct' | 'foolish' | 'woth';

export interface GameConfig {
  id: string;
  displayName: string;
  normalize: (raw: unknown) => SpoilerLog;
  levelDisplayNames: Record<string, string>;
  levelOrder: string[];
  getLevelCategory: (level: string) => LevelCategory;
  sectionLabels: Record<LevelCategory, string>;
  toServerPayload: (hints: Record<string, string>) => Record<string, unknown>;
  fromServerPayload: (raw: unknown) => SpoilerLog;
  homeComponent: React.FC;
  backgroundImage: string;
}
