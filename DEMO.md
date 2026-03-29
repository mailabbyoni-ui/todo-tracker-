# All Hands Demo: Building a Personal Tool with Claude Code
**Presenter:** Abisola
**Format:** Live demo + walkthrough (~10–15 min)

---

## 1. The Problem (2 min)

> "This started with a personal frustration."

I managed my entire task list in iOS Notes. I had a system — four sections I'd manually maintain:
- **Not Started**
- **In Progress**
- **Done**
- **Won't Do**

It worked. But it had real pain points:

- The **Done list kept growing** — I'd have to scroll past 80+ completed tasks just to add a new one
- **No timestamps** — I could never remember when I finished something
- **No cross-device sync** — if I added a task on my laptop, it wasn't on my phone

I knew exactly what I wanted. I just didn't want to spend weeks building it — or pay £10/month for a tool that does 90% more than I need.

---

## 2. The Solution: Use Claude Code (2 min)

> "So I decided to build it myself — with Claude Code as my co-developer."

**What is Claude Code?**
It's Anthropic's AI coding assistant that runs in your terminal. You describe what you want in plain English, and it reads your files, writes code, and iterates with you in real time. It's not just autocomplete — it understands your whole project.

**My approach:**
- I described the problem and the features I wanted
- Claude Code scaffolded the initial app
- I tested it, found issues, described them — Claude fixed them
- Repeat

No tutorial. No boilerplate hunting. Just conversation → working code.

---

## 3. The Initial Build (2 min)

> *[Open the app in browser — show the board]*

The first working version came from a single prompt describing the kanban layout.

