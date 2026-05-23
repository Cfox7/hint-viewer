import { Offcanvas, Table } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useGame } from '../contexts/GameContext';
import type { SeedSettingsData, SettingDefinition } from '@hint-viewer/shared/seed-settings-types';

interface SettingEntry {
  key: string;
  label: string;
  value: string | boolean | number;
  setting?: SettingDefinition;
}

interface SeedSettingsOffcanvasProps {
  show: boolean;
  onHide: () => void;
  seedSettings: SeedSettingsData;
}

export function SeedSettingsOffcanvas({ show, onHide, seedSettings }: SeedSettingsOffcanvasProps) {
  const { game } = useGame();
  const settingDefinitions = game.availableSettings ?? [];
  const settingsByKey = new Map(settingDefinitions.map(s => [s.key, s]));

  const entries = Object.entries(seedSettings);
  if (entries.length === 0) return null;

  const categoryOrder = new Map<string, number>();
  const definitionOrder = new Map<string, number>();
  for (let i = 0; i < settingDefinitions.length; i++) {
    const cat = settingDefinitions[i].category;
    if (!categoryOrder.has(cat)) categoryOrder.set(cat, categoryOrder.size);
    definitionOrder.set(settingDefinitions[i].key, i);
  }

  const grouped = new Map<string, SettingEntry[]>();
  for (const [key, value] of entries) {
    const setting = settingsByKey.get(key);
    if (!setting) continue;
    const category = setting.category;
    const label = setting.label ?? key;
    const group = grouped.get(category) ?? [];
    group.push({ key, label, value, setting });
    grouped.set(category, group);
  }

  const categories = Array.from(grouped.entries())
    .sort((a, b) => (categoryOrder.get(a[0]) ?? Infinity) - (categoryOrder.get(b[0]) ?? Infinity));
  for (const [, group] of categories) {
    group.sort((a, b) => (definitionOrder.get(a.key) ?? Infinity) - (definitionOrder.get(b.key) ?? Infinity));
  }

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="top"
      className="seed-settings-viewer-offcanvas"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Seed Settings</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="px-2 pb-2 pt-0">
        <div className="seed-settings-columns">
          {categories.map(([category, categoryEntries]) => (
            <div key={category} className="seed-settings-category-block">
              <Table
                size="sm"
                variant="dark"
                borderless
                striped
                className="seed-settings-viewer-table"
              >
                <thead>
                  <tr>
                    <th colSpan={2} className="seed-settings-category-header">
                      {category}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryEntries.map(entry => (
                    <tr key={entry.key}>
                      <td className="seed-settings-label">{entry.label}</td>
                      <td className="seed-settings-value">
                        <SettingValue value={entry.value} setting={entry.setting} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

function SettingValue({ value, setting }: { value: string | boolean | number; setting?: SettingDefinition }) {
  if (typeof value === 'boolean') {
    return value ? <FaCheck className="text-success" /> : <FaTimes className="text-danger" />;
  }
  return <>{formatDisplayValue(String(value), setting)}</>;
}

function formatDisplayValue(value: string, setting?: SettingDefinition): string {
  if (!setting?.options) return value;
  const option = setting.options.find(o => o.value === value);
  return option?.label ?? value;
}
