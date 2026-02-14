import React from 'react';

const CircularProgress = ({ percentage, total, completed }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-48 h-48 mt-4 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background Circle */}
        <circle
          className="text-gray-100 dark:text-gray-800"
          cx="96"
          cy="96"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="12"
        ></circle>
        {/* Progress Circle */}
        <circle
          className="text-primary transition-all duration-1000 ease-out"
          cx="96"
          cy="96"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        ></circle>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-gray-900 dark:text-white">{percentage}%</span>
        <span className="text-sm text-gray-500 dark:text-[#9dabb9] mt-1">{completed} of {total} done</span>
      </div>
    </div>
  );
};

export default CircularProgress;