import { useEffect, useState } from 'react';

const AnimatedChart = () => {
  const [products] = useState([
    { name: 'Fiber', value: 45 },
    { name: '5G', value: 32 },
    { name: 'Cloud', value: 28 },
    { name: 'Router', value: 22 },
    { name: 'Switch', value: 18 }
  ]);

  const [statusData] = useState([
    { label: 'Pending', value: 12, color: '#f5b342' },
    { label: 'Approved', value: 18, color: '#34b87c' },
    { label: 'Rejected', value: 8, color: '#e45c5c' },
    { label: 'Completed', value: 18, color: '#6c7b9e' }
  ]);

  const maxProduct = Math.max(...products.map(p => p.value));
  const maxStatus = Math.max(...statusData.map(s => s.value));

  // Animate bars on load with bounce effect
  useEffect(() => {
    const animateBars = () => {
      // Horizontal bars
      document.querySelectorAll('.bar-fill').forEach((bar, i) => {
        const target = parseFloat(bar.dataset.target);
        setTimeout(() => {
          // Overshoot
          const overshoot = Math.min(target + 8, 100);
          bar.style.width = overshoot + '%';
          setTimeout(() => {
            bar.style.width = target + '%';
          }, 500);
        }, 80 + i * 40);
      });

      // Vertical bars
      document.querySelectorAll('.status-fill').forEach((bar, i) => {
        const target = parseFloat(bar.dataset.target);
        setTimeout(() => {
          const overshoot = Math.min(target + 10, 100);
          bar.style.height = overshoot + '%';
          setTimeout(() => {
            bar.style.height = target + '%';
          }, 550);
        }, 100 + i * 50);
      });
    };

    // Run animation after component mounts
    const timer = setTimeout(animateBars, 100);
    return () => clearTimeout(timer);
  }, []);

  // Live up/down animation every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Wiggle horizontal bars
      document.querySelectorAll('.bar-fill').forEach((bar) => {
        const base = parseFloat(bar.dataset.target);
        const shift = (Math.random() * 8) - 3;
        let newVal = Math.min(100, Math.max(8, base + shift));
        bar.style.width = newVal + '%';
        setTimeout(() => {
          bar.style.width = base + '%';
        }, 700);
      });

      // Wiggle vertical bars
      document.querySelectorAll('.status-fill').forEach((fill) => {
        const base = parseFloat(fill.dataset.target);
        const shift = (Math.random() * 8) - 3;
        let newVal = Math.min(100, Math.max(8, base + shift));
        fill.style.height = newVal + '%';
        setTimeout(() => {
          fill.style.height = base + '%';
        }, 700);
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Top Products - Horizontal Bars */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#2A2A2A]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            <i className="fas fa-tag mr-2 text-blue-500"></i>
            Top Products
          </h3>
          <i className="fas fa-ellipsis-h text-gray-400"></i>
        </div>
        
        <div className="space-y-4">
          {products.map((product, index) => {
            const percent = (product.value / maxProduct) * 100;
            return (
              <div key={index} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {product.name}
                </span>
                <div className="flex-1 h-3 bg-gray-200 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                  <div 
                    className="bar-fill h-full rounded-full"
                    style={{ 
                      width: '0%',
                      background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                      transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)',
                      boxShadow: '0 0 6px rgba(59, 130, 246, 0.3)'
                    }}
                    data-target={percent}
                  ></div>
                </div>
                <span className="w-8 text-sm font-semibold text-gray-800 dark:text-white text-right">
                  {product.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quote Status - Vertical Bars */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#2A2A2A]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            <i className="fas fa-chart-bar mr-2 text-blue-500"></i>
            Quote Status
          </h3>
          <i className="fas fa-ellipsis-h text-gray-400"></i>
        </div>

        <div className="flex justify-around items-end h-64">
          {statusData.map((status, index) => {
            const percent = (status.value / maxStatus) * 100;
            return (
              <div key={index} className="flex flex-col items-center">
                <div className="w-12 h-48 bg-gray-200 dark:bg-[#2A2A2A] rounded-t-lg overflow-hidden relative">
                  <div 
                    className="status-fill absolute bottom-0 w-full rounded-t-lg"
                    style={{ 
                      height: '0%',
                      backgroundColor: status.color,
                      transition: 'height 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
                    }}
                    data-target={percent}
                  ></div>
                </div>
                <span className="mt-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  {status.label}
                </span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                  {status.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnimatedChart;