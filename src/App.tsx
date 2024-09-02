import { Home } from "@/app/page";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./app/globals.css";
import { TooltipProvider } from "./components/ui/tooltip";
import { useThemeConfigStore } from "./lib/store";

export function ThemesStyle() {
  const activeTheme = useThemeConfigStore((state) => state.activeTheme);

  if (!activeTheme) {
    return null;
  }

  return (
    <style>
      {`
.themes-wrapper,
[data-chart] {
  ${Object.entries(activeTheme.cssVars.light)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n")}
}

.dark .themes-wrapper,
.dark [data-chart] {
  ${Object.entries(activeTheme.cssVars.dark)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n")}
}
  `}
    </style>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ThemesStyle />
      <TooltipProvider>
        <div>
          <Home />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}
