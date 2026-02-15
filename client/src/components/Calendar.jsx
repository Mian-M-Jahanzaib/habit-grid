import React, { useState, useEffect } from 'react';

const Calendar = ({ logs, habits, dayNotes, onSaveNote }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [noteText, setNoteText] = useState('');

  // --- Helpers ---
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const days = Array(firstDay).fill(null).concat([...Array(daysInMonth).keys()].map(i => i + 1));
  const selectedDateStr = selectedDate.toLocaleDateString('en-CA');

  // Load Note
  useEffect(() => {
    const note = dayNotes.find(n => n.note_date === selectedDateStr);
    setNoteText(note ? note.content : '');
  }, [selectedDateStr, dayNotes]);

  const handleNoteBlur = () => {
    onSaveNote(selectedDateStr, noteText);
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // --- FILTER SIDEBAR HABITS ---
  const dailyHabits = habits.filter(habit => {
      const habitStartDate = new Date(habit.created_at);
      habitStartDate.setHours(0, 0, 0, 0);
      
      const currentSelected = new Date(selectedDate);
      currentSelected.setHours(0, 0, 0, 0);

      // Must exist by this date
      if (currentSelected < habitStartDate) return false;

      // Must not be expired
      if (habit.end_date) {
          const habitEndDate = new Date(habit.end_date);
          habitEndDate.setHours(0, 0, 0, 0);
          if (currentSelected > habitEndDate) return false;
      }

      return true;
  }).map(habit => {
    const isCompleted = logs.some(l => l.habit_id === habit.id && l.log_date === selectedDateStr && l.status === 'completed');
    return { ...habit, isCompleted };
  });

  const completedCount = dailyHabits.filter(h => h.isCompleted).length;
  const totalCount = dailyHabits.length;
  
  // --- STATUS TEXT LOGIC ---
  let dayStatus = "No Activity";
  let statusColor = "text-gray-400";

  const today = new Date();
  today.setHours(0,0,0,0);
  const checkDate = new Date(selectedDate);
  checkDate.setHours(0,0,0,0);

  if (totalCount > 0) {
      if (checkDate > today) {
          const diffTime = Math.abs(checkDate - today);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          dayStatus = diffDays === 1 ? "Tomorrow" : `In ${diffDays} Days`;
          statusColor = "text-blue-500"; 
      } else if (checkDate.getTime() === today.getTime()) {
          if (completedCount === totalCount) {
             dayStatus = "All Done!";
             statusColor = "text-green-500";
          } else if (completedCount > 0) {
             dayStatus = "In Progress";
             statusColor = "text-orange-500";
          } else {
             dayStatus = "Today";
             statusColor = "text-blue-500";
          }
      } else {
          if (completedCount === totalCount) {
              dayStatus = "Perfect Day";
              statusColor = "text-green-500";
          } else if (completedCount >= totalCount / 2) {
              dayStatus = "Good Effort";
              statusColor = "text-blue-500";
          } else if (completedCount > 0) {
              dayStatus = "Start Strong";
              statusColor = "text-orange-500";
          } else {
              dayStatus = "Missed";
              statusColor = "text-red-400";
          }
      }
  } else if (checkDate > today) {
      dayStatus = "Free Day";
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h2>
          <div className="flex items-center bg-gray-100 dark:bg-[#1f2937] rounded-lg p-1">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md text-gray-500">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <span className="px-3 text-sm font-medium text-gray-900 dark:text-white min-w-[120px] text-center">{monthName}</span>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md text-gray-500">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
        <button 
            onClick={() => { setSelectedDate(new Date()); setCurrentDate(new Date()); }}
            className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
        >
            Jump to Today
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Calendar Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 h-full flex flex-col">
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a222b]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-gray-200 dark:bg-gray-800 gap-[1px] border-b border-gray-200 dark:border-gray-800">
              {days.map((day, index) => {
                if (!day) return <div key={index} className="bg-white dark:bg-[#111418]"></div>;

                const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const cellDateStr = cellDate.toLocaleDateString('en-CA');
                const isSelected = selectedDateStr === cellDateStr;
                
                // Normalizing cellDate for comparison
                const cDate = new Date(cellDate);
                cDate.setHours(0,0,0,0);
                const todayMidnight = new Date();
                todayMidnight.setHours(0,0,0,0);

                // 1. Find ALL Active Habits for this specific day
                const activeHabitsForDay = habits.filter(h => {
                    const hStart = new Date(h.created_at);
                    hStart.setHours(0,0,0,0);
                    
                    if (cDate < hStart) return false; // Too early
                    
                    if (h.end_date) {
                        const hEnd = new Date(h.end_date);
                        hEnd.setHours(0,0,0,0);
                        if (cDate > hEnd) return false; // Too late (expired)
                    }
                    return true;
                });

                // 2. Map them to status dots
                const dots = activeHabitsForDay.map(habit => {
                    const isCompleted = logs.some(l => l.habit_id === habit.id && l.log_date === cellDateStr && l.status === 'completed');
                    
                    if (isCompleted) return 'bg-green-500'; // Done
                    if (cDate < todayMidnight) return 'bg-red-500'; // Missed (Past)
                    return 'bg-gray-300 dark:bg-gray-600'; // Upcoming (Future/Today)
                });
                
                const hasNote = dayNotes.some(n => n.note_date === cellDateStr && n.content.trim().length > 0);

                return (
                  <div 
                    key={index} 
                    onClick={() => setSelectedDate(cellDate)}
                    className={`bg-white dark:bg-[#111418] p-2 min-h-[100px] cursor-pointer transition-all relative hover:bg-gray-50 dark:hover:bg-[#1a222b]
                        ${isSelected ? 'ring-2 ring-inset ring-primary z-10' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${isSelected ? 'text-primary font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                        {day}
                        </span>
                        {hasNote && <span className="material-symbols-outlined text-[10px] text-gray-400">description</span>}
                    </div>
                    
                    {/* Render Dots for EVERY active habit */}
                    <div className="flex flex-wrap gap-1 mt-2 content-start">
                        {dots.map((colorClass, i) => (
                            <div key={i} className={`h-2 w-2 rounded-full ${colorClass}`}></div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="w-96 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418] flex flex-col shadow-xl z-20">
             
             <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </h3>
                    <span className="material-symbols-outlined text-gray-300">event</span>
                </div>
                <div className="flex gap-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                        <p className={`text-sm font-bold ${statusColor}`}>{dayStatus}</p>
                    </div>
                    {totalCount > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Done</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{completedCount}/{totalCount} Tasks</p>
                        </div>
                    )}
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {totalCount === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-6">
                        <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">history_toggle_off</span>
                        <p className="text-sm">No active habits on this date.</p>
                        <p className="text-xs mt-1 text-gray-500">
                            {checkDate > today ? "Enjoy your free time!" : "Tasks appear here when scheduled."}
                        </p>
                    </div>
                ) : (
                    dailyHabits.map(habit => (
                        <div key={habit.id} className="p-3 bg-gray-50 dark:bg-[#1a222b] rounded-lg border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                                habit.isCompleted 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-300'
                            }`}>
                                {habit.isCompleted ? (
                                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                                ) : (
                                    <span className="material-symbols-outlined text-sm">remove</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-medium ${habit.isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {habit.title}
                                </h4>
                                <p className="text-xs text-gray-400">
                                    {habit.isCompleted ? 'Completed' : 'Scheduled'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
             </div>

             <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161b22]">
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Daily Notes</p>
                <textarea 
                    className="w-full h-24 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111418] p-3 text-sm focus:ring-primary focus:border-primary dark:text-white resize-none"
                    placeholder="How was your day?"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onBlur={handleNoteBlur}
                ></textarea>
                <p className="text-[10px] text-gray-400 mt-1 text-right">Auto-saves on click away</p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;