import { useEffect, useRef, useState } from 'react';

export interface ItemPickerItem {
  label: string;
  iconPath: string;
}

interface ItemPickerProps {
  items: ItemPickerItem[];
  selectedLabel: string | undefined;
  assetBasePath: string;
  onSelect: (label: string | undefined) => void;
  readOnly?: boolean;
  visible?: boolean;
}

export function ItemPicker({ items, selectedLabel, assetBasePath, onSelect, readOnly = false, visible = true }: ItemPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectedItem = items.find((i) => i.label === selectedLabel);
  const iconSrc = selectedItem
    ? `${assetBasePath}/${selectedItem.iconPath}`
    : `${assetBasePath}/items/empty.png`;

  return (
    <div ref={containerRef} className={`item-picker${visible ? '' : ' item-picker-hidden'}`}>
      <button
        className="item-picker-trigger"
        onClick={readOnly ? undefined : () => setOpen((prev) => !prev)}
        style={{ cursor: readOnly ? 'default' : undefined }}
        aria-label={selectedLabel ?? 'No item selected'}
        title={selectedLabel ?? 'Click to set item'}
        tabIndex={visible && !readOnly ? 0 : -1}
      >
        <img
          src={iconSrc}
          alt={selectedLabel ?? 'empty'}
          className="item-picker-trigger-icon"
          draggable={false}
        />
      </button>
      {open && (
        <div className="item-picker-popover">
          <button
            className={`item-picker-option${!selectedLabel ? ' item-picker-option-selected' : ''}`}
            onClick={() => { onSelect(undefined); setOpen(false); }}
            title="Clear"
          >
            <img src={`${assetBasePath}/items/empty.png`} alt="empty" className="item-picker-option-icon" draggable={false} />
          </button>
          {items.map((item) => (
            <button
              key={item.label}
              className={`item-picker-option${selectedLabel === item.label ? ' item-picker-option-selected' : ''}`}
              onClick={() => { onSelect(item.label); setOpen(false); }}
              title={item.label}
            >
              <img
                src={`${assetBasePath}/${item.iconPath}`}
                alt={item.label}
                className="item-picker-option-icon"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
