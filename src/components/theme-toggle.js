import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "@heroui/use-theme";
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };
    return (_jsx(Button, { isIconOnly: true, variant: "light", "aria-label": "Toggle theme", onPress: toggleTheme, className: "rounded-full", children: _jsx(Icon, { icon: theme === "light" ? "lucide:moon" : "lucide:sun", width: 24, height: 24, className: "text-foreground" }) }));
}
