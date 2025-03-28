/**
 | "zinc"
  | "gray"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose";
 */

import type { ThemeColors } from "@/types/theme-types";

type ThemeValues = {
  [key: string]: string;
};

type ThemeConfig = {
  [color in ThemeColors]: {
    dark: ThemeValues;
    light: ThemeValues;
  };
};

export const themes: ThemeConfig = {
  default: {
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.145 0 0)",
      primary: "oklch(0.205 0 0)",
      "primary-foreground": "oklch(0.985 0 0)",
      secondary: "oklch(0.97 0 0)",
      "secondary-foreground": "oklch(0.205 0 0)",
      muted: "oklch(0.97 0 0)",
      "muted-foreground": "oklch(0.556 0 0)",
      accent: "oklch(0.97 0 0)",
      "accent-foreground": "oklch(0.205 0 0)",
      destructive: "oklch(0.577 0.245 27.325)",
      "destructive-foreground": "oklch(0.985 0 0)",
      border: "oklch(0.922 0 0)",
      input: "oklch(0.922 0 0)",
      ring: "oklch(0.708 0 0)",
      "chart-1": "oklch(0.646 0.222 41.116)",
      "chart-2": "oklch(0.6 0.118 184.704)",
      "chart-3": "oklch(0.398 0.07 227.392)",
      "chart-4": "oklch(0.828 0.189 84.429)",
      "chart-5": "oklch(0.769 0.188 70.08)",
    },
    dark: {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.205 0 0)",
      "card-foreground": "oklch(0.985 0 0)",
      popover: "oklch(0.205 0 0)",
      "popover-foreground": "oklch(0.985 0 0)",
      primary: "oklch(0.922 0 0)",
      "primary-foreground": "oklch(0.205 0 0)",
      secondary: "oklch(0.269 0 0)",
      "secondary-foreground": "oklch(0.985 0 0)",
      muted: "oklch(0.269 0 0)",
      "muted-foreground": "oklch(0.708 0 0)",
      accent: "oklch(0.269 0 0)",
      "accent-foreground": "oklch(0.985 0 0)",
      destructive: "oklch(0.704 0.191 22.216)",
      "destructive-foreground": "oklch(0.985 0 0)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.556 0 0)",
      "chart-1": "oklch(0.488 0.243 264.376)",
      "chart-2": "oklch(0.696 0.17 162.48)",
      "chart-3": "oklch(0.769 0.188 70.08)",
      "chart-4": "oklch(0.627 0.265 303.9)",
      "chart-5": "oklch(0.645 0.246 16.439)",
    },
  },
  palette: {
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.145 0 0)",
      primary: "oklch(0.205 0 0)",
      "primary-foreground": "oklch(0.985 0 0)",
      secondary: "oklch(0.97 0 0)",
      "secondary-foreground": "oklch(0.205 0 0)",
      muted: "oklch(0.97 0 0)",
      "muted-foreground": "oklch(0.556 0 0)",
      accent: "oklch(0.97 0 0)",
      "accent-foreground": "oklch(0.205 0 0)",
      destructive: "oklch(0.577 0.245 27.325)",
      "destructive-foreground": "oklch(0.985 0 0)",
      border: "oklch(0.922 0 0)",
      input: "oklch(0.922 0 0)",
      ring: "oklch(0.708 0 0)",
      "chart-1": "oklch(0.646 0.222 12)",
      "chart-2": "oklch(0.6 0.118 173)",
      "chart-3": "oklch(0.398 0.07 197)",
      "chart-4": "oklch(0.828 0.189 43)",
      "chart-5": "oklch(0.769 0.188 27)",
    },
    dark: {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.205 0 0)",
      "card-foreground": "oklch(0.985 0 0)",
      popover: "oklch(0.205 0 0)",
      "popover-foreground": "oklch(0.985 0 0)",
      primary: "oklch(0.922 0 0)",
      "primary-foreground": "oklch(0.205 0 0)",
      secondary: "oklch(0.269 0 0)",
      "secondary-foreground": "oklch(0.985 0 0)",
      muted: "oklch(0.269 0 0)",
      "muted-foreground": "oklch(0.708 0 0)",
      accent: "oklch(0.269 0 0)",
      "accent-foreground": "oklch(0.985 0 0)",
      destructive: "oklch(0.704 0.191 22.216)",
      "destructive-foreground": "oklch(0.985 0 0)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.556 0 0)",
      "chart-1": "oklch(0.488 0.243 220)",
      "chart-2": "oklch(0.696 0.17 160)",
      "chart-3": "oklch(0.769 0.188 30)",
      "chart-4": "oklch(0.627 0.265 280)",
      "chart-5": "oklch(0.645 0.246 340)",
    },
  },
  midnight: {
    light: {
      background: "oklch(0.06 0 240)",
      foreground: "oklch(0.9 0 60)",
      card: "oklch(0.1 0 240)",
      "card-foreground": "oklch(0.9 0 60)",
      popover: "oklch(0.15 0 240)",
      "popover-foreground": "oklch(0.85 0 60)",
      primary: "oklch(0.9 0 240)",
      "primary-foreground": "oklch(0 0 60)",
      secondary: "oklch(0.15 0 240)",
      "secondary-foreground": "oklch(0.85 0 60)",
      accent: "oklch(0.13 0 240)",
      "accent-foreground": "oklch(1 0 60)",
      destructive: "oklch(0.5 0.2 0)",
      "destructive-foreground": "oklch(0.98 0 0)",
      muted: "oklch(0.25 0 240)",
      "muted-foreground": "oklch(0.85 0 60)",
      border: "oklch(0.2 0 240)",
      input: "oklch(0.2 0 240)",
      ring: "oklch(0.9 0 240)",
      "chart-1": "oklch(0.9 0.02 359)",
      "chart-2": "oklch(0.74 0.01 240)",
      "chart-3": "oklch(0.58 0.01 240)",
      "chart-4": "oklch(0.42 0.01 240)",
      "chart-5": "oklch(0.26 0.02 240)",
    },
    dark: {
      background: "oklch(0.06 0 240)",
      foreground: "oklch(0.9 0 60)",
      card: "oklch(0.1 0 240)",
      "card-foreground": "oklch(0.9 0 60)",
      popover: "oklch(0.15 0 240)",
      "popover-foreground": "oklch(0.85 0 60)",
      primary: "oklch(0.9 0 240)",
      "primary-foreground": "oklch(0 0 60)",
      secondary: "oklch(0.15 0 240)",
      "secondary-foreground": "oklch(0.85 0 60)",
      accent: "oklch(0.13 0 240)",
      "accent-foreground": "oklch(1 0 60)",
      destructive: "oklch(0.5 0.2 0)",
      "destructive-foreground": "oklch(0.98 0 0)",
      muted: "oklch(0.25 0 240)",
      "muted-foreground": "oklch(0.85 0 60)",
      border: "oklch(0.2 0 240)",
      input: "oklch(0.2 0 240)",
      ring: "oklch(0.9 0 240)",
      "chart-1": "oklch(0.9 0.02 359)",
      "chart-2": "oklch(0.74 0.01 240)",
      "chart-3": "oklch(0.58 0.01 240)",
      "chart-4": "oklch(0.42 0.01 240)",
      "chart-5": "oklch(0.26 0.02 240)",
    },
  },
  daylight: {
    light: {
      background: "oklch(0.88 0.05 36)",
      foreground: "oklch(0.15 0.05 36)",
      card: "oklch(0.82 0.05 36)",
      "card-foreground": "oklch(0.2 0.05 36)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.039 0.05 240)",
      primary: "oklch(0.7 0.1 36)",
      "primary-foreground": "oklch(0.11 0.05 36)",
      secondary: "oklch(0.77 0.05 40)",
      "secondary-foreground": "oklch(0.25 0.05 36)",
      accent: "oklch(0.57 0.1 36)",
      "accent-foreground": "oklch(0.17 0.1 36)",
      destructive: "oklch(0.37 0.2 0)",
      "destructive-foreground": "oklch(0.98 0 0)",
      muted: "oklch(0.75 0.05 36)",
      "muted-foreground": "oklch(0.25 0.05 36)",
      border: "oklch(0.6 0.1 36)",
      input: "oklch(0.6 0.1 36)",
      ring: "oklch(0.3 0.1 36)",
      "chart-1": "oklch(0.28 0.05 25)",
      "chart-2": "oklch(0.34 0.05 26)",
      "chart-3": "oklch(0.4 0.05 28)",
      "chart-4": "oklch(0.48 0.05 31)",
      "chart-5": "oklch(0.53 0.05 35)",
    },
    dark: {
      background: "oklch(0.88 0.05 36)",
      foreground: "oklch(0.15 0.05 36)",
      card: "oklch(0.82 0.05 36)",
      "card-foreground": "oklch(0.2 0.05 36)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.039 0.05 240)",
      primary: "oklch(0.7 0.1 36)",
      "primary-foreground": "oklch(0.11 0.05 36)",
      secondary: "oklch(0.77 0.05 40)",
      "secondary-foreground": "oklch(0.25 0.05 36)",
      accent: "oklch(0.57 0.1 36)",
      "accent-foreground": "oklch(0.17 0.1 36)",
      destructive: "oklch(0.37 0.2 0)",
      "destructive-foreground": "oklch(0.98 0 0)",
      muted: "oklch(0.75 0.05 36)",
      "muted-foreground": "oklch(0.25 0.05 36)",
      border: "oklch(0.6 0.1 36)",
      input: "oklch(0.6 0.1 36)",
      ring: "oklch(0.3 0.1 36)",
      "chart-1": "oklch(0.28 0.05 25)",
      "chart-2": "oklch(0.34 0.05 26)",
      "chart-3": "oklch(0.4 0.05 28)",
      "chart-4": "oklch(0.48 0.05 31)",
      "chart-5": "oklch(0.53 0.05 35)",
    },
  },
  emerald: {
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.145 0 0)",
      primary: "oklch(0.28 0.2 142)",
      "primary-foreground": "oklch(0.98 0.01 356)",
      secondary: "oklch(0.97 0 0)",
      "secondary-foreground": "oklch(0.205 0 0)",
      muted: "oklch(0.97 0 0)",
      "muted-foreground": "oklch(0.45 0 0)",
      accent: "oklch(0.97 0 0)",
      "accent-foreground": "oklch(0.205 0 0)",
      destructive: "oklch(0.51 0.2 0)",
      "destructive-foreground": "oklch(0.98 0 0)",
      border: "oklch(0.9 0 0)",
      input: "oklch(0.9 0 0)",
      ring: "oklch(0.28 0.2 142)",
      "chart-1": "oklch(0.2 0.15 139)",
      "chart-2": "oklch(0.44 0.15 140)",
      "chart-3": "oklch(0.28 0.2 142)",
      "chart-4": "oklch(0.15 0.1 137)",
      "chart-5": "oklch(0.09 0.05 141)",
    },
    dark: {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.205 0 0)",
      "card-foreground": "oklch(0.985 0 0)",
      popover: "oklch(0.205 0 0)",
      "popover-foreground": "oklch(0.985 0 0)",
      primary: "oklch(0.28 0.2 142)",
      "primary-foreground": "oklch(0.98 0.01 356)",
      secondary: "oklch(0.97 0 0)",
      "secondary-foreground": "oklch(0.205 0 0)",
      muted: "oklch(0.159 0 0)",
      "muted-foreground": "oklch(0.649 0 0)",
      accent: "oklch(0.159 0 0)",
      "accent-foreground": "oklch(0.985 0 0)",
      destructive: "oklch(0.51 0.2 0)",
      "destructive-foreground": "oklch(0.98 0 0)",
      border: "oklch(0.159 0 0)",
      input: "oklch(0.159 0 0)",
      ring: "oklch(0.28 0.2 142)",
      "chart-1": "oklch(0.28 0.2 142)",
      "chart-2": "oklch(0.2 0.15 139)",
      "chart-3": "oklch(0.24 0.15 140)",
      "chart-4": "oklch(0.15 0.1 137)",
      "chart-5": "oklch(0.09 0.05 141)",
    },
  },
  sapphire: {
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.049 0.1 222.2)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.049 0.1 222.2)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.049 0.1 222.2)",
      primary: "oklch(0.533 0.2 221.2)",
      "primary-foreground": "oklch(0.98 0.01 210)",
      secondary: "oklch(0.961 0.01 210)",
      "secondary-foreground": "oklch(0.112 0.05 222.2)",
      muted: "oklch(0.961 0.01 210)",
      "muted-foreground": "oklch(0.44 0.05 215.4)",
      accent: "oklch(0.961 0.01 210)",
      "accent-foreground": "oklch(0.112 0.05 222.2)",
      destructive: "oklch(0.51 0.2 0)",
      "destructive-foreground": "oklch(0.98 0.01 210)",
      border: "oklch(0.914 0.05 214.3)",
      input: "oklch(0.914 0.05 214.3)",
      ring: "oklch(0.533 0.2 221.2)",
      "chart-1": "oklch(0.533 0.2 221.2)",
      "chart-2": "oklch(0.68 0.2 212)",
      "chart-3": "oklch(0.6 0.2 216)",
      "chart-4": "oklch(0.78 0.2 210)",
      "chart-5": "oklch(0.87 0.2 212)",
    },
    dark: {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.205 0 0)",
      "card-foreground": "oklch(0.985 0 0)",
      popover: "oklch(0.205 0 0)",
      "popover-foreground": "oklch(0.985 0 0)",
      primary: "oklch(0.533 0.2 221.2)",
      "primary-foreground": "oklch(0.98 0.01 210)",
      secondary: "oklch(0.961 0.01 210)",
      "secondary-foreground": "oklch(0.112 0.05 222.2)",
      muted: "oklch(0.159 0 0)",
      "muted-foreground": "oklch(0.649 0 0)",
      accent: "oklch(0.159 0 0)",
      "accent-foreground": "oklch(0.985 0 0)",
      destructive: "oklch(0.51 0.2 0)",
      "destructive-foreground": "oklch(0.98 0.01 210)",
      border: "oklch(0.159 0 0)",
      input: "oklch(0.159 0 0)",
      ring: "oklch(0.533 0.2 221.2)",
      "chart-1": "oklch(0.533 0.2 221.2)",
      "chart-2": "oklch(0.68 0.2 212)",
      "chart-3": "oklch(0.6 0.2 216)",
      "chart-4": "oklch(0.78 0.2 210)",
      "chart-5": "oklch(0.87 0.2 212)",
    },
  },
  ruby: {
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.145 0 0)",
      primary: "oklch(0.498 0.2 346.8)",
      "primary-foreground": "oklch(0.99 0.2 355.7)",
      secondary: "oklch(0.97 0 0)",
      "secondary-foreground": "oklch(0.205 0 0)",
      muted: "oklch(0.97 0 0)",
      "muted-foreground": "oklch(0.45 0 0)",
      accent: "oklch(0.97 0 0)",
      "accent-foreground": "oklch(0.205 0 0)",
      destructive: "oklch(0.51 0.2 0)",
      "destructive-foreground": "oklch(0.98 0 0)",
      border: "oklch(0.9 0 0)",
      input: "oklch(0.9 0 0)",
      ring: "oklch(0.498 0.2 346.8)",
      "chart-1": "oklch(0.5 0.2 347)",
      "chart-2": "oklch(0.91 0.2 352)",
      "chart-3": "oklch(0.72 0.2 350)",
      "chart-4": "oklch(0.82 0.2 351)",
      "chart-5": "oklch(0.62 0.2 349)",
    },
    dark: {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.205 0 0)",
      "card-foreground": "oklch(0.985 0 0)",
      popover: "oklch(0.205 0 0)",
      "popover-foreground": "oklch(0.985 0 0)",
      primary: "oklch(0.498 0.2 346.8)",
      "primary-foreground": "oklch(0.99 0.2 355.7)",
      secondary: "oklch(0.97 0 0)",
      "secondary-foreground": "oklch(0.205 0 0)",
      muted: "oklch(0.159 0 0)",
      "muted-foreground": "oklch(0.649 0 0)",
      accent: "oklch(0.159 0 0)",
      "accent-foreground": "oklch(0.985 0 0)",
      destructive: "oklch(0.51 0.2 0)",
      "destructive-foreground": "oklch(0.98 0 0)",
      border: "oklch(0.159 0 0)",
      input: "oklch(0.159 0 0)",
      ring: "oklch(0.533 0.2 221.2)",
      "chart-1": "oklch(0.5 0.2 347)",
      "chart-2": "oklch(0.62 0.2 349)",
      "chart-3": "oklch(0.72 0.2 350)",
      "chart-4": "oklch(0.82 0.2 351)",
      "chart-5": "oklch(0.91 0.2 352)",
    },
  },
};

export function setGlobalColorTheme(
  themeMode: "dark" | "light",
  color: ThemeColors
) {
  // Add error handling to prevent the undefined error
  if (!themes[color]) {
    console.error(
      `Theme color "${color}" not found, falling back to "default"`
    );
    color = "default"; // Fallback to a theme we know exists
  }

  if (!themes[color][themeMode]) {
    console.error(
      `Theme mode "${themeMode}" not found for color "${color}", falling back to "light"`
    );
    themeMode = "light"; // Fallback to light mode
  }

  const theme = themes[color][themeMode];

  // Apply theme colors to CSS variables
  for (const key in theme) {
    // Directly set OKLCH values from theme configuration
    document.documentElement.style.setProperty(`--${key}`, theme[key]);
  }

  // Set a data attribute on the document for debugging
  document.documentElement.setAttribute("data-theme-color", color);
  document.documentElement.setAttribute("data-theme-mode", themeMode);
}
