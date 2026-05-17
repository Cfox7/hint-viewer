export interface SettingDefinition {
  key: string;
  label?: string;
  category: string;
  type: 'string' | 'boolean' | 'number';
  options?: string[];
}

export type SeedSettingsData = Record<string, string | boolean | number>;
