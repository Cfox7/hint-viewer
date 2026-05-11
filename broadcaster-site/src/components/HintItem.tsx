import { ReactNode, useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Select from 'react-select';
import type { SingleValue } from 'react-select';
import { useSelectTheme } from '../hooks/useSelectTheme';

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

  const allOptions = hintedItemOptions.map((item) => ({ value: item, label: item }));
  const selectedOption = hintedItem ? { value: hintedItem, label: hintedItem } : null;

  const groupedOptions = hintedItem
    ? [{ label: `Current: ${hintedItem}`, options: allOptions.filter((o) => o.value !== hintedItem) }]
    : allOptions;

  const handleItemSelect = (option: unknown) => {
    const selected = option as SingleValue<{ value: string; label: string }>;
    const value = selected?.value ?? '';
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
          {isRevealed ? colorizedHint : "???"}
        </p>
      )}
      {isCompleted && !hintedItemEditable && hintedItem && (
        <div className="hint-item-found-row">
          <span className="hint-location" style={{ color: 'var(--text-muted)' }}>
            Hinted Item: <strong style={{ color: 'var(--text-primary)' }}>{hintedItem}</strong>
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
            styles={selectStyles}
          />
        </div>
      )}
    </div>
  );
}
