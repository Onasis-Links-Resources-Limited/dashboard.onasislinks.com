import React from 'react';
import { FaBox, FaQuoteRight, FaUsers, FaStar } from 'react-icons/fa';
import StatsCard from './StatsCard';

const StatsGrid = () => {
  const stats = [
    { 
      label: 'Products', 
      value: '1,284', 
      change: '+12.5%', 
      icon: <FaBox />,  // ✅ React element
      color: 'blue' 
    },
    { 
      label: 'Quotes', 
      value: '56', 
      change: '+8.2%', 
      icon: <FaQuoteRight />, 
      color: 'purple' 
    },
    { 
      label: 'Users', 
      value: '23', 
      change: '+5.0%', 
      icon: <FaUsers />, 
      color: 'green' 
    },
    { 
      label: 'Satisfaction', 
      value: '98%', 
      change: '+2.1%', 
      icon: <FaStar />, 
      color: 'orange' 
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;