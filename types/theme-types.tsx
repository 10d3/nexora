/* eslint-disable @typescript-eslint/no-unused-vars */
export type ThemeColors =
  | "default"
  | "palette"
  | "midnight"
  | "daylight"
  | "emerald"
  | "sapphire"
  | "ruby";

export interface ThemeColorStateParams {
  themeColor: ThemeColors;
  setThemeColor: React.Dispatch<React.SetStateAction<ThemeColors>>;
}
