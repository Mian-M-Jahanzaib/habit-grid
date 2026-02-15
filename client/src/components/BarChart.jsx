import React from 'react';

const BarChart = ({ habits, logs }) => {
  // 1. Prepare Data
  const data = habits.map(habit => {
    // Count how many times this specific habit was completed
    const count = logs.filter(l => l.habit_id === habit.id && l.status === 'completed').length;
    return { 
        id: habit.id,
        label: habit.title, 
        value: count, 
        color: habit.color 
    };
  });

  // 2. Find maximum value to scale the bars relative to the highest one
  const maxValue = Math.max(...data.map(d => d.value), 1); 

  // Color helper 
  const getColor = (colorName) => {
    const map = {
      'blue-500': '#3b82f6',
      'green-500': '#22c55e',
      'red-500': '#ef4444',
      'orange-500': '#f97316',
      'purple-500': '#a855f7',
      'teal-500': '#14b8a6',
    };
    return map[colorName] || '#6b7280';
  };

  return (
    <div className="w-full h-full flex flex-col justify-end">
      {habits.length === 0 ? (
          <div className="text-gray-400 text-sm h-full flex items-center justify-center">
            No habits found. Create a task to see comparisons.
          </div>
      ) : (
          <div className="flex items-end gap-3 h-[200px] w-full overflow-x-auto pb-4 scrollbar-hide">
              {data.map((item) => {
                  // Calculate height percentage (min 2% so it's never invisible)
                  let percentage = (item.value / maxValue) * 100;
                  if (percentage === 0) percentage = 2; 

                  return (
                      <div key={item.id} className="flex flex-col items-center gap-2 group flex-1 min-w-[50px]">
                          {/* Floating Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-10 bg-gray-800 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                              {item.value} times
                          </div>
                          
                          {/* The Bar */}
                          <div className="w-full flex items-end justify-center h-[160px] relative">
                             <div 
                                className="w-full max-w-[30px] rounded-t-md transition-all duration-500 ease-out hover:opacity-80"
                                style={{ 
                                    height: `${percentage}%`, 
                                    backgroundColor: getColor(item.color)
                                }}
                             ></div>
                          </div>
                          
                          {/* Label */}
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate w-full text-center max-w-[60px]" title={item.label}>
                              {item.label}
                          </span>
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
};

export default BarChart;