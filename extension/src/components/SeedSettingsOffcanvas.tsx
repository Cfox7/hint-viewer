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

  const grouped = new Map<string, SettingEntry[]>();
  for (const [key, value] of entries) {
    const setting = settingsByKey.get(key);
    const category = setting?.category ?? 'Other';
    const label = setting?.label ?? key;
    const group = grouped.get(category) ?? [];
    group.push({ key, label, value, setting });
    grouped.set(category, group);
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
        <Table size="sm" variant="dark" borderless striped className="seed-settings-viewer-table">
          <tbody>
            {Array.from(grouped.entries()).map(([category, settings]) => (
              <CategoryGroup key={category} category={category} settings={settings} />
            ))}
          </tbody>
        </Table>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

interface CategoryGroupProps {
  category: string;
  settings: SettingEntry[];
}

function CategoryGroup({ category, settings }: CategoryGroupProps) {
  const rows: [SettingEntry, SettingEntry | null][] = [];
  for (let i = 0; i < settings.length; i += 2) {
    rows.push([settings[i], settings[i + 1] ?? null]);
  }

  return (
    <>
      <tr className="seed-settings-category-row">
        <td colSpan={4}>{category}</td>
      </tr>
      {rows.map(([left, right]) => (
        <tr key={left.key}>
          <td className="seed-settings-label">{left.label}</td>
          <td className="seed-settings-value">
            <SettingValue value={left.value} setting={left.setting} />
          </td>
          {right ? (
            <>
              <td className="seed-settings-label">{right.label}</td>
              <td className="seed-settings-value">
                <SettingValue value={right.value} setting={right.setting} />
              </td>
            </>
          ) : (
            <td colSpan={2} />
          )}
        </tr>
      ))}
    </>
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
