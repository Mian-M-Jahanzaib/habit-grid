const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize Database Tables
const initDb = async () => {
    try {
        await db.runQuery(`
            CREATE TABLE IF NOT EXISTS habits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                icon TEXT DEFAULT 'check_circle',
                color TEXT DEFAULT 'blue-500',
                frequency TEXT DEFAULT 'daily',
                time_of_day TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

    await db.runQuery(`
    CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT DEFAULT 'check_circle',
        color TEXT DEFAULT 'blue-500',
        frequency TEXT DEFAULT 'daily',
        time_of_day TEXT,
        end_date TEXT,  -- <--- NEW COLUMN
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// --- MIGRATION: Add end_date to existing tables if missing ---
try {
    await db.runQuery(`ALTER TABLE habits ADD COLUMN end_date TEXT`);
} catch (e) {
    // Ignore error if column already exists
}
        // 3. Create Day Notes Table (New!)
await db.runQuery(`
    CREATE TABLE IF NOT EXISTS day_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_date TEXT UNIQUE,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);
        console.log("Database tables initialized!");
    } catch (err) {
        console.error("Error initializing DB:", err);
    }
};

initDb();

// --- API ROUTES ---

// 1. Get all habits
app.get('/api/habits', async (req, res) => {
    try {
        const rows = await db.query('SELECT * FROM habits');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create a new habit (THIS WAS MISSING!)
app.post('/api/habits', async (req, res) => {
    const { title, description, icon, color, frequency, time_of_day, end_date } = req.body; // <--- Add end_date
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

// 3. Get daily logs
app.get('/api/logs', async (req, res) => {
    try {
        const rows = await db.query('SELECT * FROM daily_logs');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Toggle/Log a habit (Check/Uncheck)
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

// DANGER: Reset all data
app.delete('/api/reset', async (req, res) => {
    try {
        await db.runQuery('DELETE FROM daily_logs');
        await db.runQuery('DELETE FROM habits');
        // Reset ID counters
        await db.runQuery('DELETE FROM sqlite_sequence WHERE name="daily_logs"');
        await db.runQuery('DELETE FROM sqlite_sequence WHERE name="habits"');
        res.json({ message: "All data reset" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Update a habit
app.put('/api/habits/:id', async (req, res) => {
    const { title, description, icon, color, frequency, time_of_day, end_date } = req.body; // <--- Add end_date
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

// 6. Delete a habit
app.delete('/api/habits/:id', async (req, res) => {
    try {
        await db.runQuery('DELETE FROM habits WHERE id = ?', [req.params.id]);
        res.json({ message: "Habit deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- NEW NOTES ROUTES ---

// Get all day notes
app.get('/api/notes', async (req, res) => {
    try {
        const rows = await db.query('SELECT * FROM day_notes');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save or Update a note
app.post('/api/note', async (req, res) => {
    const { date, content } = req.body;
    try {
        // Check if note exists for this date
        const existing = await db.query('SELECT * FROM day_notes WHERE note_date = ?', [date]);

        if (existing.length > 0) {
            // Update
            await db.runQuery('UPDATE day_notes SET content = ? WHERE note_date = ?', [content, date]);
        } else {
            // Insert
            await db.runQuery('INSERT INTO day_notes (note_date, content) VALUES (?, ?)', [date, content]);
        }
        res.json({ message: "Note saved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});