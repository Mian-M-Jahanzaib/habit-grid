import React, { useState, useEffect, useRef } from 'react';

const Settings = ({ userProfile, onProfileUpdate }) => { 
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    avatar_url: ''
  });
  
  const fileInputRef = useRef(null);

  // Load initial data from props
  useEffect(() => {
    if (userProfile) {
        setFormData({
            first_name: userProfile.first_name || '',
            last_name: userProfile.last_name || '',
            email: userProfile.email || '',
            bio: userProfile.bio || '',
            avatar_url: userProfile.avatar_url || ''
        });
    }
  }, [userProfile]);

  const handleSave = async () => {
    setLoading(true);
    try {
        const res = await fetch('http://localhost:5000/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (res.ok) {
            // This triggers the live update in the Sidebar
            onProfileUpdate(formData); 
            alert("Profile saved successfully!");
        } else {
            alert("Failed to save. Check server console.");
        }
    } catch (err) {
        console.error(err);
        alert("Network error.");
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, avatar_url: reader.result }));
        };
        reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const handleExport = () => window.location.href = 'http://localhost:5000/api/export';
  
  const handleImport = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
          try {
              const json = JSON.parse(e.target.result);
              if (confirm("WARNING: This will overwrite ALL current data. Continue?")) {
                  const res = await fetch('http://localhost:5000/api/import', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(json)
                  });
                  if (res.ok) {
                      alert("Import successful! Reloading...");
                      window.location.reload();
                  }
              }
          } catch (err) { alert("Invalid backup file."); }
      };
      reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (confirm("Permanently delete ALL habits and logs?")) {
        await fetch('http://localhost:5000/api/reset-data', { method: 'DELETE' });
        window.location.reload();
    }
  };

  return (
    // Removed h-full to allow scrolling/growing
    <div className="layout-container flex flex-col flex-1 max-w-[1400px] mx-auto w-full px-6 py-8 md:px-10 md:py-10 gap-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-500 dark:text-[#9dabb9] mt-1">Manage your profile, app preferences, and data.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex flex-col gap-1">
            {['profile', 'data', 'danger'].map(sec => (
                <button 
                    key={sec}
                    onClick={() => setActiveSection(sec)}
                    className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                        activeSection === sec 
                        ? (sec === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary')
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {sec === 'profile' ? 'person' : sec === 'data' ? 'database' : 'warning'}
                    </span>
                    {sec === 'profile' ? 'Account Profile' : sec === 'data' ? 'Data Management' : 'Danger Zone'}
                </button>
            ))}
        </div>

        {/* Content Area - Removed h-full here too */}
        <div className="flex-1 bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
            
            {activeSection === 'profile' && (
                <div className="max-w-2xl flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Profile</h3>
                    
                    {/* Avatar */}
                    <div className="bg-gray-50 dark:bg-[#1C252E] p-6 rounded-xl border border-gray-100 dark:border-gray-800 mb-8 flex items-center gap-6">
                        <div className="relative w-24 h-24">
                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-3xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-sm">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                                )}
                            </div>
                            <button 
                                onClick={triggerFileInput}
                                className="absolute bottom-0 right-0 bg-primary text-white w-8 h-8 rounded-full shadow-md border-2 border-white dark:border-[#1C252E] flex items-center justify-center hover:bg-blue-600 transition-colors z-10"
                            >
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Profile Photo</h4>
                            <p className="text-xs text-gray-500 mb-3">Accepts SVG, PNG, JPG. Max 5MB.</p>
                            <div className="flex gap-3">
                                <button onClick={triggerFileInput} className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">Change</button>
                                <button onClick={() => setFormData({...formData, avatar_url: ''})} className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Remove</button>
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                            <input type="text" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111418] text-gray-900 dark:text-white p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                            <input type="text" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111418] text-gray-900 dark:text-white p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111418] text-gray-900 dark:text-white p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                        <textarea rows="4" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111418] text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}></textarea>
                    </div>

                    {/* SAVE BUTTON - Placed directly here inside the box */}
                    <div className="flex justify-end">
                        <button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-blue-500/30 active:scale-95">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}

            {/* Other sections ... */}
            {activeSection === 'data' && (
                <div className="max-w-2xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Data Management</h3>
                    <div className="space-y-4">
                        <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><span className="material-symbols-outlined">download</span></div>
                                <div><h4 className="font-bold text-gray-900 dark:text-white">Export Data</h4><p className="text-xs text-gray-500">JSON Backup</p></div>
                            </div>
                            <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50">Export</button>
                        </div>
                        <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center"><span className="material-symbols-outlined">upload</span></div>
                                <div><h4 className="font-bold text-gray-900 dark:text-white">Import Data</h4><p className="text-xs text-gray-500">Restore JSON</p></div>
                            </div>
                            <label className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 cursor-pointer">Import<input type="file" className="hidden" accept=".json" onChange={handleImport} /></label>
                        </div>
                    </div>
                </div>
            )}
            
            {activeSection === 'danger' && (
                <div className="max-w-2xl">
                     <h3 className="text-xl font-bold text-red-500 mb-6">Danger Zone</h3>
                     <div className="p-5 border border-red-200 bg-red-50 rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-white text-red-500 flex items-center justify-center shadow-sm"><span className="material-symbols-outlined">delete</span></div>
                             <div><h4 className="font-bold text-red-700">Delete All Data</h4><p className="text-xs text-red-600/70">Irreversible action</p></div>
                        </div>
                        <button onClick={handleResetData} className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50">Reset</button>
                     </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Settings;