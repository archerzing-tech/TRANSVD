import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const STORAGE_KEY = "transvd-theme";

function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  }
  return "dark";
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const applyBodyStyles = useCallback(() => {
    // Read resolved CSS variable values from :root and apply directly to body.
    // This ensures the body background/color updates reliably regardless of
    // CSS cascade layer ordering (Tailwind v4's @theme vs our overrides).
    const root = document.documentElement;
    const bg = getComputedStyle(root).getPropertyValue("--color-surface-950").trim();
    const fg = getComputedStyle(root).getPropertyValue("--color-surface-50").trim();
    if (bg) document.body.style.backgroundColor = bg;
    if (fg) document.body.style.color = fg;
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    document.documentElement.setAttribute("data-theme", t);
    applyBodyStyles();
  }, [applyBodyStyles]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Apply data-theme attribute on mount and when theme changes
  // (setTheme handles body styles directly for toggles; this effect
  // only handles the CSS attribute for the cascade.)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // On initial mount, apply body styles from resolved CSS variables.
  // Subsequent theme changes are handled by setTheme's direct call.
  useEffect(() => {
    applyBodyStyles();
  }, [applyBodyStyles]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
