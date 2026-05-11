import { useMemo } from 'react';
import type { StylesConfig } from 'react-select';
import { useGame } from '../contexts/GameContext';

interface SelectOption {
  value: string;
  label: string;
}

export function useSelectTheme(): StylesConfig<SelectOption> {
  const { game } = useGame();

  return useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    const v = (name: string) => root.getPropertyValue(name).trim();

    const bgPrimary = v('--bg-primary');
    const bgSecondary = v('--bg-secondary');
    const textPrimary = v('--text-primary');
    const textMuted = v('--text-muted');
    const borderColor = v('--border-color');
    const selectBg = v('--select-bg');
    const selectBorder = v('--select-border');
    const selectBorderHover = v('--select-border-hover');
    const selectClear = v('--select-clear');
    const selectClearHover = v('--select-clear-hover');

    return {
      container: (base) => ({ ...base, minWidth: 220, width: 'auto', maxWidth: 420 }),
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      control: (base) => ({ ...base, background: selectBg, borderColor: selectBorder, minHeight: 26, boxShadow: 'none', '&:hover': { borderColor: selectBorderHover } }),
      valueContainer: (base) => ({ ...base, padding: '0 4px' }),
      input: (base) => ({ ...base, margin: 0, padding: 0, color: textPrimary }),
      menu: (base) => ({ ...base, background: bgPrimary, border: `1px solid ${selectBorder}` }),
      option: (base, state) => ({ ...base, background: state.isFocused ? bgSecondary : bgPrimary, color: textPrimary }),
      singleValue: (base, state) => ({ ...base, color: textPrimary, opacity: state.selectProps.menuIsOpen ? 0.3 : 1 }),
      placeholder: (base) => ({ ...base, color: textMuted }),
      clearIndicator: (base) => ({ ...base, padding: '0 4px', color: selectClear, '&:hover': { color: selectClearHover } }),
      dropdownIndicator: (base) => ({ ...base, padding: '0 4px', color: selectBorder, '&:hover': { color: selectBorderHover } }),
      groupHeading: (base) => ({ ...base, color: textMuted, fontSize: '0.7rem', textTransform: 'uppercase' as const, marginBottom: 2, paddingBottom: 2 }),
      group: (base) => ({ ...base, paddingTop: 2, paddingBottom: 2, borderBottom: `1px solid ${borderColor}` }),
    };
  }, [game.id]);
}
