const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

// --- MIDDLEWARE (Increased limit for Avatar Uploads) ---
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- DATABASE INITIALIZATION ---
const initDb = async () => {
    try {
        // 1. Create Habits Table
        await db.runQuery(`
            CREATE TABLE IF NOT EXISTS habits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                icon TEXT DEFAULT 'check_circle',
                color TEXT DEFAULT 'blue-500',
                frequency TEXT DEFAULT 'daily',
                time_of_day TEXT,
                end_date TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: Add end_date if missing
        try {
            await db.runQuery(`ALTER TABLE habits ADD COLUMN end_date TEXT`);
        } catch (e) { } 

        // 2. Create Logs Table
        await db.runQuery(`
            CREATE TABLE IF NOT EXISTS daily_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                habit_id INTEGER,
                log_date TEXT,
                status TEXT,
                FOREIGN KEY(habit_id) REFERENCES habits(id)
            )
        `);

        // 3. Create Day Notes Table
        await db.runQuery(`
            CREATE TABLE IF NOT EXISTS day_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_date TEXT UNIQUE,
                content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Create User Profile Table
        await db.runQuery(`
            CREATE TABLE IF NOT EXISTS user_profile (
                id INTEGER PRIMARY KEY,
                first_name TEXT,
                last_name TEXT,
                email TEXT,
                bio TEXT,
                avatar_url TEXT
            )
        `);

        // --- NEW: Migration to add avatar_url if you already have the table ---
        try {
            await db.runQuery(`ALTER TABLE user_profile ADD COLUMN avatar_url TEXT`);
        } catch (e) { 
            // This error is normal if the column already exists, just ignore it
        }

        // Initialize Default Profile if empty
        const profile = await db.query('SELECT * FROM user_profile LIMIT 1');

        console.log("Database tables initialized!");
    } catch (err) {
        console.error("Error initializing DB:", err);
    }
};

// Run Init
initDb();


// --- API ROUTES ---