**What was in that first commit:**
- 4-column kanban board (Not Started, In Progress, Done, Won't Do)
- Add tasks with a title and optional notes
- Move tasks between columns
- Data saved in the browser's localStorage
- Clean, responsive UI

That was the foundation. But using it immediately revealed things I hadn't thought about.

---

## 4. The Iterations — Where It Gets Interesting (5 min)

This is the part I want to focus on. **Real product development is iteration.** Here's what happened after that first version:

---

### Problem 1: My historical tasks weren't in the app
**Commit:** `Add existing done tasks as seed data`

I had ~80 completed tasks in Notes that I wanted to carry over. Rather than manually re-entering them, I described the list to Claude Code and asked it to seed the database. It wrote the entire seeding function.

But then — the order was wrong. Done tasks appeared in the wrong sequence.
**Fix:** `Fix done list order to match original task order`

And seeded tasks were showing timestamps they shouldn't have.
**Fix:** `Hide timestamps on seeded done items`

**Lesson:** Migrating data is never as simple as it looks. Each edge case is a new prompt.

---

### Problem 2: It only worked on one device
**Commit:** `Switch from localStorage to Firebase Firestore`

localStorage is tied to one browser on one device. I wanted to open the app on my phone and see the same tasks as my laptop — in real time.

I asked Claude Code to migrate from localStorage to Firebase Firestore. It:
- Set up the Firebase config
- Rewrote all read/write operations
- Added a real-time listener so changes sync instantly across devices

> *[Demo: show the live URL, explain it works on phone too]*

**Lesson:** Claude Code can handle architectural changes, not just small fixes.

---

### Problem 3: Anyone with the URL could see my tasks
**Commit:** `Add password protection`

The app was hosted publicly on GitHub Pages. I needed basic access control without building a full auth system.

Claude Code added a password screen that:
- Blocks access until the correct PIN is entered
- Stores the session so you're not re-prompted every page load
- Clears on browser close

**Lesson:** "Good enough" security for personal tools is a valid design decision. I didn't need OAuth — I needed a PIN.

---

### Problem 4: I kept accidentally deleting tasks
**Commit:** `Add undo delete feature with 5-second toast`

> *[Demo: delete a task, show the undo toast]*

Deleting was instant and permanent. I did it by mistake more than once.

The fix: delete immediately from the database (so a refresh doesn't bring it back), but show an **Undo** button for 5 seconds. If you click Undo, it re-adds the task.

**Lesson:** This is a pattern used by Gmail, Notion, Linear. You don't need a confirmation dialog if you have a good undo.

---

### Problem 5: A deleted task would reappear on refresh
**Commit:** `Fix deleted tasks reappearing on refresh`

This was a subtle bug. The undo feature kept a local copy of the deleted task in memory. If you refreshed the page before the 5-second window closed, the app re-seeded from memory and the task came back.

I described exactly what was happening to Claude Code. It traced the bug to the seeding logic running on every page load, and fixed it by checking whether a task had already been deleted before re-adding it.

**Lesson:** Describing a bug clearly — what you did, what you expected, what happened — is a skill. The clearer your prompt, the faster the fix.

---

### Problem 6: It didn't work well on mobile
**Commits:** `Add horizontal swipe kanban view for mobile` → `Fix Done column width on mobile` (x2)

> *[If on mobile or DevTools: show the swipe between columns]*

Four columns side-by-side don't fit on a phone. I asked for a Trello-style horizontal swipe, where each column fills the screen and you swipe to the next.

Claude Code implemented it — but the Done column was wider than the others because of the longer button labels. Two follow-up fixes to constrain the card and button widths.

**Lesson:** Mobile is always a second pass. Expect it.

---

### Problem 7: I wanted to fix typos in tasks
**Commit:** `Add edit task title and notes feature`

> *[Demo: click the edit button on a task, change it, save]*

The initial version had no way to edit a task once added. I described what I wanted — click a pencil icon, open the same modal pre-filled with the task data, save back to Firebase.

Claude Code added the full edit flow, reusing the existing modal component.

**Lesson:** When you build on a solid foundation, adding features is fast. The modal was already there — it just needed to serve double duty.

---

## 5. Design Decisions Worth Noting (1 min)

A few intentional choices that made the app better:

| Decision | Why |
|---|---|
| Vanilla HTML/CSS/JS — no framework | Zero build step, zero dependencies, loads instantly |
| Firebase Firestore | Real-time sync out of the box, free tier is plenty |
| GitHub Pages hosting | Free, automatic deploys on push |
| No login system | It's a personal tool — a PIN is enough |
| Timestamps only on manually completed tasks | Seeded historical data would show wrong dates |
| Done column sorts by completion time | Most recent task always at the top — mimics how you naturally use it |

---

## 6. What I Learned About Building with Claude Code (1 min)

1. **Describe the problem, not the solution.** "When I delete a task and refresh, it comes back" gets better results than "fix the seeding function."

2. **Iterate fast.** Each fix was a new prompt. The feedback loop was minutes, not days.

3. **You still need to think.** Claude Code writes the code — but you decide what to build, what trade-offs to accept, and when something is good enough.

4. **Document as you go.** I kept a SPEC.md file updated throughout. Claude Code helped write that too.

5. **Git is your safety net.** Every working version was committed. When something broke, I could always go back.

---

## 7. Live Demo Checklist

- [ ] Show the board with all 4 columns
- [ ] Add a new task to Not Started
- [ ] Move it to In Progress, then Done (show timestamp appear)
- [ ] Delete a task — show undo toast — undo it
- [ ] Edit a task title
- [ ] Show mobile view (DevTools or phone)
- [ ] Show the live URL (GitHub Pages)

---

## 8. The Takeaway

> "I had a problem. I knew what I wanted. I used Claude Code to build it in a weekend — and kept improving it through conversation."

This isn't about replacing engineers. It's about **moving faster on the things you already know how to think about.** The product thinking, the UX decisions, the trade-offs — that was all me. Claude Code handled the syntax.

**The app is live. I use it every day.**

---

*Live URL: https://mailabbyoni-ui.github.io/todo-tracker-/*
*Stack: HTML · CSS · Vanilla JS · Firebase Firestore · GitHub Pages*
