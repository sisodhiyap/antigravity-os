"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolved: "dark" | "light";
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  resolved: "dark",
  setTheme: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolved, setResolved] = useState<"dark" | "light">("dark");

  // On mount: read persisted preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ag_theme_preference") as Theme | null;
      if (stored && ["dark", "light", "system"].includes(stored)) {
        setThemeState(stored);
      }
    } catch {}
  }, []);

  // Resolve "system" based on prefers-color-scheme
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = (t: Theme, prefersDark: boolean): "dark" | "light" => {
      if (t === "system") return prefersDark ? "dark" : "light";
      return t;
    };

    const r = resolve(theme, mq.matches);
    setResolved(r);

    // Apply data-theme attribute for CSS token switching
    document.documentElement.setAttribute("data-theme", r);

    const handler = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const nr = e.matches ? "dark" : "light";
        setResolved(nr);
        document.documentElement.setAttribute("data-theme", nr);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem("ag_theme_preference", t);
    } catch {}
  };

  const toggle = () => {
    setTheme(resolved === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
