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

  const categories = Array.from(grouped.entries());
  const pairs: [string, SettingEntry[]][][] = [];
  for (let i = 0; i < categories.length; i += 2) {
    pairs.push(categories.slice(i, i + 2));
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
        {pairs.map(pair => (
          <Table
            key={pair[0][0]}
            size="sm"
            variant="dark"
            borderless
            striped
            className="seed-settings-viewer-table"
          >
            <thead>
              <tr>
                {pair.map(([category]) => (
                  <th key={category} colSpan={2} className="seed-settings-category-header">
                    {category}
                  </th>
                ))}
                {pair.length === 1 && <th colSpan={2} />}
              </tr>
            </thead>
            <tbody>
              <CategoryPairRows pair={pair} />
            </tbody>
          </Table>
        ))}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

function CategoryPairRows({ pair }: { pair: [string, SettingEntry[]][] }) {
  const left = pair[0][1];
  const right = pair[1]?.[1] ?? [];
  const maxRows = Math.max(left.length, right.length);
  const rows = [];

  for (let i = 0; i < maxRows; i++) {
    rows.push(
      <tr key={i}>
        {left[i] ? (
          <>
            <td className="seed-settings-label">{left[i].label}</td>
            <td className="seed-settings-value">
              <SettingValue value={left[i].value} setting={left[i].setting} />
            </td>
          </>
        ) : (
          <td colSpan={2} />
        )}
        {right[i] ? (
          <>
            <td className="seed-settings-label">{right[i].label}</td>
            <td className="seed-settings-value">
              <SettingValue value={right[i].value} setting={right[i].setting} />
            </td>
          </>
        ) : (
          <td colSpan={2} />
        )}
      </tr>
    );
  }

  return <>{rows}</>;
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
