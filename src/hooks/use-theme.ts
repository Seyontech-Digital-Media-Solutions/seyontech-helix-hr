import { useEffect, useState } from "react";

const KEY = "ho_theme";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as "light" | "dark" | null;
    const nextTheme =
      saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    setTheme(nextTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(KEY, theme);
  }, [mounted, theme]);

  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}
