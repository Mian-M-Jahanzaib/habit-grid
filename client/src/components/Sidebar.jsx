import React from 'react';
import logo from '../assets/react.svg'; // Or your logo path

const Sidebar = ({ activeTab, setActiveTab, onOpenCreate, userProfile }) => {
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar_month' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#1C252E] h-full flex flex-col border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-50">
      
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-xl">
            <span className="material-symbols-outlined text-primary text-2xl">grid_view</span>
        </div>
        <div>
            <h1 className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">HabitGrid</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stay Consistent</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 flex flex-col gap-2 mt-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-gray-500 dark:text-[#9dabb9] hover:bg-gray-100 dark:hover:bg-[#2c3b4a] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Add Button */}
      <div className="p-4">
        <button 
            onClick={onOpenCreate}
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
            <span className="material-symbols-outlined">add</span>
            Add New Task
        </button>
      </div>

      {/* User Profile (Dynamic!) */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2c3b4a] transition-colors cursor-pointer" onClick={() => setActiveTab('settings')}>
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
                {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="User" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-lg">person</span>
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {userProfile?.first_name} {userProfile?.last_name}
                </p>
                {/* Removed "Pro Member" text as requested */}
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;