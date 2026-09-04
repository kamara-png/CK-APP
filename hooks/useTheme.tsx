import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

// AsyncStorage is React Native's simple, promise-based API for persisting small bits of data on a user's device.

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

export type ThemeAccent = "default" | "duolingo" | "instagram";
export type ThemeMode = "light" | "dark";
/** @deprecated old combined theme identifier, kept only for migrating existing saved values */
export type ThemeName = "light" | "dark" | "duolingo" | "instagram";

export const ACCENT_OPTIONS: { name: ThemeAccent; label: string }[] = [
  { name: "default", label: "Default" },
  { name: "duolingo", label: "Duolingo" },
  { name: "instagram", label: "Instagram" },
];

const defaultLight: ColorScheme = {
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
  backgrounds: { input: "#ffffff", editInput: "#ffffff" },
  statusBarStyle: "dark-content",
  isDark: false,
};

const defaultDark: ColorScheme = {
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
  backgrounds: { input: "#1e293b", editInput: "#0f172a" },
  statusBarStyle: "light-content",
  isDark: true,
};

// Bright, playful green — inspired by Duolingo's owl-and-leaf palette.
const duolingoLight: ColorScheme = {
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
  backgrounds: { input: "#ffffff", editInput: "#ffffff" },
  statusBarStyle: "dark-content",
  isDark: false,
};

const duolingoDark: ColorScheme = {
  bg: "#131f24",
  surface: "#1c2b32",
  text: "#f1f9ec",
  textMuted: "#8ba39a",
  border: "#2c414a",
  primary: "#89e219",
  success: "#89e219",
  warning: "#ffc800",
  danger: "#ff6b6b",
  shadow: "#000000",
  gradients: {
    background: ["#131f24", "#1c2b32"],
    surface: ["#1c2b32", "#22343c"],
    primary: ["#58cc02", "#89e219"],
    success: ["#58cc02", "#89e219"],
    warning: ["#ffc800", "#ffe066"],
    danger: ["#ff4b4b", "#ff6b6b"],
    muted: ["#2c414a", "#3a5560"],
    empty: ["#22343c", "#2c414a"],
  },
  backgrounds: { input: "#1c2b32", editInput: "#131f24" },
  statusBarStyle: "light-content",
  isDark: true,
};

// Warm sunset gradient — inspired by Instagram's brand palette.
const instagramLight: ColorScheme = {
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
  backgrounds: { input: "#fafafa", editInput: "#ffffff" },
  statusBarStyle: "dark-content",
  isDark: false,
};

const instagramDark: ColorScheme = {
  bg: "#000000",
  surface: "#121212",
  text: "#fafafa",
  textMuted: "#a8a8a8",
  border: "#262626",
  primary: "#e1306c",
  success: "#4caf50",
  warning: "#fcaf45",
  danger: "#ed4956",
  shadow: "#000000",
  gradients: {
    background: ["#000000", "#121212"],
    surface: ["#121212", "#1a1a1a"],
    primary: ["#833ab4", "#fd1d1d"],
    success: ["#4caf50", "#2e7d32"],
    warning: ["#f77737", "#fcaf45"],
    danger: ["#fd1d1d", "#c13584"],
    muted: ["#262626", "#363636"],
    empty: ["#1a1a1a", "#262626"],
  },
  backgrounds: { input: "#121212", editInput: "#000000" },
  statusBarStyle: "light-content",
  isDark: true,
};

const palettes: Record<ThemeAccent, Record<ThemeMode, ColorScheme>> = {
  default: { light: defaultLight, dark: defaultDark },
  duolingo: { light: duolingoLight, dark: duolingoDark },
  instagram: { light: instagramLight, dark: instagramDark },
};

interface ThemeContextType {
  accent: ThemeAccent;
  mode: ThemeMode;
  setAccent: (accent: ThemeAccent) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  colors: ColorScheme;
  /** @deprecated use `mode === "dark"` — kept for existing screens */
  isDarkMode: boolean;
  /** @deprecated use `toggleMode` — kept for existing screens */
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<undefined | ThemeContextType>(undefined);

const ACCENT_KEY = "themeAccent";
const MODE_KEY = "themeMode";
/** @deprecated old single-key storage, read once for migration only */
const LEGACY_THEME_KEY = "themeName";
/** @deprecated even older boolean storage, read once for migration only */
const LEGACY_DARKMODE_KEY = "darkMode";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [accent, setAccentState] = useState<ThemeAccent>("default");
  const [mode, setModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    (async () => {
      const [savedAccent, savedMode] = await Promise.all([
        AsyncStorage.getItem(ACCENT_KEY),
        AsyncStorage.getItem(MODE_KEY),
      ]);

      if (savedAccent && savedMode) {
        setAccentState(savedAccent as ThemeAccent);
        setModeState(savedMode as ThemeMode);
        return;
      }

      // Migrate from the older single-key theme name, if present.
      const legacyTheme = await AsyncStorage.getItem(LEGACY_THEME_KEY);
      if (legacyTheme) {
        if (legacyTheme === "dark") {
          setAccentState("default");
          setModeState("dark");
        } else if (legacyTheme === "duolingo" || legacyTheme === "instagram") {
          setAccentState(legacyTheme);
          setModeState("light");
        } else {
          setAccentState("default");
          setModeState("light");
        }
        return;
      }

      // Migrate from the original boolean darkMode key, if present.
      const legacyDark = await AsyncStorage.getItem(LEGACY_DARKMODE_KEY);
      if (legacyDark && JSON.parse(legacyDark) === true) {
        setModeState("dark");
      }
    })();
  }, []);

  const setAccent = (next: ThemeAccent) => {
    setAccentState(next);
    AsyncStorage.setItem(ACCENT_KEY, next);
  };

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(MODE_KEY, next);
  };

  const toggleMode = () => setMode(mode === "dark" ? "light" : "dark");

  const colors = palettes[accent][mode];

  return (
    <ThemeContext.Provider
      value={{
        accent,
        mode,
        setAccent,
        setMode,
        toggleMode,
        colors,
        isDarkMode: mode === "dark",
        toggleDarkMode: toggleMode,
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
