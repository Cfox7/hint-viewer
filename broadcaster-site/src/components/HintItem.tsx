import { ReactNode, useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Select from 'react-select';
import type { SingleValue } from 'react-select';
import { FaEdit } from 'react-icons/fa';
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
  const [isSelectingItem, setIsSelectingItem] = useState(false);

  useEffect(() => {
    setEditValue(cleanedHint);
  }, [cleanedHint]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    if (onEditHint) onEditHint(location, e.target.value);
  };

  const selectOptions = hintedItemOptions.map((item) => ({ value: item, label: item }));

  const handleItemSelect = (option: SingleValue<{ value: string; label: string }>) => {
    const value = option?.value ?? '';
    setIsSelectingItem(false);
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
      {isCompleted && (
        <div className="hint-item-found-row">
          {hintedItemEditable && isSelectingItem ? (
            <div style={{ width: 200 }}>
              <Select
                autoFocus
                classNamePrefix="hint-select"
                options={selectOptions}
                onChange={handleItemSelect}
                placeholder={hintedItem || "Select item..."}
                menuPortalTarget={document.body}
                menuPlacement="auto"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (base) => ({ ...base, background: '#181c18', borderColor: '#ffe066', '&:hover': { borderColor: '#ffd700' } }),
                  valueContainer: (base) => ({ ...base, padding: '0 4px' }),
                  input: (base) => ({ ...base, margin: 0, padding: 0, paddingTop: 0, paddingBottom: 0, color: '#dee2e6' }),
                  menu: (base) => ({ ...base, background: '#181c18', border: '1px solid #ffe066' }),
                  option: (base, state) => ({ ...base, background: state.isFocused ? '#222a22' : '#181c18', color: '#dee2e6' }),
                  singleValue: (base) => ({ ...base, color: '#dee2e6' }),
                  placeholder: (base) => ({ ...base, color: '#525252' }),
                }}
              />
            </div>
          ) : (
            <span className="hint-location">
              Hinted Item: {hintedItem && <strong>{hintedItem}</strong>}
            </span>
          )}
          {hintedItemEditable && (
            <Button
              size="sm"
              variant="outline-secondary"
              className="hint-toggle-btn"
              aria-label="Set hinted item"
              onClick={() => setIsSelectingItem((prev) => !prev)}
            >
              <FaEdit />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
