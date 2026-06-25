# HabitGrid

A full-stack habit tracking application with a local-first architecture. Built for users who want complete ownership of their data — no accounts, no cloud, no subscriptions.

Live demo not available (local-first app) · [GitHub](https://github.com/Mian-M-Jahanzaib/habit-grid)

---

## Features

- **Dashboard** — create, edit, delete, and check off daily habits
- **Calendar & Daily Notes** — browse habit history by date and add daily reflections
- **Analytics** — streak tracking, completion rates, and a GitHub-style annual heatmap for long-term consistency visualization
- **Profile & Settings** — avatar upload, bio, light/dark mode toggle
- **Data Portability** — export full database as JSON backup, import anytime, full factory reset option
- **Fully Responsive** — clean experience on desktop and mobile with sliding sidebar

---

## Tech Stack

**Frontend:** React.js · Tailwind CSS · Vite  
**Backend:** Node.js · Express.js  
**Database:** SQLite3 (local)

---

## Running Locally

**Prerequisites:** [Node.js](https://nodejs.org/) installed

**1. Clone the repo**
```bash
git clone https://github.com/Mian-M-Jahanzaib/habit-grid.git
cd habit-grid
```

**2. Start the backend**
```bash
cd server
npm install
node index.js
```
Server runs on `http://localhost:5000` and auto-generates a local SQLite database.

**3. Start the frontend**
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Usage

1. **Settings** — add your name, bio, and profile picture. Toggle dark mode.
2. **Dashboard** — click "Add New Task", set title, color, icon, and timeframe.
3. **Daily logging** — check off tasks each day to build streaks.
4. **Analytics** — view completion rates and your consistency heatmap.
5. **Backup** — export a JSON backup anytime from Settings → Data Management.

---

## Author

**Mian Muhammad Jahanzaib** — Full-Stack Developer  
[Portfolio](https://mian-m-jahanzaib.github.io) · [LinkedIn](https://www.linkedin.com/in/mian-m-jahanzaib) · [Email](mailto:jahanzaibm120@gmail.com)
