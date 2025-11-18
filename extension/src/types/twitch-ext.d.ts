/// <reference types="@types/twitch-ext" />

declare global {
  interface Window {
    Twitch?: {
      ext: any;
    };
  }
}

export {};
