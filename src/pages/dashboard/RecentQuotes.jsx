import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const RecentQuotes = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const quotes = [
    { id: 'Q-001', customer: 'John Doe', product: 'Fiber Optic', date: '12/12/24', status: 'pending' },
    { id: 'Q-002', customer: 'Jane Smith', product: '5G Equipment', date: '12/11/24', status: 'approved' },
    { id: 'Q-003', customer: 'Tech Corp', product: 'Cloud Server', date: '12/10/24', status: 'rejected' },
    { id: 'Q-004', customer: 'Fiber Solutions', product: 'Router Pro', date: '12/09/24', status: 'approved' },
    { id: 'Q-005', customer: '5G Networks', product: 'Switch X', date: '12/08/24', status: 'pending' },
  ];

  const getStatusBadge = (status) => {
    const map = {
      pending: `bg-yellow-100 text-yellow-800 ${isDark ? 'dark:bg-yellow-900/30 dark:text-yellow-400' : ''}`,
      approved: `bg-green-100 text-green-800 ${isDark ? 'dark:bg-green-900/30 dark:text-green-400' : ''}`,
      rejected: `bg-red-100 text-red-800 ${isDark ? 'dark:bg-red-900/30 dark:text-red-400' : ''}`,
    };
    return map[status] || map.pending;
  };

  const getStatusDot = (status) => {
    const map = {
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return map[status] || map.pending;
  };

  const getStatusLabel = (status) => {
    const map = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return map[status] || status;
  };

  return (
    <div className={`rounded-xl border shadow-sm hover:border-[#C3110C] transition-all duration-300 mb-6 overflow-hidden ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
        <h3 className={`text-sm sm:text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <i className="fas fa-file-invoice text-[#C3110C] mr-2"></i> Recent Quotes
        </h3>
        <div className="flex items-center gap-2">
          <button className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border text-xs sm:text-sm transition hover:bg-[#C3110C] hover:text-white hover:border-[#C3110C] ${isDark ? 'border-[#3A3A3A] text-gray-300' : 'border-gray-200 text-gray-600'}`}>
            <i className="fas fa-download mr-1.5"></i> Export
          </button>
          <button className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#C3110C] text-white text-xs sm:text-sm hover:bg-[#740A03] transition shadow-sm shadow-[#C3110C]/30">
            <i className="fas fa-plus mr-1.5"></i> New
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead className={isDark ? 'bg-[#0A0A0A]' : 'bg-gray-50'}>
            <tr>
              <th className={`px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold uppercase tracking-wider text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ID</th>
              <th className={`px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold uppercase tracking-wider text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Customer</th>
              <th className={`hidden sm:table-cell px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold uppercase tracking-wider text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Product</th>
              <th className={`px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold uppercase tracking-wider text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Date</th>
              <th className={`px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold uppercase tracking-wider text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
              <th className={`px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold uppercase tracking-wider text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#2A2A2A]' : 'divide-gray-200'}`}>
            {quotes.map((quote, idx) => (
              <tr key={idx} className={`transition ${isDark ? 'hover:bg-[#0A0A0A]' : 'hover:bg-gray-50'}`}>
                <td className={`px-3 sm:px-5 py-2.5 sm:py-3.5 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{quote.id}</td>
                <td className={`px-3 sm:px-5 py-2.5 sm:py-3.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{quote.customer}</td>
                <td className={`hidden sm:table-cell px-3 sm:px-5 py-2.5 sm:py-3.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{quote.product}</td>
                <td className={`px-3 sm:px-5 py-2.5 sm:py-3.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{quote.date}</td>
                <td className="px-3 sm:px-5 py-2.5 sm:py-3.5">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusBadge(quote.status)}`}>
                    <span className={`w-1 h-1 rounded-full ${getStatusDot(quote.status)}`}></span>
                    {getStatusLabel(quote.status)}
                  </span>
                </td>
                <td className="px-3 sm:px-5 py-2.5 sm:py-3.5">
                  <button className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition ${isDark ? 'text-gray-500 hover:bg-[#2A2A2A] hover:text-[#E6501B]' : 'text-gray-400 hover:bg-gray-100 hover:text-[#C3110C]'}`}>
                    <i className="fas fa-eye text-xs sm:text-sm"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
        <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Showing 1-5 of 56 quotes</span>
        <div className="flex items-center gap-0.5 sm:gap-1">
          {[1, 2, 3, 4, 5, '…', 12].map((page, idx) => (
            <button 
              key={idx}
              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg border text-xs sm:text-sm font-medium transition ${page === 1 
                ? `bg-[#C3110C] text-white border-[#C3110C]` 
                : `${isDark ? 'text-gray-300 border-[#3A3A3A] hover:bg-[#C3110C] hover:text-white hover:border-[#C3110C]' : 'text-gray-700 border-gray-200 hover:bg-[#C3110C] hover:text-white hover:border-[#C3110C]'}`}`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentQuotes;