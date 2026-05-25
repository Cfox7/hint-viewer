export interface SettingOption {
  value: string;
  label: string;
}

export interface SettingDefinition {
  key: string;
  label?: string;
  category: string;
  type: 'string' | 'boolean' | 'number';
  options?: SettingOption[];
}

export type SeedSettingsData = Record<string, string | boolean | number>;

export interface SeedSettingsPreset {
  name: string;
  description: string;
  selectedKeys: string[];
  values: SeedSettingsData;
}
