export interface SpoilerLog {
  "Wrinkly Hints": {
    [hintLocation: string]: string;
  };
  "Direct Item Hints"?: {
    [key: string]: string;
  };
  // Optional progressive hint fields (may be absent in many spoilers)
  "Progressive Hint Item"?: string;
  "Progressive Hint Cap"?: number | string;
  // Some spoiler logs put these under a Settings object
  Settings?: {
    "Progressive Hint Item"?: string;
    "Progressive Hint Cap"?: number | string;
    [key: string]: any;
  };
}

export interface SpoilerResponse {
  data: SpoilerLog;
  uploadedAt: string;
}
