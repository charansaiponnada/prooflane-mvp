"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme(dark ? "light" : "dark")}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dark ? "Light mode" : "Dark mode"}</TooltipContent>
    </Tooltip>
  );
}