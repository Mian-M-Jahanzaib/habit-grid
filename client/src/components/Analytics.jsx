import React from 'react';

const Analytics = ({ habits, logs }) => {
  // --- 1. Calculate Stats Logic ---
  
  // Total Completion Rate
  const totalLogs = logs.length;
  const completedLogs = logs.filter(l => l.status === 'completed').length;
  const completionRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;
  
  // Calculate "Current Streak" (Simplistic version: consecutive days with at least 1 task done)
  const calculateStreak = () => {
    // This is a placeholder for complex streak logic. 
    // For now, let's just count how many logs exist in the last 7 days.
    return logs.filter(l => l.status === 'completed').length; 
  };
  
  const currentStreak = calculateStreak();

  // --- 2. Generate Annual Grid (365 Days) ---
  const generateAnnualGrid = () => {
    const days = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      
      // Check if ANY habit was done on this day
      const dayLogs = logs.filter(l => l.log_date === dateStr && l.status === 'completed');
      
      // Color intensity based on tasks done (0, 1, 2, 3+)
      let intensity = 0;
      if (dayLogs.length > 0) intensity = 1;
      if (dayLogs.length > 2) intensity = 2;
      if (dayLogs.length > 4) intensity = 3;
      
      days.push({ date: dateStr, intensity });
    }
    return days;
  };

  const annualData = generateAnnualGrid();

  return (
    <div className="layout-container flex flex-col flex-1 max-w-[1400px] mx-auto w-full px-6 py-8 md:px-10 md:py-10 gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Performance Analytics</h2>
          <p className="text-gray-500 dark:text-[#9dabb9] mt-1">Deep dive into your habit building journey.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streak Card */}
        <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-5 relative overflow-hidden group">
          <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
            <span className="material-symbols-outlined text-3xl">local_fire_department</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks Done</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{completedLogs}</h3>
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-5 relative overflow-hidden group">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">percent</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{completionRate}%</h3>
          </div>
        </div>

        {/* Active Habits Count */}
        <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-5 relative overflow-hidden group">
          <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
             <span className="material-symbols-outlined text-3xl">emoji_events</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Habits</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{habits.length}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Success Distribution (Radial) */}
        <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 w-full text-left">Success Distribution</h3>
            <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-gray-100 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                    <path className="text-primary transition-all duration-1000 ease-out" 
                        strokeDasharray={`${completionRate}, 100`} 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" stroke="currentColor" strokeWidth="3">
                    </path>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{completionRate}%</span>
                    <span className="text-xs text-gray-500 dark:text-[#9dabb9]">Success</span>
                </div>
            </div>
        </div>

        {/* Annual Consistency Map (Github Style) */}
        <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Annual Consistency Map</h3>
            <div className="w-full overflow-x-auto pb-2">
                <div className="min-w-[700px] flex flex-col gap-1">
                    <div className="grid grid-rows-7 grid-flow-col gap-1 h-[140px]">
                        {annualData.map((day, i) => (
                            <div 
                                key={i}
                                title={`${day.date}: ${day.intensity} tasks`}
                                className={`rounded-sm w-3 h-3 ${
                                    day.intensity === 0 ? 'bg-gray-100 dark:bg-gray-800' :
                                    day.intensity === 1 ? 'bg-primary/30' :
                                    day.intensity === 2 ? 'bg-primary/60' :
                                    'bg-primary'
                                } hover:ring-2 hover:ring-gray-400 dark:hover:ring-white transition-all cursor-pointer`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
                <span className="text-xs text-gray-500">Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/30"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
                <div className="w-3 h-3 rounded-sm bg-primary"></div>
                <span className="text-xs text-gray-500">More</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;