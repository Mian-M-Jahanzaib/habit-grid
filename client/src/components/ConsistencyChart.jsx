import React from 'react';

const ConsistencyChart = ({ logs, habits, timeRange }) => {
  // --- 1. Filter & Date Logic (Same as before) ---
  let startDate = new Date();
  const today = new Date();
  
  // Default ranges
  if (timeRange === '30days') startDate.setDate(today.getDate() - 30);
  else if (timeRange === '90days') startDate.setDate(today.getDate() - 90);
  else if (timeRange === 'year') startDate.setDate(today.getDate() - 365);
  else if (timeRange === 'all') startDate.setDate(today.getDate() - 9999);

  // Clamp to actual first habit date
  let firstHabitDate = new Date();
  if (habits.length > 0) {
    const earliestHabit = [...habits].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
    if (earliestHabit) firstHabitDate = new Date(earliestHabit.created_at);
  }

  if (startDate < firstHabitDate || timeRange === 'all') {
      startDate = new Date(firstHabitDate);
  }

  const dateArray = [];
  let currentDate = new Date(startDate);
  currentDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  while (currentDate <= today) {
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // --- 2. Calculate Data Points ---
  const dataPoints = dateArray.map(date => {
    const dateStr = date.toLocaleDateString('en-CA');
    const activeHabitsCount = habits.filter(h => {
        const hDate = new Date(h.created_at);
        hDate.setHours(0,0,0,0);
        return hDate <= date;
    }).length;

    if (activeHabitsCount === 0) return 0;
    const completedCount = logs.filter(l => l.log_date === dateStr && l.status === 'completed').length;
    return Math.round((completedCount / activeHabitsCount) * 100);
  });

  // --- 3. Draw SVG ---
  const width = 500;
  const height = 150;
  const pointGap = dataPoints.length > 1 ? width / (dataPoints.length - 1) : width;
  const getY = (val) => height - (val / 100) * height;

  let pathD = `M0,${getY(dataPoints[0])}`;
  dataPoints.forEach((point, index) => {
    if (index === 0 && dataPoints.length > 1) return;
    const x = dataPoints.length > 1 ? index * pointGap : width;
    const y = getY(point);
    pathD += ` L${x},${y}`;
  });

  const areaD = `${pathD} L${width},${height} L0,${height} Z`;

  // Calculate position of the last point for the Halo
  const lastPointY = dataPoints.length > 0 ? getY(dataPoints[dataPoints.length - 1]) : 0;
  const lastPointPercent = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1] : 0;

  return (
    <div className="w-full h-full flex items-end relative overflow-hidden pt-4">
      {dataPoints.length > 0 ? (
          <svg className="w-full h-[150px] overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradientLine" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#137fec" stopOpacity="0.3"></stop>
                <stop offset="100%" stopColor="#137fec" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#gradientLine)"></path>
            <path d={pathD} fill="none" stroke="#137fec" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke"></path>
            
            {/* The Semi-Circle / Halo Effect at the end */}
            <circle cx={width} cy={lastPointY} r="6" fill="#137fec" />
            <circle cx={width} cy={lastPointY} r="12" fill="#137fec" opacity="0.2" />
            <circle cx={width} cy={lastPointY} r="20" fill="#137fec" opacity="0.1" />
          </svg>
      ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Not enough data
          </div>
      )}
    </div>
  );
};

export default ConsistencyChart;