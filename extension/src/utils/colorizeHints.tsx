import React from "react";
import colorMap from "./colorRules";

const keywords = Object.keys(colorMap).sort((a, b) => b.length - a.length);

export function colorizeHints(text: string): React.ReactNode {
  if (!text) return null;
  let parts: React.ReactNode[] = [text];
  let key = 0;

  keywords.forEach(keyword => {
    let regex: RegExp;
    if (keyword === "key" || keyword === "keys") {
      // Match "key 1", "keys 2", "key 1, 2, and 5", "keys 3 and 8", etc.
      // Only allow "and" if followed by a number
      regex = new RegExp(
        `\\b(${keyword}(?:\\s*(?:\\d+|,|\\s|and(?=\\s*\\d+)))+)\\b`,
        "gi"
      );
    } else {
      regex = new RegExp(`\\b(${keyword})\\b`, "gi");
    }
    const nextParts: React.ReactNode[] = [];
    parts.forEach(part => {
      if (typeof part !== "string") {
        nextParts.push(part);
        return;
      }
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          nextParts.push(part.slice(lastIndex, match.index));
        }
        nextParts.push(
          <span style={{ color: colorMap[keyword] }} key={key++}>
            {match[0]}
          </span>
        );
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.length) {
        nextParts.push(part.slice(lastIndex));
      }
    });
    parts = nextParts;
  });

  return <>{parts}</>;
}