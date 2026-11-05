"use client";
import { Button } from "kora-ui";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Switch light or dark theme"
      onClick={() => {
        const dark = document.documentElement.classList.toggle("dark");
        localStorage.setItem("kora-theme", dark ? "dark" : "light");
      }}
    >
      <Sun aria-hidden className="hidden dark:block" />
      <Moon aria-hidden className="dark:hidden" />
    </Button>
  );
}

