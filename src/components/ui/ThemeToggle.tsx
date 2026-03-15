"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering after mounting
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className="flex items-center justify-center relative rounded-[108px] h-[58px] w-[58px] z-10" 
      >
        <button className="bg-[#555] cursor-pointer flex h-[38px] items-center justify-center relative rounded-full shrink-0 w-[42px]">
          <Moon className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center relative rounded-[108px] h-[58px] w-[58px] z-10" 
      data-name="Toggle Button" 
    >
      <button 
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="bg-[#555] hover:bg-[#777] active:scale-95 hover:scale-105 transition-all duration-300 cursor-pointer flex h-[38px] items-center justify-center relative rounded-full shrink-0 w-[42px]"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4 text-white" />
        ) : (
          <Moon className="w-4 h-4 text-white" />
        )}
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  );
}
