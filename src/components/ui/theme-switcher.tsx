﻿import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "@/context/themeContext";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useThemeContext();

  if (!theme) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-8 w-8"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

