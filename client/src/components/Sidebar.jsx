import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, onOpenCreate }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'calendar', icon: 'calendar_month', label: 'Calendar' },
    { id: 'analytics', icon: 'bar_chart', label: 'Analytics' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between bg-white dark:bg-[#111418] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 hidden md:flex">
      <div className="flex flex-col gap-6 p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined">grid_view</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight">HabitGrid</h1>
            <p className="text-gray-500 dark:text-[#9dabb9] text-xs font-normal">Stay Consistent</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-gray-100 dark:hover:bg-[#1f2937] text-gray-600 dark:text-[#9dabb9]'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === item.id ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <p className="text-sm font-medium">{item.label}</p>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 flex flex-col gap-4">
        <button 
  onClick={onOpenCreate}  // <--- ADD THIS
  className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
>
  <span className="material-symbols-outlined text-[20px]">add</span>
  <span>Add New Task</span>
</button>
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
             AM
          </div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-sm font-medium truncate text-gray-900 dark:text-white">Alex Morgan</p>
            <p className="text-xs text-gray-500 dark:text-[#9dabb9] truncate">Pro Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;