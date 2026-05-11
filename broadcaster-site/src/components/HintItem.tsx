import { ReactNode, useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Select from 'react-select';
import type { SingleValue } from 'react-select';
import { colorizeHints } from '@hint-viewer/shared/colorizeHints';

interface HintItemProps {
  location: string;
  locationLabel: ReactNode;
  cleanedHint: string;
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
}

export default function HintItem({
  location,
  locationLabel,
  cleanedHint,
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
}: HintItemProps) {
  const [editValue, setEditValue] = useState(cleanedHint);

  useEffect(() => {
    setEditValue(cleanedHint);
  }, [cleanedHint]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    if (onEditHint) onEditHint(location, e.target.value);
  };

  const allOptions = hintedItemOptions.map((item) => ({ value: item, label: item }));
  const selectedOption = hintedItem ? { value: hintedItem, label: hintedItem } : null;

  const groupedOptions = hintedItem
    ? [{ label: `Current: ${hintedItem}`, options: allOptions.filter((o) => o.value !== hintedItem) }]
    : allOptions;

  const handleItemSelect = (option: SingleValue<{ value: string; label: string }>) => {
    const value = option?.value ?? '';
    if (onHintedItemChange) onHintedItemChange(location, value);
  };

  return (
    <div className="hint-item">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="hint-location">{locationLabel}:</span>
        <div className="d-flex gap-1">
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
          {isRevealed ? colorizeHints(cleanedHint) : "???"}
        </p>
      )}
      {isCompleted && !hintedItemEditable && hintedItem && (
        <div className="hint-item-found-row">
          <span className="hint-location" style={{ color: '#ccc' }}>
            Hinted Item: <strong style={{ color: '#dee2e6' }}>{hintedItem}</strong>
          </span>
        </div>
      )}
      {isCompleted && hintedItemEditable && (
        <div className="hint-item-found-row">
          <Select
            classNamePrefix="hint-select"
            options={groupedOptions}
            value={selectedOption}
            onChange={handleItemSelect}
            isClearable
            placeholder="Hinted Item..."
            menuPortalTarget={document.body}
            menuPlacement="auto"
            styles={{
              container: (base) => ({ ...base, width: 220 }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (base) => ({ ...base, background: '#1e241e', borderColor: '#5a7a5a', minHeight: 26, boxShadow: 'none', '&:hover': { borderColor: '#7aaa7a' } }),
              valueContainer: (base) => ({ ...base, padding: '0 4px' }),
              input: (base) => ({ ...base, margin: 0, padding: 0, color: '#ccc' }),
              menu: (base) => ({ ...base, background: '#181c18', border: '1px solid #5a7a5a' }),
              option: (base, state) => ({ ...base, background: state.isFocused ? '#222a22' : '#181c18', color: '#dee2e6' }),
              singleValue: (base, state) => ({ ...base, color: '#ccc', opacity: state.selectProps.menuIsOpen ? 0.3 : 1 }),
              placeholder: (base) => ({ ...base, color: '#666' }),
              clearIndicator: (base) => ({ ...base, padding: '0 4px', color: '#cc4444', '&:hover': { color: '#ff6b6b' } }),
              dropdownIndicator: (base) => ({ ...base, padding: '0 4px', color: '#5a7a5a', '&:hover': { color: '#7aaa7a' } }),
              groupHeading: (base) => ({ ...base, color: '#999', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: 2, paddingBottom: 2 }),
              group: (base) => ({ ...base, paddingTop: 2, paddingBottom: 2, borderBottom: '1px solid #444' }),
            }}
          />
        </div>
      )}
    </div>
  );
}
