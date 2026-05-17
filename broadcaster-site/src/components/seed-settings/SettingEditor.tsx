import Form from 'react-bootstrap/Form';
import type { SettingDefinition, SeedSettingsData } from '@hint-viewer/shared/seed-settings-types';

interface SettingEditorProps {
  selectedKeys: string[];
  settingDefinitions: SettingDefinition[];
  values: SeedSettingsData;
  onUpdateValue: (key: string, value: string | boolean | number) => void;
}

export function SettingEditor({ selectedKeys, settingDefinitions, values, onUpdateValue }: SettingEditorProps) {
  const settingsByKey = new Map(settingDefinitions.map(setting => [setting.key, setting]));

  const grouped = new Map<string, string[]>();
  for (const key of selectedKeys) {
    const setting = settingsByKey.get(key);
    const category = setting?.category ?? 'Other';
    const group = grouped.get(category) ?? [];
    group.push(key);
    grouped.set(category, group);
  }

  return (
    <div className="setting-editor">
      {Array.from(grouped.entries()).map(([category, keys]) => (
        <div key={category} className="setting-editor-category">
          <h6 className="setting-editor-category-title">{category}</h6>
          {keys.map(key => {
            const setting = settingsByKey.get(key);
            if (!setting) return null;
            const label = setting.label ?? setting.key;
            const value = values[key];
            const isMissing = setting.type === 'string' && (value == null || value === '');

            return (
              <div key={key} className="setting-editor-row">
                <Form.Label className="setting-editor-label">{label}</Form.Label>
                {setting.type === 'boolean' && (
                  <Form.Check
                    type="switch"
                    checked={value === true}
                    onChange={e => onUpdateValue(key, e.target.checked)}
                  />
                )}
                {setting.type === 'string' && setting.options && (
                  <Form.Select
                    size="sm"
                    value={String(value ?? '')}
                    onChange={e => onUpdateValue(key, e.target.value)}
                    isInvalid={isMissing}
                  >
                    <option value="">--</option>
                    {setting.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Form.Select>
                )}
                {setting.type === 'number' && (
                  <Form.Control
                    type="number"
                    size="sm"
                    value={value != null ? String(value) : '0'}
                    onChange={e => onUpdateValue(key, Number(e.target.value))}
                    isInvalid={isMissing}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
