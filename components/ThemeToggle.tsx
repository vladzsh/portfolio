"use client";

import { useEffect, useState } from "react";

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const dark = stored ? stored === "dark" : true;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    setIsDark(dark);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.setAttribute(
      "data-theme",
      next ? "dark" : "light"
    );
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  };

  // Prevent hydration mismatch — render nothing until mounted
  if (!mounted) return null;

  return (
    <div className="group theme-toggle-wrap fixed bottom-6 right-6 flex items-center gap-4 z-[99] rounded-full px-3 py-1.5 pl-4 border border-[var(--color-border)]">
      <span className="theme-label-text text-sm whitespace-nowrap max-md:hidden" style={{ color: 'var(--color-text-muted)' }}>
        Toggle Theme
      </span>
      <button
        onClick={toggle}
        className="theme-toggle w-[44px] h-[44px] border-none bg-transparent cursor-pointer flex items-center justify-center shrink-0 max-md:opacity-50"
        style={{ color: 'var(--color-text-primary)' }}
        aria-label="Toggle theme"
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );
}
