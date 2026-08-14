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

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
        Theme
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
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
                ? "border-[#C3110C] dark:border-[#E6501B] bg-[#C3110C]/5 dark:bg-[#E6501B]/10"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                theme === key
                  ? "text-[#C3110C] dark:text-[#E6501B]"
                  : "text-gray-400",
              )}
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {label}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AppearanceSettings;
