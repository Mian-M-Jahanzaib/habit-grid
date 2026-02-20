# 🚀 HabitGrid

HabitGrid is a full-stack, responsive habit-tracking application designed to help users build and maintain consistent routines. It features a beautiful, dark-mode-ready UI, deep analytics with GitHub-style heatmaps, and complete local data management.

## 🎯 The Productivity Catalyst for Developers

**Built for those who work at their desks.** Because HabitGrid is a local-first web application, it naturally builds productivity into your daily routine. For coders, designers, and computer professionals, the hardest part of the day is often simply *starting*. 

By tying your daily habit logging to your PC or laptop, HabitGrid gives you a mandatory reason to boot up your machine every day. Once the laptop is open and your habits are logged, you are already in your workspace—drastically reducing the friction to open your editor, focus, and start coding.

## ✨ Features

* **Interactive Dashboard:** Easily create, edit, delete, and check off daily habits.
* **Calendar & Daily Notes:** View your habit history on a calendar and jot down daily reflections.
* **Deep Analytics:** Track your current streak, best streak, and completion rates. Features a GitHub-style annual consistency heatmap to visualize your effort over time.
* **Personalized Settings:** Customize your profile with an avatar upload, update your bio, and toggle between **Light and Dark Mode**.
* **Complete Data Ownership:** Export your entire database as a JSON backup and import it anytime. Includes a "Danger Zone" for a complete factory reset.
* **Fully Responsive:** A seamless experience on both desktop and mobile, featuring a clean hamburger menu and sliding sidebar.

## 🛠️ Tech Stack

**Frontend:**
* React.js
* Tailwind CSS
* Vite

**Backend:**
* Node.js
* Express.js
* SQLite3 (Local database)

---

## 💻 How to Run This Project Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Clone the Repository

```bash
git clone [https://github.com/mianjahanzaib/habit-grid.git](https://github.com/mianjahanzaib/habit-grid.git)
cd habit-grid
2. Set Up the Backend (Server)
Open a terminal window and navigate to the server folder:

Bash
cd server
npm install
node index.js
The server runs on http://localhost:5000 and automatically generates a local SQLite database (database.sqlite).

3. Set Up the Frontend (Client)
Open a new, separate terminal window and navigate to the client folder:

Bash
cd client
npm install
npm run dev
Vite will start the frontend. Open the local link (usually http://localhost:5173) in your browser.

💡 Usage Guide
Profile Setup: Head to the Settings page to add your name, bio, and upload a profile picture. Toggle Dark Mode if you prefer.

Add Tasks: Go to the Dashboard and click "Add New Task". Set a title, color, icon, and timeframe.

Log Habits: Check off tasks daily to build your streak.

Review Analytics: Check the Analytics tab to see your success distribution and populate your consistency heatmap.

Backup: Periodically visit Settings -> Data Management to export a backup of your progress.

👨‍💻 Author
Built by Mian Muhammad Jahanzaib