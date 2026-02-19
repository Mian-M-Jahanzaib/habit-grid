import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import Analytics from './components/Analytics';
import Settings from './components/Settings'; 
import CreateHabitModal from './components/CreateHabitModal';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dayNotes, setDayNotes] = useState([]);
  
  // --- MOBILE MENU STATE ---
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
      if (typeof window !== 'undefined') {
          return localStorage.getItem('theme') || 'light';
      }
      return 'light';
  });

  const [userProfile, setUserProfile] = useState({
      first_name: 'Alex',
      last_name: 'Morgan',
      email: '',
      bio: '',
      avatar_url: ''
  });

  const [loading, setLoading] = useState(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [habitsRes, logsRes, notesRes, profileRes] = await Promise.all([
        fetch('http://localhost:5000/api/habits'),
        fetch('http://localhost:5000/api/logs'),
        fetch('http://localhost:5000/api/notes'),
        fetch('http://localhost:5000/api/profile')
      ]);
      
      const habitsData = await habitsRes.json();
      const logsData = await logsRes.json();
      const notesData = await notesRes.json();
      const profileData = await profileRes.json();

      setHabits(habitsData);
      setLogs(logsData);
      setDayNotes(notesData);
      if (profileData) setUserProfile(profileData);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleProfileUpdate = (newProfileData) => {
      setUserProfile(prev => ({ ...prev, ...newProfileData }));
  };

  const handleToggle = async (habitId, date, newStatus) => {
    const updatedLogs = [...logs];
    const existingIndex = updatedLogs.findIndex(l => l.habit_id === habitId && l.log_date === date);
    if (existingIndex > -1) updatedLogs[existingIndex].status = newStatus;
    else updatedLogs.push({ habit_id: habitId, log_date: date, status: newStatus });
    setLogs(updatedLogs);
    await fetch('http://localhost:5000/api/log', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: habitId, date, status: newStatus })
    });
  };

  const handleSaveNote = async (date, content) => {
    const updatedNotes = [...dayNotes];
    const index = updatedNotes.findIndex(n => n.note_date === date);
    if (index > -1) updatedNotes[index].content = content;
    else updatedNotes.push({ note_date: date, content });
    setDayNotes(updatedNotes);
    await fetch('http://localhost:5000/api/note', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, content })
    });
  };

  const handleSaveHabit = async (habitData) => {
      try {
          if (habitToEdit) {
              await fetch(`http://localhost:5000/api/habits/${habitToEdit.id}`, {
                  method: 'PUT', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(habitData)
              });
              setHabits(habits.map(h => h.id === habitToEdit.id ? { ...habitData, id: habitToEdit.id } : h));
          } else {
              const res = await fetch('http://localhost:5000/api/habits', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(habitData)
              });
              const result = await res.json();
              setHabits([...habits, { ...habitData, id: result.id }]);
          }
          setIsCreateOpen(false); setHabitToEdit(null);
      } catch (err) { console.error("Error saving habit", err); }
  };

  const handleDelete = async (id) => {
      if (!window.confirm("Delete this habit?")) return;
      await fetch(`http://localhost:5000/api/habits/${id}`, { method: 'DELETE' });
      setHabits(habits.filter(h => h.id !== id));
  };

  const openCreateModal = () => { setHabitToEdit(null); setIsCreateOpen(true); };
  const openEditModal = (habit) => { setHabitToEdit(habit); setIsCreateOpen(true); };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display transition-colors duration-300">
      
      {/* Sidebar now receives the mobile open state */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenCreate={openCreateModal}
        userProfile={userProfile}
        theme={theme}             
        toggleTheme={toggleTheme} 
        isMobileOpen={isMobileOpen}       // <--- Passed
        setIsMobileOpen={setIsMobileOpen} // <--- Passed
      />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative scroll-smooth w-full">
        
        {/* --- MOBILE HEADER (Only shows on mobile screens) --- */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C252E] sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">grid_view</span>
                </div>
                <span className="font-black tracking-tight text-xl text-gray-900 dark:text-white">HabitGrid</span>
            </div>
            {/* Hamburger Button */}
            <button 
                onClick={() => setIsMobileOpen(true)} 
                className="p-2 rounded-lg bg-gray-50 dark:bg-[#2c3b4a] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 transition-colors"
            >
                <span className="material-symbols-outlined">menu</span>
            </button>
        </div>

        {/* Existing Content */}
        {activeTab === 'dashboard' && <Dashboard habits={habits} logs={logs} loading={loading} onToggle={handleToggle} onEdit={openEditModal} onDelete={handleDelete} />}
        {activeTab === 'calendar' && <Calendar logs={logs} habits={habits} dayNotes={dayNotes} onSaveNote={handleSaveNote} />}
        {activeTab === 'analytics' && <Analytics habits={habits} logs={logs} />}
        {activeTab === 'settings' && <Settings userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />}
      </main>

      <CreateHabitModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSave={handleSaveHabit} initialData={habitToEdit} />
    </div>
  );
}

export default App;