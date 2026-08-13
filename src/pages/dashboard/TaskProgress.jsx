import React from 'react';

const TaskProgress = () => {
  const tasks = [
    { name: 'Login Page UI', status: 'done' },
    { name: 'Sidebar Navigation', status: 'done' },
    { name: 'Header with Theme Toggle', status: 'done' },
    { name: 'Dashboard Layout Integration', status: 'progress' },
  ];

  const totalDone = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2A2A2A] shadow-sm hover:border-[#C3110C] dark:hover:border-[#E6501B] transition-all duration-300 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-[#2A2A2A]">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
          <i className="fas fa-tasks text-[#C3110C] dark:text-[#E6501B] mr-2"></i> Dev 1 — Task Progress
        </h3>
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <i className="fas fa-check-circle text-green-500 mr-1.5"></i> {totalDone}/{total} completed
        </span>
      </div>
      <div className="p-4 sm:p-5 space-y-2.5">
        {tasks.map((task, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className={task.status === 'done' ? 'text-green-500' : 'text-yellow-500'}>
              <i className={`fas ${task.status === 'done' ? 'fa-check-circle' : 'fa-clock'}`}></i>
            </span>
            <span className="flex-1 font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">{task.name}</span>
            <span className={`text-xs font-medium ${task.status === 'done' ? 'text-green-500' : 'text-yellow-500'}`}>
              {task.status === 'done' ? 'Done' : 'In Progress'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskProgress;