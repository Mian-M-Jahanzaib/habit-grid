import React, { useState, useEffect } from 'react';

const CreateHabitModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    icon: 'fitness_center',
    color: 'blue-500',
    frequency: 'daily',
    time_of_day: 'Anytime',
    end_date: null // Null means "Forever"
  });

  const [durationMode, setDurationMode] = useState('forever'); // 'forever', '7', '30', 'custom'

  useEffect(() => {
    if (initialData) {
        setFormData(initialData);
        // Determine mode based on end_date
        if (!initialData.end_date) {
            setDurationMode('forever');
        } else {
            setDurationMode('custom');
        }
    } else {
        setFormData({
            title: '',
            icon: 'fitness_center', 
            color: 'blue-500',
            frequency: 'daily',
            time_of_day: 'Anytime',
            end_date: null
        });
        setDurationMode('forever');
    }
  }, [initialData, isOpen]);

  // Handle Duration Logic
  const handleDurationChange = (mode) => {
      setDurationMode(mode);
      const today = new Date();
      
      if (mode === 'forever') {
          setFormData({ ...formData, end_date: null });
      } else if (mode === '7') {
          const d = new Date();
          d.setDate(today.getDate() + 7);
          setFormData({ ...formData, end_date: d.toLocaleDateString('en-CA') });
      } else if (mode === '30') {
          const d = new Date();
          d.setDate(today.getDate() + 30);
          setFormData({ ...formData, end_date: d.toLocaleDateString('en-CA') });
      } else if (mode === 'custom') {
          // Default to tomorrow if switching to custom
          const d = new Date();
          d.setDate(today.getDate() + 1);
          setFormData({ ...formData, end_date: d.toLocaleDateString('en-CA') });
      }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1C252E] w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6">
        
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {initialData ? 'Edit Habit' : 'Create New Habit'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Habit Title</label>
                <input 
                    type="text" 
                    required
                    placeholder="e.g. Read Books"
                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111418] text-gray-900 dark:text-white focus:ring-primary focus:border-primary p-2.5"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
            </div>

            {/* NEW DURATION SECTION */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goal Duration</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <button type="button" onClick={() => handleDurationChange('forever')} className={`py-2 text-xs font-bold rounded-lg border ${durationMode === 'forever' ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        Forever
                    </button>
                    <button type="button" onClick={() => handleDurationChange('7')} className={`py-2 text-xs font-bold rounded-lg border ${durationMode === '7' ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        7 Days
                    </button>
                    <button type="button" onClick={() => handleDurationChange('30')} className={`py-2 text-xs font-bold rounded-lg border ${durationMode === '30' ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        30 Days
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => handleDurationChange('custom')} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${durationMode === 'custom' ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        Custom Date
                    </button>
                    {durationMode === 'custom' && (
                        <input 
                            type="date" 
                            className="rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111418] text-gray-900 dark:text-white text-xs p-2"
                            value={formData.end_date || ''}
                            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                    <select 
                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111418] text-gray-900 dark:text-white focus:ring-primary focus:border-primary p-2.5"
                        value={formData.icon}
                        onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    >
                        <option value="fitness_center">Gym / Fitness</option>
                        <option value="menu_book">Reading</option>
                        <option value="water_drop">Water</option>
                        <option value="code">Code</option>
                        <option value="self_improvement">Meditation</option>
                        <option value="local_dining">Diet</option>
                        <option value="bedtime">Sleep</option>
                        <option value="savings">Finance</option>
                        <option value="check_circle">General</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                    <select 
                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111418] text-gray-900 dark:text-white focus:ring-primary focus:border-primary p-2.5"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                    >
                        <option value="blue-500">Blue</option>
                        <option value="green-500">Green</option>
                        <option value="red-500">Red</option>
                        <option value="orange-500">Orange</option>
                        <option value="purple-500">Purple</option>
                        <option value="teal-500">Teal</option>
                    </select>
                </div>
            </div>

            <button type="submit" className="mt-4 w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg transition-colors">
                {initialData ? 'Save Changes' : 'Create Habit'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default CreateHabitModal;