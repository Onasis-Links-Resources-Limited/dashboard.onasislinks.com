import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";

import StatsGrid from "../../components/dashboard/StatsGrid";
import TopProducts from "../../components/dashboard/TopProducts";

import QuoteStatus from "./QuoteStatus";
import RecentQuotes from "./RecentQuotes";

import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";

const Dashboard = () => {
  const { theme } = useTheme();

  const [dashboardData, setDashboardData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token =
          localStorage.getItem("token");

        const response =
          await api.dashboard.getStats(token);

        if (response.success) {
          setDashboardData(
            response.data
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch dashboard",
          error
        );

        // Prevent the page from getting stuck
        setDashboardData({});
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const data = dashboardData || {};

  return (
    <div
      className="
        min-h-screen
        transition-colors duration-300
      "
    >
      <main>
        <div
          className="
            p-4 sm:p-6 md:p-8
          "
        >
          {/* Welcome Section */}
          <div className="mb-6">
            <h2
              className={`
                text-2xl sm:text-3xl
                font-bold
                ${
                  theme === "dark"
                    ? "text-white"
                    : "text-gray-900"
                }
              `}
            >
              Dashboard Overview
            </h2>

            <p
              className={`
                text-sm
                ${
                  theme === "dark"
                    ? "text-gray-400"
                    : "text-gray-500"
                }
              `}
            >
              Welcome back! Here's what's
              happening with business today.
            </p>
          </div>

          {/* Stats */}
          <StatsGrid stats={data} />

          {/* Charts */}
          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-3
              gap-4 sm:gap-5
              mb-6
            "
          >
            <TopProducts
              data={data.top_products || []}
            />

            <QuoteStatus
              data={data.quote_statuses || {}}
            />
          </div>

          {/* Recent Quotes */}
          <RecentQuotes
            data={data.recent_quotes || []}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;