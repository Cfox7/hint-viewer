import { useEffect, useState } from 'react';
import { getState, postSeedSettings } from '../api/spoilerApi';
import type { SeedSettingsData } from '@hint-viewer/shared/seed-settings-types';
import { useGame } from '../contexts/GameContext';

interface UseSeedSettingsReturn {
  selectedKeys: string[];
  setSelectedKeys: (keys: string[]) => void;
  values: SeedSettingsData;
  setValues: (values: SeedSettingsData) => void;
  updateValue: (key: string, value: string | boolean | number) => void;
  save: () => Promise<void>;
  loading: boolean;
  saving: boolean;
  hasUnsavedChanges: boolean;
  hasMissingValues: boolean;
}

export function useSeedSettings(channelId: string | undefined): UseSeedSettingsReturn {
  const { game } = useGame();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [values, setValues] = useState<SeedSettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<string>('');

  useEffect(() => {
    if (!channelId) return;
    let mounted = true;
    (async () => {
      try {
        const data = await getState(channelId);
        if (!mounted || !data) return;

        const savedSettings = (data.seedSettings ?? {}) as SeedSettingsData;
        const keys = Object.keys(savedSettings);
        setSelectedKeys(keys.length > 0 ? keys : (game.defaultSettings ?? []));
        setSavedSnapshot(JSON.stringify(savedSettings));

        const spoiler = data.spoilerData as Record<string, unknown> | null;
        const allValues = spoiler && game.extractSettings
          ? game.extractSettings(spoiler)
          : {};
        setValues({ ...allValues, ...savedSettings });
      } catch (err) {
        console.warn('Failed to load seed settings', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [channelId]);

  useEffect(() => {
    const current = buildPayload(selectedKeys, values);
    setHasUnsavedChanges(JSON.stringify(current) !== savedSnapshot);
  }, [selectedKeys, values, savedSnapshot]);

  const updateValue = (key: string, value: string | boolean | number) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!channelId) return;
    setSaving(true);
    try {
      const payload = buildPayload(selectedKeys, values);
      await postSeedSettings(channelId, payload);
      setSavedSnapshot(JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to save seed settings', err);
    } finally {
      setSaving(false);
    }
  };

  const settingsByKey = new Map((game.availableSettings ?? []).map(s => [s.key, s]));
  const hasMissingValues = selectedKeys.some(key => {
    const setting = settingsByKey.get(key);
    if (!setting || setting.type === 'boolean') return false;
    const val = values[key];
    return val == null || val === '';
  });

  return { selectedKeys, setSelectedKeys, values, setValues, updateValue, save, loading, saving, hasUnsavedChanges, hasMissingValues };
}

function buildPayload(selectedKeys: string[], values: SeedSettingsData): SeedSettingsData {
  const payload: SeedSettingsData = {};
  for (const key of selectedKeys) {
    if (key in values) {
      payload[key] = values[key];
    }
  }
  return payload;
}
