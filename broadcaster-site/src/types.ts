export interface SpoilerLog {
  "Wrinkly Hints": {
    [hintLocation: string]: string;
  };
  "Direct Item Hints"?: {
    [key: string]: string;
  };
}

export interface SpoilerResponse {
  data: SpoilerLog;
  uploadedAt: string;
}
