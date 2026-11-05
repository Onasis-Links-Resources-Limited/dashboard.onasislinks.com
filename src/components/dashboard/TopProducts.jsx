import { useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import CountUpModule from "react-countup";

const CountUp = CountUpModule.default || CountUpModule;

// Register everything required for a Bar chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Tooltip,
  Legend
);

const TopProducts = ({ data = [] }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy previous chart before creating another one
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const labels = data.map((item) => {
      const name = item?.name || "Unknown";
      return name.split(" ")[0];
    });

    const counts = data.map(
      (item) => Number(item?.quote_count) || 0
    );

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "bar",

      data: {
        labels,

        datasets: [
          {
            label: "Quote Count",
            data: counts,

            backgroundColor:
              "rgba(195, 17, 12, 0.8)",

            borderColor: "#C3110C",
            borderWidth: 1,
            borderRadius: 4,

            hoverBackgroundColor: "#E6501B",
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false,
          },

          tooltip: {
            backgroundColor: isDark
              ? "#1A1A1A"
              : "#FFFFFF",

            titleColor: isDark
              ? "#FFFFFF"
              : "#000000",

            bodyColor: isDark
              ? "#CCCCCC"
              : "#333333",

            borderColor: isDark
              ? "#2A2A2A"
              : "#E5E7EB",

            borderWidth: 1,

            callbacks: {
              label: (context) =>
                ` ${context.parsed.y} quotes`,
            },
          },
        },

        scales: {
          y: {
            beginAtZero: true,

            grid: {
              color: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.05)",
            },

            ticks: {
              color: isDark
                ? "#888888"
                : "#666666",

              precision: 0,
            },
          },

          x: {
            grid: {
              display: false,
            },

            ticks: {
              color: isDark
                ? "#888888"
                : "#666666",
            },
          },
        },
      },
    });

    // Cleanup
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, isDark]);

  const counts = data.map(
    (item) => Number(item?.quote_count) || 0
  );

  const maxCount = Math.max(...counts, 0);

  return (
    <div
      className={`
        lg:col-span-2
        rounded-xl p-4 sm:p-6
        border shadow-sm
        hover:border-[#C3110C]
        transition-all duration-300

        ${
          isDark
            ? "bg-[#1A1A1A] border-[#2A2A2A]"
            : "bg-white border-gray-200"
        }
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`
            text-sm sm:text-base
            font-semibold
            ${isDark ? "text-white" : "text-gray-900"}
          `}
        >
          <span className="text-[#C3110C] mr-2">
            ▥
          </span>

          Top Products
        </h3>

        <span
          className={`
            text-xs px-3 py-1 rounded-full
            ${
              isDark
                ? "text-gray-400 bg-[#2A2A2A]"
                : "text-gray-500 bg-gray-100"
            }
          `}
        >
          All Time
        </span>
      </div>

      <div className="h-44 sm:h-52 relative">
        {data.length > 0 ? (
          <canvas ref={canvasRef} />
        ) : (
          <div
            className={`
              h-full flex items-center justify-center
              text-sm
              ${
                isDark
                  ? "text-gray-500"
                  : "text-gray-400"
              }
            `}
          >
            No product data available
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-center items-center gap-2 text-xs">
        <span
          className={
            isDark
              ? "text-gray-400"
              : "text-gray-500"
          }
        >
          Most quoted product
        </span>

        <span className="font-bold text-base text-[#C3110C]">
          <CountUp
            end={maxCount}
            duration={2}
            separator=","
          />{" "}
          {maxCount > 1 ? "quotes" : "quote"}
        </span>
      </div>
    </div>
  );
};

export default TopProducts;