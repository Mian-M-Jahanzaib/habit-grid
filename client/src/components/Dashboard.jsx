import React, { useState } from 'react';
import HabitCard from './HabitCard';
import ConsistencyChart from './ConsistencyChart';
import CircularProgress from './CircularProgress';

const Dashboard = ({ habits, logs, loading, onToggle, onEdit, onDelete }) => {
  const [timeRange, setTimeRange] = useState('30days'); // '30days', '90days', 'year', 'all'

  // --- STATS CALCULATION ---
  const today = new Date().toLocaleDateString('en-CA');
  
  const todaysLogs = logs.filter(l => l.log_date === today);
  const totalActiveHabits = habits.length;
  const completedToday = todaysLogs.filter(l => l.status === 'completed').length;
  
  const dailyPercentage = totalActiveHabits > 0 
    ? Math.round((completedToday / totalActiveHabits) * 100) 
    : 0;

  // Calculate Consistency Score (Matches selected time range)
  const calculateConsistency = () => {
    if (habits.length === 0) return 0;

    let rangeDays = 30;
    if (timeRange === '90days') rangeDays = 90;
    if (timeRange === 'year') rangeDays = 365;
    if (timeRange === 'all') rangeDays = 9999; 

    // Find start date
    const earliestHabit = [...habits].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
    if (!earliestHabit) return 0;
    
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    // If "All Time" or if calculated start date is before actual start, use actual start
    if (startDate < new Date(earliestHabit.created_at) || timeRange === 'all') {
        startDate = new Date(earliestHabit.created_at);
    }
    
    let currentDate = new Date(startDate);
    const now = new Date();
    
    let totalScore = 0;
    let daysCount = 0;

    currentDate.setHours(0,0,0,0);
    now.setHours(0,0,0,0);

    while (currentDate <= now) {
      const dateStr = currentDate.toLocaleDateString('en-CA');
      const activeCount = habits.filter(h => {
          const hDate = new Date(h.created_at);
          hDate.setHours(0,0,0,0);
          return hDate <= currentDate;
      }).length;

      if (activeCount > 0) {
        const completedCount = logs.filter(l => l.log_date === dateStr && l.status === 'completed').length;
        totalScore += (completedCount / activeCount);
        daysCount++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (daysCount === 0) return 0;
    return Math.round((totalScore / daysCount) * 100);
  };

  const consistencyScore = calculateConsistency();

  // Helper for button styles
  const getBtnClass = (range) => 
    `px-3 py-1 text-xs font-medium rounded shadow-sm transition-colors ${
      timeRange === range 
      ? 'bg-primary text-white' 
      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="layout-container flex flex-col flex-1 max-w-[1400px] mx-auto w-full px-6 py-8 md:px-10 md:py-10 gap-8">
      {/* Header */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">Collective Effort</h2>
            <p className="text-gray-500 dark:text-[#9dabb9] text-base">Track your consistency and build better habits.</p>
          </div>
          
          {/* Time Range Filter */}
          <div className="flex gap-2 bg-white dark:bg-[#1f2937] p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button onClick={() => setTimeRange('30days')} className={getBtnClass('30days')}>30 Days</button>
            <button onClick={() => setTimeRange('90days')} className={getBtnClass('90days')}>3 Months</button>
            <button onClick={() => setTimeRange('year')} className={getBtnClass('year')}>Year</button>
            <button onClick={() => setTimeRange('all')} className={getBtnClass('all')}>All Time</button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between min-h-[280px]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Consistency Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{consistencyScore}%</h3>
                  <span className="text-green-500 text-sm font-medium flex items-center">
                    <span className="material-symbols-outlined text-sm">trending_up</span> Average
                  </span>
                </div>
              </div>
            </div>
            
            {/* Pass timeRange to Chart */}
            <ConsistencyChart logs={logs} habits={habits} timeRange={timeRange} />
          </div>

          <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center relative min-h-[280px]">
            <p className="absolute top-6 left-6 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Today's Progress</p>
            <CircularProgress percentage={dailyPercentage} total={totalActiveHabits} completed={completedToday} />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {dailyPercentage === 100 ? "All done! Great job." : "Great start! Keep going."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Habits Grid */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Habits</h2>
            {/* View All button removed */}
        </div>

        {loading ? (
            <div className="text-white">Loading...</div>
        ) : habits.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-gray-700 rounded-xl text-gray-400">
                No habits found. Click "Add New Task" to start!
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {habits.map(habit => (
                    <HabitCard 
                        key={habit.id} 
                        habit={habit} 
                        logs={logs} 
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;