// 1. HABITS
app.get('/api/habits', async (req, res) => {
    try {
        const rows = await db.query('SELECT * FROM habits');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/habits', async (req, res) => {
    const { title, description, icon, color, frequency, time_of_day, end_date } = req.body;
    try {
        const result = await db.runQuery(
            `INSERT INTO habits (title, description, icon, color, frequency, time_of_day, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, description, icon, color, frequency, time_of_day, end_date]
        );
        res.json({ id: result.lastID, message: "Habit created" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/habits/:id', async (req, res) => {
    const { title, description, icon, color, frequency, time_of_day, end_date } = req.body;
    try {
        await db.runQuery(
            `UPDATE habits SET title=?, description=?, icon=?, color=?, frequency=?, time_of_day=?, end_date=? WHERE id=?`,
            [title, description, icon, color, frequency, time_of_day, end_date, req.params.id]
        );
        res.json({ message: "Habit updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/habits/:id', async (req, res) => {
    try {
        await db.runQuery('DELETE FROM habits WHERE id = ?', [req.params.id]);
        await db.runQuery('DELETE FROM daily_logs WHERE habit_id = ?', [req.params.id]); 
        res.json({ message: "Habit deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 2. LOGS
app.get('/api/logs', async (req, res) => {
    try {
        const rows = await db.query('SELECT * FROM daily_logs');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/log', async (req, res) => {
    const { habit_id, date, status } = req.body;
    try {
        const existing = await db.query(
            `SELECT * FROM daily_logs WHERE habit_id = ? AND log_date = ?`,
            [habit_id, date]
        );

        if (existing.length > 0) {
             await db.runQuery(
                `UPDATE daily_logs SET status = ? WHERE habit_id = ? AND log_date = ?`,
                [status, habit_id, date]
            );
        } else {
            await db.runQuery(
                `INSERT INTO daily_logs (habit_id, log_date, status) VALUES (?, ?, ?)`,
                [habit_id, date, status]
            );
        }
        res.json({ message: "Log updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 3. NOTES
app.get('/api/notes', async (req, res) => {
    try {
        const rows = await db.query('SELECT * FROM day_notes');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/note', async (req, res) => {
    const { date, content } = req.body;
    try {
        const existing = await db.query('SELECT * FROM day_notes WHERE note_date = ?', [date]);

        if (existing.length > 0) {
            await db.runQuery('UPDATE day_notes SET content = ? WHERE note_date = ?', [content, date]);
        } else {
            await db.runQuery('INSERT INTO day_notes (note_date, content) VALUES (?, ?)', [date, content]);
        }
        res.json({ message: "Note saved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 4. USER PROFILE (Settings Page)
app.get('/api/profile', async (req, res) => {
    try {
        const rows = await db.query('SELECT * FROM user_profile LIMIT 1');
        res.json(rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/profile', async (req, res) => {
    const { first_name, last_name, email, bio, avatar_url } = req.body; // Added avatar_url
    try {
        await db.runQuery(
            `UPDATE user_profile SET first_name=?, last_name=?, email=?, bio=?, avatar_url=? WHERE id=(SELECT id FROM user_profile LIMIT 1)`,
            [first_name, last_name, email, bio, avatar_url]
        );
        res.json({ message: "Profile updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 5. DATA MANAGEMENT (Export / Import)

// Export Data (Download JSON)
app.get('/api/export', async (req, res) => {
    try {
        const habits = await db.query('SELECT * FROM habits');
        const logs = await db.query('SELECT * FROM daily_logs');
        const notes = await db.query('SELECT * FROM day_notes');
        const profile = await db.query('SELECT * FROM user_profile');
        
        const data = {
            version: 1,
            timestamp: new Date().toISOString(),
            habits,
            logs,
            notes,
            profile: profile[0]
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=habitgrid_backup.json');
        res.send(JSON.stringify(data, null, 2));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Import Data
app.post('/api/import', async (req, res) => {
    const data = req.body;
    
    if (!data.habits || !data.logs) {
        return res.status(400).json({ error: "Invalid backup file" });
    }

    try {
        // 1. Wipe current data
        await db.runQuery('DELETE FROM daily_logs');
        await db.runQuery('DELETE FROM habits');
        await db.runQuery('DELETE FROM day_notes');
        
        // 2. Restore Habits
        for (const h of data.habits) {
            await db.runQuery(
                `INSERT INTO habits (id, title, description, icon, color, frequency, time_of_day, end_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [h.id, h.title, h.description, h.icon, h.color, h.frequency, h.time_of_day, h.end_date, h.created_at]
            );
        }

        // 3. Restore Logs
        for (const l of data.logs) {
             await db.runQuery(
                `INSERT INTO daily_logs (habit_id, log_date, status) VALUES (?, ?, ?)`,
                [l.habit_id, l.log_date, l.status]
            );
        }

        // 4. Restore Notes
        if (data.notes) {
            for (const n of data.notes) {
                await db.runQuery(
                    `INSERT INTO day_notes (note_date, content, created_at) VALUES (?, ?, ?)`,
                    [n.note_date, n.content, n.created_at]
                );
            }
        }
        
        // 5. Restore Profile (Update)
        if (data.profile) {
            const p = data.profile;
            await db.runQuery(
                `UPDATE user_profile SET first_name=?, last_name=?, email=?, bio=?, avatar_url=? WHERE id=(SELECT id FROM user_profile LIMIT 1)`,
                [p.first_name, p.last_name, p.email, p.bio, p.avatar_url]
            );
        }
        
        // Reset sequences to prevent ID collisions
        await db.runQuery(`DELETE FROM sqlite_sequence`);

        res.json({ message: "Import successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Import failed: " + err.message });
    }
});


// 6. DANGER ZONE (Reset Data)
app.delete('/api/reset-data', async (req, res) => {
    try {
        await db.runQuery('DELETE FROM daily_logs');
        await db.runQuery('DELETE FROM habits');
        await db.runQuery('DELETE FROM day_notes');
        
        // Reset ID counters
        await db.runQuery('DELETE FROM sqlite_sequence WHERE name="daily_logs"');
        await db.runQuery('DELETE FROM sqlite_sequence WHERE name="habits"');
        
        res.json({ message: "All data reset" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});