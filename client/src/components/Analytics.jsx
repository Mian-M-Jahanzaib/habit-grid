import React from 'react';
import BarChart from './BarChart';

const Analytics = ({ habits, logs }) => {
  // --- 1. Stats Logic ---
  const totalLogs = logs.length;
  const completedLogs = logs.filter(l => l.status === 'completed').length;
  const missedLogs = totalLogs - completedLogs;
  const completionRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

  // --- 2. Streak Logic ---
  const calculateBestStreak = () => {
    if (logs.length === 0) return 0;
    const completedDates = [...new Set(logs.filter(l => l.status === 'completed').map(l => l.log_date))].sort();
    if (completedDates.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < completedDates.length; i++) {
        const prev = new Date(completedDates[i-1]);
        const curr = new Date(completedDates[i]);
        const diffDays = Math.ceil(Math.abs(curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) currentStreak++;
        else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
        }
    }
    return Math.max(maxStreak, currentStreak);
  };

  const calculateCurrentStreak = () => {
      const completedDates = new Set(logs.filter(l => l.status === 'completed').map(l => l.log_date));
      let streak = 0;
      let d = new Date();
      if (!completedDates.has(d.toLocaleDateString('en-CA'))) {
          d.setDate(d.getDate() - 1);
          if (!completedDates.has(d.toLocaleDateString('en-CA'))) return 0;
      }
      while (completedDates.has(d.toLocaleDateString('en-CA'))) {
          streak++;
          d.setDate(d.getDate() - 1);
      }
      return streak;
  };

  const bestStreak = calculateBestStreak();
  const currentStreak = calculateCurrentStreak();

  // --- 3. Annual Grid Data ---
  const generateAnnualGrid = () => {
    const today = new Date();
    // 52 weeks * 7 days = 364 days.
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    
    // Align to previous Sunday
    const dayOfWeek = startDate.getDay(); 
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const days = [];
    const totalDays = 53 * 7; 

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toLocaleDateString('en-CA');
      
      if (d > today) {
         days.push({ date: dateStr, intensity: -1, dateObj: d }); 
         continue;
      }

      // Logic
      const activeHabitsCount = habits.filter(h => {
          const created = new Date(h.created_at);
          created.setHours(0,0,0,0);
          const current = new Date(d);
          current.setHours(0,0,0,0);
          return created <= current;
      }).length;

      const completedCount = logs.filter(l => l.log_date === dateStr && l.status === 'completed').length;

      let intensity = 0;
      if (activeHabitsCount > 0) {
          const ratio = completedCount / activeHabitsCount;
          if (ratio === 0) intensity = 0;
          else if (ratio < 0.4) intensity = 1;
          else if (ratio < 0.7) intensity = 2;
          else if (ratio < 1.0) intensity = 3;
          else intensity = 4;
      }

      days.push({ date: dateStr, intensity, dateObj: d, completed: completedCount, total: activeHabitsCount });
    }
    return days;
  };

  const annualData = generateAnnualGrid();

  // --- 4. Prepare Headers (Weeks) ---
  // Extract the Sunday (start date) of each of the 53 weeks
  const weeks = [];
  for (let i = 0; i < annualData.length; i += 7) {
      weeks.push(annualData[i]); // This is the Sunday of that week
  }

  return (
    <div className="layout-container flex flex-col flex-1 max-w-[1400px] mx-auto w-full px-6 py-8 md:px-10 md:py-10 gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Performance Analytics</h2>
        <p className="text-gray-500 dark:text-[#9dabb9] mt-1">Deep dive into your habit building journey.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
            <span className="material-symbols-outlined text-3xl">local_fire_department</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Streak</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{currentStreak} Days</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
            <span className="material-symbols-outlined text-3xl">emoji_events</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Best Streak</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{bestStreak} Days</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <span className="material-symbols-outlined text-3xl">percent</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{completionRate}%</h3>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Task Completion Comparison</h3>
            </div>
            <div className="flex-1 w-full">
                <BarChart habits={habits} logs={logs} />
            </div>
        </div>

        {/* Ring Chart (Red Background, Blue Foreground) */}
        <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 w-full text-left">Success Distribution</h3>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        {/* Background Ring = VIVID RED (Missed) */}
                        <path className="text-red-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                        
                        {/* Foreground Ring = BLUE (Completed) */}
                        <path className="text-blue-500 transition-all duration-1000 ease-out" 
                            strokeDasharray={`${completionRate}, 100`} 
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                        </path>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{completionRate}%</span>
                        <span className="text-xs text-gray-500 dark:text-[#9dabb9]">Success</span>
                    </div>
                </div>

                <div className="w-full space-y-3 px-4">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-gray-600 dark:text-gray-300">Completed</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{completedLogs}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-gray-600 dark:text-gray-300">Missed</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{missedLogs}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Annual Consistency Map (Fixed Alignment) */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Annual Consistency Map</h3>
            <p className="text-xs text-gray-500">Visualizing daily effort over the last 12 months.</p>
        </div>
        
        {/* The Grid Container */}
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            {/* Fix width to match content so it doesn't shrink */}
            <div className="min-w-max"> 
                
                {/* 1. Header Row (Weeks) - USES SAME GRID STRUCTURE AS DOTS */}
                {/* grid-flow-col ensures it lays out sideways. w-2.5 matches dots. gap-1 matches dots. */}
                <div className="grid grid-flow-col gap-1 mb-2">
                    {weeks.map((sunday, i) => {
                        if (!sunday || sunday.intensity === -1) return null;
                        
                        const currentMonthNum = sunday.dateObj.getMonth();
                        const currentMonthName = sunday.dateObj.toLocaleString('default', { month: 'short' });
                        
                        // Show label if it's the first column OR if month changed from previous week
                        let showLabel = false;
                        if (i === 0) {
                            showLabel = true;
                        } else {
                           const prevWeekSunday = weeks[i-1];
                           if (prevWeekSunday.dateObj.getMonth() !== currentMonthNum) {
                               showLabel = true;
                           }
                        }

                        return (
                            <div key={i} className="w-2.5 relative h-4">
                                {showLabel && (
                                    // Absolute positioning inside the 10px cell allows text to spill over
                                    // without pushing the next cell.
                                    <span className="absolute left-0 top-0 text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                        {currentMonthName}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 2. The Dots Grid */}
                {/* 7 rows. grid-flow-col fills top-to-bottom, then left-to-right */}
                <div className="grid grid-rows-7 grid-flow-col gap-1">
                    {annualData.map((day, i) => (
                        <div 
                            key={i}
                            title={`${day.dateObj.toDateString()}: ${day.completed} / ${day.total} Tasks`}
                            className={`rounded-[2px] w-2.5 h-2.5 transition-colors ${
                                day.intensity === -1 ? 'invisible' :
                                day.intensity === 0 ? 'bg-gray-100 dark:bg-[#1f2937]' :
                                day.intensity === 1 ? 'bg-blue-200 dark:bg-blue-900/40' :
                                day.intensity === 2 ? 'bg-blue-400 dark:bg-blue-700' :
                                day.intensity === 3 ? 'bg-blue-600 dark:bg-blue-600' :
                                'bg-blue-800 dark:bg-blue-500' 
                            }`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Footer Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
            <span>Less</span>
            <div className="w-3 h-3 rounded-[2px] bg-gray-100 dark:bg-[#1f2937]"></div>
            <div className="w-3 h-3 rounded-[2px] bg-blue-200 dark:bg-blue-900/40"></div>
            <div className="w-3 h-3 rounded-[2px] bg-blue-400 dark:bg-blue-700"></div>
            <div className="w-3 h-3 rounded-[2px] bg-blue-600 dark:bg-blue-600"></div>
            <div className="w-3 h-3 rounded-[2px] bg-blue-800 dark:bg-blue-500"></div>
            <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;