import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

// AsyncStorage is React Native’s simple, promise-based API for persisting small bits of data on a user’s device. Think of it as the mobile-app equivalent of the browser’s localStorage, but asynchronous and cross-platform.

export interface ColorScheme {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
  gradients: {
    background: [string, string];
    surface: [string, string];
    primary: [string, string];
    success: [string, string];
    warning: [string, string];
    danger: [string, string];
    muted: [string, string];
    empty: [string, string];
  };
  backgrounds: {
    input: string;
    editInput: string;
  };
  statusBarStyle: "light-content" | "dark-content";
  isDark: boolean;
}

export type ThemeName = "light" | "dark" | "duolingo" | "instagram";

export const THEME_OPTIONS: { name: ThemeName; label: string }[] = [
  { name: "light", label: "Light" },
  { name: "dark", label: "Dark" },
  { name: "duolingo", label: "Duolingo" },
  { name: "instagram", label: "Instagram" },
];

const lightColors: ColorScheme = {
  bg: "#f8fafc",
  surface: "#ffffff",
  text: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  shadow: "#000000",
  gradients: {
    background: ["#f8fafc", "#e2e8f0"],
    surface: ["#ffffff", "#f8fafc"],
    primary: ["#3b82f6", "#1d4ed8"],
    success: ["#10b981", "#059669"],
    warning: ["#f59e0b", "#d97706"],
    danger: ["#ef4444", "#dc2626"],
    muted: ["#9ca3af", "#6b7280"],
    empty: ["#f3f4f6", "#e5e7eb"],
  },
  backgrounds: {
    input: "#ffffff",
    editInput: "#ffffff",
  },
  statusBarStyle: "dark-content",
  isDark: false,
};

const darkColors: ColorScheme = {
  bg: "#0f172a",
  surface: "#1e293b",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  border: "#334155",
  primary: "#60a5fa",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  shadow: "#000000",
  gradients: {
    background: ["#0f172a", "#1e293b"],
    surface: ["#1e293b", "#334155"],
    primary: ["#3b82f6", "#1d4ed8"],
    success: ["#10b981", "#059669"],
    warning: ["#f59e0b", "#d97706"],
    danger: ["#ef4444", "#dc2626"],
    muted: ["#374151", "#4b5563"],
    empty: ["#374151", "#4b5563"],
  },
  backgrounds: {
    input: "#1e293b",
    editInput: "#0f172a",
  },
  statusBarStyle: "light-content",
  isDark: true,
};

// Bright, playful green — inspired by Duolingo's owl-and-leaf palette.
const duolingoColors: ColorScheme = {
  bg: "#fffcf5",
  surface: "#ffffff",
  text: "#3c3c3c",
  textMuted: "#777777",
  border: "#e5e5e5",
  primary: "#58cc02",
  success: "#58cc02",
  warning: "#ffc800",
  danger: "#ff4b4b",
  shadow: "#000000",
  gradients: {
    background: ["#fffcf5", "#f0fdf0"],
    surface: ["#ffffff", "#fbfff0"],
    primary: ["#89e219", "#58cc02"],
    success: ["#89e219", "#58cc02"],
    warning: ["#ffe066", "#ffc800"],
    danger: ["#ff6b6b", "#ff4b4b"],
    muted: ["#e5e5e5", "#cccccc"],
    empty: ["#f7f7f7", "#e5e5e5"],
  },
  backgrounds: {
    input: "#ffffff",
    editInput: "#ffffff",
  },
  statusBarStyle: "dark-content",
  isDark: false,
};

// Warm sunset gradient — inspired by Instagram's brand palette.
const instagramColors: ColorScheme = {
  bg: "#fafafa",
  surface: "#ffffff",
  text: "#262626",
  textMuted: "#8e8e8e",
  border: "#dbdbdb",
  primary: "#c13584",
  success: "#4caf50",
  warning: "#fcaf45",
  danger: "#ed4956",
  shadow: "#000000",
  gradients: {
    background: ["#fdf4f7", "#fef6ef"],
    surface: ["#ffffff", "#fef9f5"],
    primary: ["#833ab4", "#fd1d1d"],
    success: ["#4caf50", "#2e7d32"],
    warning: ["#f77737", "#fcaf45"],
    danger: ["#fd1d1d", "#c13584"],
    muted: ["#dbdbdb", "#c7c7c7"],
    empty: ["#f5f5f5", "#e5e5e5"],
  },
  backgrounds: {
    input: "#fafafa",
    editInput: "#ffffff",
  },
  statusBarStyle: "dark-content",
  isDark: false,
};

const themes: Record<ThemeName, ColorScheme> = {
  light: lightColors,
  dark: darkColors,
  duolingo: duolingoColors,
  instagram: instagramColors,
};

interface ThemeContextType {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  colors: ColorScheme;
  /** @deprecated kept for existing screens — true when the active theme is "dark" */
  isDarkMode: boolean;
  /** @deprecated kept for existing screens — switches between "light" and "dark" only */
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<undefined | ThemeContextType>(undefined);

const STORAGE_KEY = "themeName";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeNameState] = useState<ThemeName>("light");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value && value in themes) {
        setThemeNameState(value as ThemeName);
        return;
      }
      // Migrate from the old boolean "darkMode" key, if present.
      AsyncStorage.getItem("darkMode").then((legacy) => {
        if (legacy && JSON.parse(legacy) === true) {
          setThemeNameState("dark");
        }
      });
    });
  }, []);

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name);
    AsyncStorage.setItem(STORAGE_KEY, name);
  };

  const toggleDarkMode = () => {
    setThemeName(themeName === "dark" ? "light" : "dark");
  };

  const colors = themes[themeName];

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        setThemeName,
        colors,
        isDarkMode: themeName === "dark",
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export default useTheme;
