import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import Analytics from './components/Analytics';
import SettingsModal from './components/SettingsModal';
import CreateHabitModal from './components/CreateHabitModal';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dayNotes, setDayNotes] = useState([]); // <--- NEW STATE
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Habits, Logs, AND Notes
      const [habitsRes, logsRes, notesRes] = await Promise.all([
        fetch('http://localhost:5000/api/habits'),
        fetch('http://localhost:5000/api/logs'),
        fetch('http://localhost:5000/api/notes') // <--- NEW FETCH
      ]);
      
      const habitsData = await habitsRes.json();
      const logsData = await logsRes.json();
      const notesData = await notesRes.json(); // <--- NEW DATA

      setHabits(habitsData);
      setLogs(logsData);
      setDayNotes(notesData); // <--- SET STATE
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleToggle = async (habitId, date, newStatus) => {
    const updatedLogs = [...logs];
    const existingIndex = updatedLogs.findIndex(l => l.habit_id === habitId && l.log_date === date);

    if (existingIndex > -1) {
      updatedLogs[existingIndex].status = newStatus;
    } else {
      updatedLogs.push({ habit_id: habitId, log_date: date, status: newStatus });
    }
    setLogs(updatedLogs);

    await fetch('http://localhost:5000/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: habitId, date, status: newStatus })
    });
  };

  // NEW: Handle Saving Notes
  const handleSaveNote = async (date, content) => {
    // Optimistic Update
    const updatedNotes = [...dayNotes];
    const index = updatedNotes.findIndex(n => n.note_date === date);
    
    if (index > -1) {
        updatedNotes[index].content = content;
    } else {
        updatedNotes.push({ note_date: date, content });
    }
    setDayNotes(updatedNotes);

    // Send to Server
    try {
        await fetch('http://localhost:5000/api/note', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, content })
        });
    } catch (err) {
        console.error("Error saving note", err);
    }
  };

  // CRUD Handlers
  const handleSaveHabit = async (habitData) => {
      try {
          if (habitToEdit) {
              await fetch(`http://localhost:5000/api/habits/${habitToEdit.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(habitData)
              });
              setHabits(habits.map(h => h.id === habitToEdit.id ? { ...habitData, id: habitToEdit.id } : h));
          } else {
              const res = await fetch('http://localhost:5000/api/habits', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(habitData)
              });
              const result = await res.json();
              setHabits([...habits, { ...habitData, id: result.id }]);
          }
          setIsCreateOpen(false);
          setHabitToEdit(null);
      } catch (err) {
          console.error("Error saving habit", err);
      }
  };

  const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this habit?")) return;
      try {
          await fetch(`http://localhost:5000/api/habits/${id}`, { method: 'DELETE' });
          setHabits(habits.filter(h => h.id !== id));
      } catch (err) {
          console.error("Error deleting", err);
      }
  };

  const openCreateModal = () => {
      setHabitToEdit(null);
      setIsCreateOpen(true);
  };

  const openEditModal = (habit) => {
      setHabitToEdit(habit);
      setIsCreateOpen(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(id) => id === 'settings' ? setIsSettingsOpen(true) : setActiveTab(id)} 
        onOpenCreate={openCreateModal} 
      />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative scroll-smooth">
        {activeTab === 'dashboard' && (
            <Dashboard 
                habits={habits} 
                logs={logs} 
                loading={loading} 
                onToggle={handleToggle} 
                onEdit={openEditModal} 
                onDelete={handleDelete}
            />
        )}
        {activeTab === 'calendar' && (
            <Calendar 
                logs={logs} 
                habits={habits} 
                dayNotes={dayNotes}       // <--- Pass Notes
                onSaveNote={handleSaveNote} // <--- Pass Save Function
            />
        )}
        {activeTab === 'analytics' && <Analytics habits={habits} logs={logs} />}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        habits={habits}
        logs={logs}
      />

      <CreateHabitModal 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveHabit}
        initialData={habitToEdit}
      />
    </div>
  );
}

export default App;