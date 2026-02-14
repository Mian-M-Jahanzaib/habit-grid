import React from 'react';

const SettingsModal = ({ isOpen, onClose, habits, logs }) => {
  if (!isOpen) return null;

  // 1. Export Data Logic
  const handleExport = () => {
    const data = {
      habits: habits,
      logs: logs,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 2. Reset Data Logic
  const handleReset = async () => {
    if (window.confirm("Are you sure? This will delete ALL your habits and history forever.")) {
      try {
        await fetch('http://localhost:5000/api/reset', { method: 'DELETE' });
        window.location.reload(); // Reload to show empty state
      } catch (err) {
        console.error("Reset failed", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#1C252E] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 transform scale-100 transition-all p-0">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-6">
                
                {/* Data Backup Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">save</span>
                        <h4 class="text-sm font-bold text-gray-900 dark:text-white">Data Backup</h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[#9dabb9]">Save your progress to a file or restore from a backup.</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-background-light dark:bg-[#111418] hover:bg-gray-100 dark:hover:bg-[#1f2937] text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Export Data
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-background-light dark:bg-[#111418] hover:bg-gray-100 dark:hover:bg-[#1f2937] text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 transition-all opacity-50 cursor-not-allowed" title="Coming soon">
                            <span className="material-symbols-outlined text-[18px]">upload</span>
                            Import Data
                        </button>
                    </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-800"></div>

                {/* Danger Zone */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-red-500">
                        <span className="material-symbols-outlined">warning</span>
                        <h4 className="text-sm font-bold">Danger Zone</h4>
                    </div>
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex flex-col gap-3">
                        <p className="text-xs text-red-600 dark:text-red-400">This will permanently delete all your habit streaks and history.</p>
                        <button 
                            onClick={handleReset}
                            className="w-full py-2 bg-white dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-500/20 text-sm font-bold rounded-lg transition-colors"
                        >
                            Reset All Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-[#151b23] rounded-b-2xl flex justify-end">
                <p className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">HabitGrid v1.0.0 (Local)</p>
            </div>
        </div>
    </div>
  );
};

export default SettingsModal;