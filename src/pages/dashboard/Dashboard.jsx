import { useTheme } from '../../context/ThemeContext';
import StatsGrid from '../../components/dashboard/StatsGrid';
import TopProducts from '../../components/dashboard/TopProducts';
import QuoteStatus from './QuoteStatus';
import RecentQuotes from './RecentQuotes';

const Dashboard = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300`}>

      <main className="">
        
        <div className="p-4 sm:p-6 md:p-8">
          {/* Welcome Section */}
          <div className="mb-6">
            <h2 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Dashboard Overview
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>

          <StatsGrid />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <TopProducts />
            <QuoteStatus />
          </div>
          
          <RecentQuotes />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;