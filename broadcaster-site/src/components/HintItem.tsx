import { ReactNode, useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
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
}: HintItemProps) {
  const [editValue, setEditValue] = useState(cleanedHint);

  // Keep local input in sync if cleanedHint changes externally
  // (e.g., after save or undo)
  useEffect(() => {
    setEditValue(cleanedHint);
  }, [cleanedHint]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    if (onEditHint) onEditHint(location, e.target.value);
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
    </div>
  );
}