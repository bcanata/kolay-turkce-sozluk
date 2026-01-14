"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const cookie = document.cookie.match(/(?:^|; )theme=([^;]*)/);
  if (cookie?.[1] === "dark") return "dark";
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
  }, [theme]);

  return (
    <button
      className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm hover:bg-amber-50 dark:border-amber-700 dark:bg-gray-900/80 dark:text-amber-200"
      aria-label="Tema değiştir"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      type="button"
    >
      <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
      {theme === "dark" ? "Aydınlık" : "Karanlık"}
    </button>
  );
}
