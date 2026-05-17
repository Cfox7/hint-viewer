import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css';
import { FaChevronRight, FaChevronLeft, FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { useGame } from '../../contexts/GameContext';
import { useSeedSettings } from '../../hooks/use-seed-settings';
import { SettingEditor } from './SettingEditor';
import type { SeedSettingsData } from '@hint-viewer/shared/seed-settings-types';
import { useEffect } from 'react';

const listboxIcons = {
  moveToSelected: <FaChevronRight />,
  moveAllToSelected: <FaAngleDoubleRight />,
  moveToAvailable: <FaChevronLeft />,
  moveAllToAvailable: <FaAngleDoubleLeft />,
};

interface SeedSettingsOffcanvasProps {
  show: boolean;
  onHide: () => void;
  onSaveSuccess: () => void;
  channelId: string;
  extractedSettings?: SeedSettingsData;
}

export function SeedSettingsOffcanvas({ show, onHide, onSaveSuccess, channelId, extractedSettings }: SeedSettingsOffcanvasProps) {
  const { game } = useGame();
  const { selectedKeys, setSelectedKeys, values, setValues, updateValue, save, loading, saving, hasUnsavedChanges, hasMissingValues } = useSeedSettings(channelId);

  const settingDefinitions = game.availableSettings ?? [];
  const defaultSelected = game.defaultSettings ?? [];

  useEffect(() => {
    if (!extractedSettings) return;
    setValues(extractedSettings);
    if (selectedKeys.length === 0) {
      setSelectedKeys(defaultSelected);
    }
  }, [extractedSettings]);

  const listboxOptions = buildGroupedOptions(settingDefinitions);
  const definitionOrder = new Map(settingDefinitions.map((s, i) => [s.key, i]));
  const orderedSelectedKeys = [...selectedKeys].sort((a, b) => (definitionOrder.get(a) ?? 0) - (definitionOrder.get(b) ?? 0));

  const handleSave = async () => {
    await save();
    onHide();
    onSaveSuccess();
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="top" className="seed-settings-offcanvas">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Seed Settings</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {loading ? (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <div className="seed-settings-selector mb-3">
              <DualListBox
                options={listboxOptions}
                selected={selectedKeys}
                onChange={setSelectedKeys}
                canFilter
                icons={listboxIcons}
              />
            </div>

            {orderedSelectedKeys.length > 0 && (
              <div className="seed-settings-editor mb-3">
                <h6>Values</h6>
                <SettingEditor
                  selectedKeys={orderedSelectedKeys}
                  settingDefinitions={settingDefinitions}
                  values={values}
                  onUpdateValue={updateValue}
                />
              </div>
            )}

            {hasMissingValues && (
              <div className="text-warning mb-2 text-center" style={{ fontSize: '0.875rem' }}>
                All selected settings must have a value before saving.
              </div>
            )}
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges || hasMissingValues}
              className="w-100"
            >
              {saving ? <Spinner size="sm" animation="border" /> : 'Save to Viewers'}
            </Button>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

function buildGroupedOptions(settingDefinitions: { key: string; label?: string; category: string }[]) {
  const groups = new Map<string, { value: string; label: string }[]>();
  for (const setting of settingDefinitions) {
    const group = groups.get(setting.category) ?? [];
    group.push({ value: setting.key, label: setting.label ?? setting.key });
    groups.set(setting.category, group);
  }
  return Array.from(groups.entries()).map(([category, options]) => ({
    label: category,
    options,
  }));
}
