import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "@heroui/use-theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  
  return (
    <Button
      isIconOnly
      variant="light"
      aria-label="Toggle theme"
      onPress={toggleTheme}
      className="rounded-full"
    >
      <Icon 
        icon={theme === "light" ? "lucide:moon" : "lucide:sun"} 
        width={24} 
        height={24} 
        className="text-foreground"
      />
    </Button>
  );
}