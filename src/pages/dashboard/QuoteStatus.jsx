import { useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  Chart as ChartJS,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from "chart.js";
import CountUpModule from "react-countup";

const CountUp = CountUpModule.default || CountUpModule;

// Register everything required for Doughnut
ChartJS.register(ArcElement, DoughnutController, Tooltip, Legend);

const QuoteStatus = ({ data = {} }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const statusData = Object.keys(data).map((key) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),

    count: Number(data[key]) || 0,

    color:
      key === "pending"
        ? "#F59E0B"
        : key === "approved"
          ? "#10B981"
          : key === "rejected"
            ? "#EF4444"
            : key === "completed"
              ? "#C3110C"
              : "#6B7280",
  }));

  const total = statusData.reduce((sum, item) => sum + item.count, 0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    if (statusData.length === 0) {
      return;
    }

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "doughnut",

      data: {
        labels: statusData.map((item) => item.label),

        datasets: [
          {
            data: statusData.map((item) => item.count),

            backgroundColor: statusData.map((item) => item.color),

            borderColor: isDark ? "#1A1A1A" : "#FFFFFF",

            borderWidth: 2,

            hoverOffset: 8,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        cutout: "65%",

        plugins: {
          legend: {
            display: false,
          },

          tooltip: {
            backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",

            titleColor: isDark ? "#FFFFFF" : "#000000",

            bodyColor: isDark ? "#CCCCCC" : "#333333",

            borderColor: isDark ? "#2A2A2A" : "#E5E7EB",

            borderWidth: 1,

            callbacks: {
              label: (context) => ` ${context.parsed} quotes`,
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

  return (
    <div
      className={`
        rounded-xl p-4 sm:p-6
        border shadow-sm
        hover:border-[#C3110C]
        transition-all duration-300

        ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}
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
          <span className="text-[#C3110C] mr-2">◔</span>
          Quote Status
        </h3>

        <span
          className={`
            text-xs px-3 py-1
            rounded-full
            ${
              isDark
                ? "text-gray-400 bg-[#2A2A2A]"
                : "text-gray-500 bg-gray-100"
            }
          `}
        >
          Overview
        </span>
      </div>

      <div
        className="
          flex flex-col
          sm:flex-row
          items-center
          justify-center
          gap-4 sm:gap-8
          py-2
        "
      >
        <div
          className="
            w-[120px] h-[120px]
            sm:w-[140px] sm:h-[140px]
            relative flex-shrink-0
          "
        >
          {statusData.length > 0 ? (
            <canvas ref={canvasRef} />
          ) : (
            <div
              className={`
                w-full h-full
                flex items-center
                justify-start
                text-xs
                ${isDark ? "text-gray-500" : "text-gray-400"}
              `}
            >
              No data
            </div>
          )}

          {/* Center Count */}
          <div
            className="
              absolute inset-0
              flex flex-col
              items-center
              justify-center
              pointer-events-none
            "
          >
            <span
              className={`
                text-2xl font-bold
                ${isDark ? "text-white" : "text-gray-900"}
              `}
            >
              <CountUp end={total} duration={2} />
            </span>

            <span
              className={`
                text-[10px]
                ${isDark ? "text-gray-400" : "text-gray-500"}
              `}
            >
              Total
            </span>
          </div>
        </div>

        <div
          className="
            flex flex-wrap
            justify-center
            gap-x-4 gap-y-3
            sm:flex-col
          "
        >
          {statusData.map((item) => (
            <div
              key={item.label}
              className={`
                  flex items-center text-xs
                  sm:text-sm
                  gap-2
                  ${isDark ? "text-gray-300" : "text-gray-600"}
                `}
            >
              <div
                className="
                    flex items-center
                    gap-1.5
                  "
              >
                <span
                  className="
                      w-3 h-3
                      rounded-full
                      flex-shrink-0
                    "
                  style={{
                    backgroundColor: item.color,
                  }}
                />

                <span>{item.label}</span>
              </div>

              <span
                className={`
                    font-bold text-sm
                    ${isDark ? "text-white" : "text-gray-900"}
                  `}
              >
                <CountUp end={item.count} duration={2} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuoteStatus;
