export interface SpoilerLog {
  "Wrinkly Hints": {
    [hintLocation: string]: string;
  };
}

export interface SpoilerResponse {
  data: SpoilerLog;
  uploadedAt: string;
}
