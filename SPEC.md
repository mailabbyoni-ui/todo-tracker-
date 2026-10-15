# Todo Tracker — Project Spec

## Overview
A personal task management web app built to replace a manual notes-based system. The app provides a kanban-style board to organise tasks across four stages, with real-time sync across all devices.

---

## Problem Statement
Previously managed tasks in iOS Notes using four manual columns: Not Started, In Progress, Done, and Won't Do. Key pain points:
- The Done list grew too long, requiring excessive scrolling to add new items
- No timestamps to record when tasks were completed
- No sync across devices

---

## Features

### Task Management
- Add tasks with a title and optional notes
- Move tasks between any of the four columns
- Delete tasks with a 5-second undo window — deleted immediately from database, restored if undone
- Task counts displayed per column

### Columns
| Column | Behaviour |
|---|---|
| Not Started | Newest tasks appear at top |
| In Progress | Newest tasks appear at top |
| Done | Most recently completed task always at top, with timestamp |
| Won't Do | Newest tasks appear at top |

### Timestamps
- Tasks manually moved to Done show a green ✓ with the exact date and time completed
- Pre-loaded historical tasks do not show timestamps

### Sync & Storage
- Tasks stored in Firebase Firestore
- No automatic seeding — the app never writes tasks on its own
- Real-time sync across all devices — changes appear instantly on phone and computer

### Security
- Firebase Authentication (email/password) — stays signed in on each device, with a Sign out button
- Sign-up disabled in Firebase; only the owner's account exists
- Firestore rules only allow the owner's account to read or write tasks
- Firebase API key restricted to GitHub Pages domain only

### Mobile Experience
- Horizontal swipe between columns (Trello-style)
- Columns snap into place when swiping
- All columns maintain equal width on mobile
- Fully responsive — works on desktop, tablet, and phone

### Branding
- Poppins font for the header
- ✅ favicon shown in browser tab

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Database | Firebase Firestore |
| Hosting | GitHub Pages |
| Fonts | Google Fonts (Poppins) |
| Version Control | Git / GitHub |

---

## Hosting
- **Live URL:** https://mailabbyoni-ui.github.io/todo-tracker-/
- **GitHub Repo:** https://github.com/mailabbyoni-ui/todo-tracker-
- **Firebase Project:** todo-tracker-37dd4

---

## Future Ideas
- Edit existing task titles and notes
- Due dates and reminders
- Search and filter tasks
- Archive old done tasks
- Dark mode
