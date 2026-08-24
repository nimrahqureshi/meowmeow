"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useStorageValue, useSystemPrefersDark, writeStorage } from "@/lib/client-store";

type Theme = "light" | "dark";

const THEME_KEY = "mm-theme";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const stored = useStorageValue(THEME_KEY);
  const systemDark = useSystemPrefersDark();
  const theme: Theme = stored === "dark" || stored === "light" ? stored : systemDark ? "dark" : "light";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = () => writeStorage(THEME_KEY, theme === "dark" ? "light" : "dark");

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `try{var t=localStorage.getItem("mm-theme");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}`,
      }}
    />
  );
}
