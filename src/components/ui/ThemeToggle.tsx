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
        className="bg-[rgba(43,43,43,0.64)] flex items-center p-[10px] relative rounded-[108px] shadow-[15px_23px_35px_0px_rgba(0,0,0,0.49)] h-[58px] w-[62px]" 
      >
        <button className="bg-[#555] cursor-pointer flex h-[38px] items-center justify-center relative rounded-full shrink-0 w-[42px]">
          <Moon className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className="bg-[rgba(43,43,43,0.64)] transition-all duration-300 flex items-center p-[10px] relative rounded-[108px] shadow-[15px_23px_35px_0px_rgba(0,0,0,0.49)] hover:shadow-[15px_23px_45px_0px_rgba(0,0,0,0.6)] h-[58px] w-[62px]" 
      data-name="Toggle Button" 
    >
      <button 
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="bg-[#555] hover:bg-[#666] transition-colors duration-200 cursor-pointer flex h-[38px] items-center justify-center relative rounded-full shrink-0 w-[42px]"
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
