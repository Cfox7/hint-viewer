import React from 'react';
import type { SettingDefinition, SeedSettingsData, SeedSettingsPreset } from '../seed-settings-types';

export type { SettingDefinition, SeedSettingsData, SeedSettingsPreset };

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
  levelDisplayNames: Record<string, string>;
  levelOrder: string[];
  backgroundImage: string;
  sectionLabels: Record<LevelCategory, string>;
  hintOrder: string[];
  hintedItemOptions: string[];
  getLevelCategory: (level: string) => LevelCategory;
  normalize: (raw: unknown) => SpoilerLog;
  sortHints: (groupedHints: Record<string, string[]>) => Record<string, string[]>;
  colorizeHints: (text: string, highlight?: string) => React.ReactNode;
  getLocationLabel: (location: string, level: string) => string;
  getLevelTitle: (slide: { level: string; pageIndex: number } | undefined, slideCountByLevel: Record<string, number>, levelDisplayNames: Record<string, string>) => string;
  homeComponent: React.FC;
  categorizeHints: (hints: Record<string, string>) => Record<string, string>;
  getEmptyHintTemplate: () => Record<string, string>;
  toServerPayload: (hints: Record<string, string>, raw?: unknown) => Record<string, unknown>;
  fromServerPayload: (raw: unknown) => SpoilerLog;
  validateSpoilerLog: (raw: unknown) => boolean;
  availableSettings?: SettingDefinition[];
  defaultSettings?: string[];
  settingsPresets?: SeedSettingsPreset[];
  extractSettings?: (raw: unknown) => SeedSettingsData;
  regionMerges?: [string, string][];
  searchableRegions?: SearchableRegion[];
}

export interface SearchableRegion {
  key: string;
  displayName: string;
  color?: string;
  aliases: string[];
}

export function highlightParts(parts: React.ReactNode[], query: string, keyStart: number): React.ReactNode[] {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  let key = keyStart;

  return parts.flatMap((part) => {
    if (typeof part === 'string') {
      return part.split(regex).map((seg, i) =>
        i % 2 === 1
          ? React.createElement('mark', { className: 'hint-search-highlight', key: key++ }, seg)
          : seg,
      );
    }
    if (React.isValidElement(part)) {
      const element = part as React.ReactElement<{ children?: string; className?: string }>;
      if (typeof element.props.children === 'string' && regex.test(element.props.children)) {
        const existing = element.props.className ?? '';
        return [React.cloneElement(element, { className: `${existing} hint-search-highlight`.trim() })];
      }
    }
    return [part];
  });
}
