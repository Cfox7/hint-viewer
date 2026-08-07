import { ReactNode, useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import Select from 'react-select';
import type { MultiValue, SelectInstance } from 'react-select';
import { useSelectTheme } from '../hooks/useSelectTheme';

interface ItemOption { value: string; label: string; }

interface HintItemProps {
  location: string;
  locationLabel: ReactNode;
  cleanedHint: string;
  colorizedHint: ReactNode;
  isRevealed: boolean;
  isCompleted: boolean;
  hideReveal: boolean;
  onCompleteWithLinks: (location: string) => void;
  onRevealWithLinks: (location: string) => void;
  editable?: boolean;
  onEditHint?: (location: string, value: string) => void;
  hintedItemOptions?: string[];
  hintedItem?: string;
  hintedItemEditable?: boolean;
  onHintedItemChange?: (location: string, item: string) => void;
  hideLocation?: boolean;
}

function parseItemList(value: string): string[] {
  return value ? value.split(', ').filter(Boolean) : [];
}

function serializeItemList(items: string[]): string {
  return items.join(', ');
}

export default function HintItem({
  location,
  locationLabel,
  cleanedHint,
  colorizedHint,
  isRevealed,
  isCompleted,
  hideReveal,
  onCompleteWithLinks,
  onRevealWithLinks,
  editable = false,
  onEditHint,
  hintedItemOptions = [] as string[],
  hintedItem = '',
  hintedItemEditable = true,
  onHintedItemChange,
  hideLocation = false,
}: HintItemProps) {
  const selectStyles = useSelectTheme();
  const [editValue, setEditValue] = useState(cleanedHint);

  useEffect(() => {
    setEditValue(cleanedHint);
  }, [cleanedHint]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    if (onEditHint) onEditHint(location, e.target.value);
  };

  const selectRef = useRef<SelectInstance<ItemOption, true>>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const itemList = parseItemList(hintedItem);
  const allOptions = hintedItemOptions.map((item) => ({ value: item, label: item }));
  const selectedValues = itemList.map((item) => ({ value: item, label: item }));

  const handleItemChange = (options: MultiValue<ItemOption>) => {
    if (!onHintedItemChange) return;
    onHintedItemChange(location, serializeItemList(options.map((o) => o.value)));
  };

  const handleAddClick = () => {
    setMenuOpen(true);
    selectRef.current?.focus();
  };

  return (
    <div className="hint-item">
      <div className="d-flex justify-content-between align-items-center mb-1">
        {!hideLocation && <span className="hint-location">{locationLabel}:</span>}
        <div className={`d-flex gap-1${hideLocation ? ' ms-auto' : ''}`}>
          {isRevealed && !hideReveal && (
            <Button size="sm" variant={isCompleted ? "success" : "outline-success"} className="hint-toggle-btn" aria-label={isCompleted ? "Mark uncompleted" : "Mark completed"} onClick={() => onCompleteWithLinks(location)}>
              <i className={`bi ${isCompleted ? "bi-check-circle-fill" : "bi-check-circle"}`}></i>
            </Button>
          )}
          {!hideReveal && (
            <Button size="sm" variant={isRevealed ? "outline-secondary" : "outline-primary"} className="hint-toggle-btn" aria-label={isRevealed ? "Hide hint" : "Reveal hint"} onClick={() => onRevealWithLinks(location)}>
              <i className={`bi ${isRevealed ? "bi-eye-slash" : "bi-eye"}`}></i>
            </Button>
          )}
        </div>
      </div>
      {editable ? (
        <input
          type="text"
          className="form-control hint-edit-input"
          value={editValue}
          onChange={handleInputChange}
          placeholder="Enter hint (leave blank to clear)"
        />
      ) : (
        <p className={`hint-text${isRevealed && isCompleted ? ' completed' : ''}`}>
          {isRevealed ? colorizedHint : "???"}
        </p>
      )}
      {isCompleted && !hintedItemEditable && hintedItem && (
        <div className="hinted-item-inline" style={{ textAlign: 'center' }}>
          <span className="hint-location" style={{ color: 'var(--text-muted)' }}>
            Hinted Item: <strong style={{ color: 'var(--text-primary)' }}>{hintedItem}</strong>
          </span>
        </div>
      )}
      {hintedItemEditable && (
        <div className="hinted-item-inline" style={{ visibility: isCompleted ? 'visible' : 'hidden' }}>
          <div className="hinted-item-select-row">
            <Select<ItemOption, true>
              ref={selectRef}
              isMulti
              classNamePrefix="hint-select"
              options={allOptions}
              value={selectedValues}
              onChange={handleItemChange}
              placeholder="Hinted Items..."
              menuPortalTarget={document.body}
              menuPlacement="auto"
              menuIsOpen={menuOpen}
              onMenuClose={() => setMenuOpen(false)}
              openMenuOnClick={false}
              openMenuOnFocus={false}
              isSearchable={menuOpen}
              styles={selectStyles}
              components={{
                DropdownIndicator: () => (
                  <button className="hinted-item-add-btn" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleAddClick(); }} aria-label="Add hinted item">+</button>
                ),
                IndicatorSeparator: () => null,
                ClearIndicator: () => null,
              }}
              isClearable={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
