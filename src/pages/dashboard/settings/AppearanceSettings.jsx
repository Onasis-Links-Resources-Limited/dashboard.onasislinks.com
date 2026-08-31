import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { cn } from "../../../libs/utils";

const OPTIONS = [
  {
    key: "light",
    label: "Light",
    icon: Sun,
    description: "Bright background, dark text.",
  },
  {
    key: "dark",
    label: "Dark",
    icon: Moon,
    description: "Dark background, light text.",
  },
];

/** Just exposes the existing dark-mode mechanism (ThemeContext) as a settings control. */
const AppearanceSettings = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`rounded-xl p-5 border shadow-sm ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}`}>
      <h2 className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
        Theme
      </h2>
      <p className={`text-xs mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Choose how the dashboard looks on this device.
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-md">
        {OPTIONS.map(({ key, label, icon: Icon, description }) => (
          <button
            key={key}
            onClick={() => {
              if (key !== theme) toggleTheme();
            }}
            className={cn(
              "flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-colors",
              theme === key
                ? "border-[#C3110C] bg-[#C3110C]/5"
                : isDark
                ? "border-[#2A2A2A] hover:border-gray-600"
                : "border-gray-200 hover:border-gray-300",
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                theme === key
                  ? "text-[#C3110C]"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-400",
              )}
            />
            <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
              {label}
            </span>
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AppearanceSettings;