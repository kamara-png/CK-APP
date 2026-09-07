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

export type ThemeAccent = "default" | "duolingo" | "instagram" | "obsidian" | "substack" | "twitter" | "spotify" | "notion";
export type ThemeMode = "light" | "dark";
/** @deprecated old combined theme identifier, kept only for migrating existing saved values */
export type ThemeName = "light" | "dark" | "duolingo" | "instagram";

export const ACCENT_OPTIONS: { name: ThemeAccent; label: string }[] = [
  { name: "default", label: "Default" },
  { name: "duolingo", label: "Duolingo" },
  { name: "instagram", label: "Instagram" },
  { name: "obsidian", label: "Obsidian" },
  { name: "substack", label: "Substack" },
  { name: "twitter", label: "Twitter / X" },
  { name: "spotify", label: "Spotify" },
  { name: "notion", label: "Notion" },
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

// Obsidian's default palette — near-black surfaces in dark mode, off-white in
// light mode, both anchored by its signature violet accent.
const obsidianLight: ColorScheme = {
  bg: "#ffffff",
  surface: "#f6f6f6",
  text: "#2e3338",
  textMuted: "#6e7681",
  border: "#e3e3e3",
  primary: "#7c3aed",
  success: "#08a892",
  warning: "#e0a72e",
  danger: "#e5484d",
  shadow: "#000000",
  gradients: {
    background: ["#ffffff", "#f6f6f6"],
    surface: ["#f6f6f6", "#efefef"],
    primary: ["#8b5cf6", "#7c3aed"],
    success: ["#08a892", "#067a6a"],
    warning: ["#e0a72e", "#c78d1a"],
    danger: ["#e5484d", "#c93a3e"],
    muted: ["#e3e3e3", "#cccccc"],
    empty: ["#f0f0f0", "#e3e3e3"],
  },
  backgrounds: { input: "#ffffff", editInput: "#f6f6f6" },
  statusBarStyle: "dark-content",
  isDark: false,
};

const obsidianDark: ColorScheme = {
  bg: "#1e1e1e",
  surface: "#262626",
  text: "#dcddde",
  textMuted: "#999999",
  border: "#363636",
  primary: "#a78bfa",
  success: "#4dd4c4",
  warning: "#e0a72e",
  danger: "#fb7185",
  shadow: "#000000",
  gradients: {
    background: ["#1e1e1e", "#262626"],
    surface: ["#262626", "#2e2e2e"],
    primary: ["#8b5cf6", "#a78bfa"],
    success: ["#08a892", "#4dd4c4"],
    warning: ["#c78d1a", "#e0a72e"],
    danger: ["#e5484d", "#fb7185"],
    muted: ["#363636", "#454545"],
    empty: ["#2e2e2e", "#363636"],
  },
  backgrounds: { input: "#262626", editInput: "#1e1e1e" },
  statusBarStyle: "light-content",
  isDark: true,
};

// Substack's signature warm orange on a cream, editorial background.
const substackLight: ColorScheme = {
  bg: "#fff9f2",
  surface: "#ffffff",
  text: "#242220",
  textMuted: "#7a746c",
  border: "#ece5d8",
  primary: "#ff6719",
  success: "#3c9e6f",
  warning: "#e8a72e",
  danger: "#d64545",
  shadow: "#000000",
  gradients: {
    background: ["#fff9f2", "#fdf1e2"],
    surface: ["#ffffff", "#fffaf0"],
    primary: ["#ff8a3d", "#ff6719"],
    success: ["#5cbf8f", "#3c9e6f"],
    warning: ["#f0bb52", "#e8a72e"],
    danger: ["#e06a6a", "#d64545"],
    muted: ["#ece5d8", "#ddd4c2"],
    empty: ["#f5f0e6", "#ece5d8"],
  },
  backgrounds: { input: "#ffffff", editInput: "#fff9f2" },
  statusBarStyle: "dark-content",
  isDark: false,
};

const substackDark: ColorScheme = {
  bg: "#1c1a17",
  surface: "#262320",
  text: "#f5f0e6",
  textMuted: "#a89f8f",
  border: "#3a352e",
  primary: "#ff8a3d",
  success: "#5cbf8f",
  warning: "#e8a72e",
  danger: "#e06a6a",
  shadow: "#000000",
  gradients: {
    background: ["#1c1a17", "#262320"],
    surface: ["#262320", "#2e2a25"],
    primary: ["#ff6719", "#ff8a3d"],
    success: ["#3c9e6f", "#5cbf8f"],
    warning: ["#e8a72e", "#f0bb52"],
    danger: ["#d64545", "#e06a6a"],
    muted: ["#3a352e", "#48423a"],
    empty: ["#2e2a25", "#3a352e"],
  },
  backgrounds: { input: "#262320", editInput: "#1c1a17" },
  statusBarStyle: "light-content",
  isDark: true,
};

// Twitter/X — crisp blue accent on a clean, near-monochrome ground.
const twitterLight: ColorScheme = {
  bg: "#ffffff",
  surface: "#f7f9f9",
  text: "#0f1419",
  textMuted: "#536471",
  border: "#eff3f4",
  primary: "#1d9bf0",
  success: "#00ba7c",
  warning: "#ffd400",
  danger: "#f4212e",
  shadow: "#000000",
  gradients: {
    background: ["#ffffff", "#f7f9f9"],
    surface: ["#f7f9f9", "#eff3f4"],
    primary: ["#1d9bf0", "#0c7abf"],
    success: ["#00ba7c", "#009466"],
    warning: ["#ffd400", "#e6bf00"],
    danger: ["#f4212e", "#d11525"],
    muted: ["#eff3f4", "#d6dbdc"],
    empty: ["#f7f9f9", "#eff3f4"],
  },
  backgrounds: { input: "#eff3f4", editInput: "#ffffff" },
  statusBarStyle: "dark-content",
  isDark: false,
};

const twitterDark: ColorScheme = {
  bg: "#000000",
  surface: "#16181c",
  text: "#e7e9ea",
  textMuted: "#71767b",
  border: "#2f3336",
  primary: "#1d9bf0",
  success: "#00ba7c",
  warning: "#ffd400",
  danger: "#f4212e",
  shadow: "#000000",
  gradients: {
    background: ["#000000", "#16181c"],
    surface: ["#16181c", "#1e2126"],
    primary: ["#1d9bf0", "#4db5f5"],
    success: ["#00ba7c", "#33c797"],
    warning: ["#ffd400", "#ffe066"],
    danger: ["#f4212e", "#f65661"],
    muted: ["#2f3336", "#3e4144"],
    empty: ["#1e2126", "#2f3336"],
  },
  backgrounds: { input: "#202327", editInput: "#000000" },
  statusBarStyle: "light-content",
  isDark: true,
};

// Spotify — near-black surfaces punched through with signature spring green.
const spotifyLight: ColorScheme = {
  bg: "#f6f6f6",
  surface: "#ffffff",
  text: "#191414",
  textMuted: "#5e5e5e",
  border: "#e5e5e5",
  primary: "#1db954",
  success: "#1db954",
  warning: "#ffa42b",
  danger: "#e91429",
  shadow: "#000000",
  gradients: {
    background: ["#f6f6f6", "#ececec"],
    surface: ["#ffffff", "#f6f6f6"],
    primary: ["#1ed760", "#1db954"],
    success: ["#1ed760", "#1db954"],
    warning: ["#ffb85c", "#ffa42b"],
    danger: ["#f2394a", "#e91429"],
    muted: ["#e5e5e5", "#d4d4d4"],
    empty: ["#efefef", "#e5e5e5"],
  },
  backgrounds: { input: "#ffffff", editInput: "#f6f6f6" },
  statusBarStyle: "dark-content",
  isDark: false,
};

const spotifyDark: ColorScheme = {
  bg: "#121212",
  surface: "#1e1e1e",
  text: "#ffffff",
  textMuted: "#b3b3b3",
  border: "#2a2a2a",
  primary: "#1ed760",
  success: "#1ed760",
  warning: "#ffa42b",
  danger: "#f2394a",
  shadow: "#000000",
  gradients: {
    background: ["#121212", "#181818"],
    surface: ["#181818", "#282828"],
    primary: ["#1db954", "#1ed760"],
    success: ["#1db954", "#1ed760"],
    warning: ["#ffa42b", "#ffb85c"],
    danger: ["#e91429", "#f2394a"],
    muted: ["#282828", "#333333"],
    empty: ["#181818", "#282828"],
  },
  backgrounds: { input: "#242424", editInput: "#121212" },
  statusBarStyle: "light-content",
  isDark: true,
};

// Notion — pared-back grayscale with a soft neutral accent, built for
// distraction-free reading and writing.
const notionLight: ColorScheme = {
  bg: "#ffffff",
  surface: "#f7f6f3",
  text: "#37352f",
  textMuted: "#787774",
  border: "#e9e9e7",
  primary: "#2f2f2f",
  success: "#2f9e44",
  warning: "#d9730d",
  danger: "#e03e3e",
  shadow: "#000000",
  gradients: {
    background: ["#ffffff", "#f7f6f3"],
    surface: ["#f7f6f3", "#efeeea"],
    primary: ["#5a5a5a", "#2f2f2f"],
    success: ["#4cb15c", "#2f9e44"],
    warning: ["#e8912e", "#d9730d"],
    danger: ["#e8635f", "#e03e3e"],
    muted: ["#e9e9e7", "#dcdbd8"],
    empty: ["#f2f1ee", "#e9e9e7"],
  },
  backgrounds: { input: "#ffffff", editInput: "#f7f6f3" },
  statusBarStyle: "dark-content",
  isDark: false,
};

const notionDark: ColorScheme = {
  bg: "#191919",
  surface: "#202020",
  text: "#e9e9e7",
  textMuted: "#9b9b9b",
  border: "#2f2f2f",
  primary: "#e9e9e7",
  success: "#4cb15c",
  warning: "#e8912e",
  danger: "#e8635f",
  shadow: "#000000",
  gradients: {
    background: ["#191919", "#202020"],
    surface: ["#202020", "#2a2a2a"],
    primary: ["#c9c9c7", "#e9e9e7"],
    success: ["#2f9e44", "#4cb15c"],
    warning: ["#d9730d", "#e8912e"],
    danger: ["#e03e3e", "#e8635f"],
    muted: ["#2f2f2f", "#3a3a3a"],
    empty: ["#2a2a2a", "#2f2f2f"],
  },
  backgrounds: { input: "#252525", editInput: "#191919" },
  statusBarStyle: "light-content",
  isDark: true,
};

const palettes: Record<ThemeAccent, Record<ThemeMode, ColorScheme>> = {
  default: { light: defaultLight, dark: defaultDark },
  duolingo: { light: duolingoLight, dark: duolingoDark },
  instagram: { light: instagramLight, dark: instagramDark },
  obsidian: { light: obsidianLight, dark: obsidianDark },
  substack: { light: substackLight, dark: substackDark },
  twitter: { light: twitterLight, dark: twitterDark },
  spotify: { light: spotifyLight, dark: spotifyDark },
  notion: { light: notionLight, dark: notionDark },
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
