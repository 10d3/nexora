/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";
import { setGlobalColorTheme, themes } from "@/lib/theme/theme-color";
import { ThemeColors, ThemeColorStateParams } from "@/types/theme-types";
import { ThemeProviderProps, useTheme } from "next-themes";
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<ThemeColorStateParams>(
  {} as ThemeColorStateParams
);

export default function ThemeDataProvider({ children }: ThemeProviderProps) {
  const getSavedThemeColor = () => {
    // Only access localStorage in the browser environment
    if (typeof window !== "undefined") {
      try {
        // Make sure the value matches one of your actual theme keys
        const savedTheme = localStorage.getItem("themeColor") as ThemeColors;
        // Check if the saved theme exists in your themes object
        return savedTheme && themes[savedTheme] ? savedTheme : "default";
      } catch (error) {
        console.error(error);
      }
    }
    // Default fallback for server-side rendering - use a theme that definitely exists
    return "zinc" as ThemeColors;
  };

  const [themeColor, setThemeColor] = useState<ThemeColors>("default");
  const [isMounted, setIsMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  // Initialize state after component mounts (client-side only)
  useEffect(() => {
    setThemeColor(getSavedThemeColor());
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      localStorage.setItem("themeColor", themeColor);

      // Use resolvedTheme to handle 'system' preference correctly
      const currentTheme = (resolvedTheme || theme) as "light" | "dark";
      if (currentTheme === "light" || currentTheme === "dark") {
        try {
          // Add error handling around the theme application
          setGlobalColorTheme(currentTheme, themeColor);
        } catch (error) {
          console.error("Error applying theme:", error);
          // Fallback to a known working theme
          setGlobalColorTheme(currentTheme, "default");
        }
      }
    }
  }, [themeColor, theme, resolvedTheme, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
