import React, { useState, useEffect, useRef } from 'react';

const HabitCard = ({ habit, logs, onToggle, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA');
  
  // Check if completed today
  const isCompletedToday = logs.some(log => log.habit_id === habit.id && log.log_date === todayStr && log.status === 'completed');

  // Color Mapping
  const colorMap = {
    'blue-500': 'bg-blue-500/10 text-blue-500',
    'green-500': 'bg-green-500/10 text-green-500',
    'red-500': 'bg-red-500/10 text-red-500',
    'orange-500': 'bg-orange-500/10 text-orange-500',
    'purple-500': 'bg-purple-500/10 text-purple-500',
    'teal-500': 'bg-teal-500/10 text-teal-500',
  };
  const colorClass = colorMap[habit.color] || 'bg-gray-500/10 text-gray-500';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- SMART GRID LOGIC ---
  const generateHeatmap = () => {
    const days = [];
    const daysToShow = 30; // Show full month
    
    // Normalize habit creation date
    const habitStartDate = new Date(habit.created_at);
    habitStartDate.setHours(0,0,0,0);

    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      
      // Normalize current grid date
      const gridDate = new Date(d);
      gridDate.setHours(0,0,0,0);
      
      const log = logs.find(l => l.habit_id === habit.id && l.log_date === dateStr);
      
      let status = 'neutral';
      let tooltip = 'Pending';

      if (gridDate < habitStartDate) {
          status = 'inactive'; 
          tooltip = 'No task on this day'; // <--- UPDATED TEXT
      } else if (log && log.status === 'completed') {
          status = 'completed';
          tooltip = `Completed on ${dateStr}`;
      } else if (dateStr < todayStr) {
          status = 'missed';
          tooltip = `Missed on ${dateStr}`;
      } else if (dateStr === todayStr) {
          status = 'today';
          tooltip = 'Today';
      }
      
      days.push({ date: dateStr, status, tooltip });
    }
    return days;
  };
  
  const heatmapData = generateHeatmap();
  
  const activeDays = heatmapData.filter(d => d.status !== 'inactive' && d.status !== 'today');
  const completedCount = activeDays.filter(d => d.status === 'completed').length;
  const consistency = activeDays.length > 0 ? Math.round((completedCount / activeDays.length) * 100) : 0;

  return (
    <div className="group bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all duration-300 flex flex-col gap-5 relative h-full">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
            <span className="material-symbols-outlined text-2xl">{habit.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{habit.title}</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-[#9dabb9] mt-0.5">{habit.frequency}</p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="material-symbols-outlined">more_vert</span>
            </button>
            {showMenu && (
                <div className="absolute right-0 top-8 w-32 bg-white dark:bg-[#1C252E] rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-10 overflow-hidden">
                    <button onClick={() => { setShowMenu(false); onEdit(habit); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">edit</span> Edit
                    </button>
                    <button onClick={() => { setShowMenu(false); onDelete(habit.id); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">delete</span> Delete
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-[#111418] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Mark as Done</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={isCompletedToday} onChange={() => onToggle(habit.id, todayStr, isCompletedToday ? 'missed' : 'completed')} />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
        </label>
      </div>

      {/* 30-Day Grid */}
      <div className="flex flex-col gap-3 mt-auto">
        <div className="flex justify-between items-center">
          <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Last 30 Days</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${consistency >= 80 ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>{consistency}% Consistency</span>
        </div>
        
        {/* Grid Container */}
        <div className="grid grid-cols-6 gap-2">
          {heatmapData.map((day, idx) => {
             // Logic for coloring
             let bgClass = 'bg-gray-200 dark:bg-gray-700'; // Darker Gray (Visible!)
             
             if (day.status === 'completed') bgClass = 'bg-green-500 shadow-sm shadow-green-500/30';
             else if (day.status === 'missed') bgClass = 'bg-red-500/80';
             else if (day.status === 'inactive') bgClass = 'bg-gray-300/50 dark:bg-gray-800/50'; // Distinct from "Future"
             
             // Highlight Today
             const isToday = day.status === 'today';
             const borderClass = isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#1C252E]' : '';

             return (
               <div 
                 key={idx}
                 title={day.tooltip}
                 className={`
                    h-7 rounded-md transition-all cursor-default
                    ${bgClass} ${borderClass}
                 `}
               ></div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default HabitCard;