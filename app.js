// ── Storage ──────────────────────────────────────────────
const STORAGE_KEY = 'todo-tracker-tasks';

const SEED_TASKS = [
  "Flights to Halifax",
  "Call Dapo",
  "Call Prince",
  "Order iPhone 🎁",
  "Feb 2026",
  "BACS - wrap up deck",
  "Yetlaw - AI workflow",
  "Jan 2026",
  "Plus 44",
  "Message influencers",
  "UK VISA",
  "Pay brace",
  "reach out to stockist Alara",
  "reach out to stockist Gather House",
  "Find designer for December packaging",
  "MQL5 refund",
  "Temidayos ticket",
  "Renaitre <> 1 month email",
  "Renaitre <> Ash luxe",
  "Pay Kush legal",
  "BACS JD",
  "Post you reel",
  "Send post purchase email",
  "BELL: BJMVQLHD",
  "British airways tier points",
  "Freedom",
  "Book Europe storage",
  "Photos moodboard milan shoot - hair/dress",
  "Europe Trip Shopping",
  "Temidayo US visa",
  "40872539",
  "40133348 40192037 40437947",
  "Enercare - Dispute",
  "Onitsuka order",
  "Portable fan, power bank",
  "Call biodesign for scoliosis brace",
  "Call Dr Khan: Scoliosis",
  "Order diffusers- rituals",
  "Schedule wax",
  "Schedule next dinner",
  "Facial",
  "Pay Baba 70 birthday",
  "Buy skincare",
  "Book Europe flights (2/3)",
  "BACS - Application II",
  "BACS - Application I",
  "Reply Renaitre Aisha Ife",
  "Europe travel plan",
  "Dero contribution - Gofundme",
  "Claim VIA rail (Thu)",
  "Buy VIA rail - PCNA event",
  "Claim 39$ insurance",
  "Buy French braids attachment",
  "Call Kush lawyer",
  "Buy supplements",
  "Meetup refund",
  "Maniere refund",
  "Coronation - MTN",
  "Modern Data Course - Part I",
  "BACS - Action Review",
  "Natural girl wigs purchase",
  "Book Italy Flight - BA",
  "Close out taxes",
  "BA - Flight change",
  "Yetlaw - Debt tracker",
  "BACS-GYM YEF application",
  "CIBC - Dispute",
  "Call Lawyer - Kush Gupta",
  "Enbridge resolution",
  "Canada post tracking pg721219983ca",
  "Bell bill review",
  "Enercare - ref no 4440506 - escalated, contract reviewed, contact.web@enercare.ca, movesenercare@enercare.ca 77 Diana Unit 113 spoke to team member JC.",
  "Italy Visa",
  "commonsku 250$",
  "Write Ami on calendar",
  "Get blood referral from Bonavista & also Neurosurgeon",
  "Pay Erin Lever - Renaitre",
  "Ese California ticket",
  "Enercare - 39713863, 18669077260",
  "Questrade Trade - Feb 4",
  "Send schedule to Elite Physio",
  "WigMasters/ EMBA - Reply",
  "Call BELL",
  "Haworth Mcgowan 94 Copernicus Blvd, Brantford, ON N3P 1K5",
  "Scoliosis reduction centre booked",
  "Jeffsatwork-Chair",
  "Lagos spend",
  "Chubby: Google my business - update address",
  "Chubby centre - bulk sms we've moved",
  "Physio - Avenue booked",
  "Physio - kneaded care - booked",
  "Physio - bounce - booked",
  "Pay Jibola",
  "Claim - Horace massage",
  "Yemi's dad plans w Jibola",
  "CAD to USD - Tuesday",
  "Oyinda Canada application",
  "Sciart statement",
  "Christmas gift for the girls",
  "October accounts",
  "Seike Zara skort",
  "Pay Forazaria purchase",
  "BACS Grant application",
  "***House hunt application(s)",
  "Pension admin",
  "Pay Seamstress Lagos",
  "Pay Kelechi BACS",
  "Pay FLEXITI",
  "Pay car insurance",
  "Sephora return",
  "Post Deolas drug",
  "Change USD back to CAD",
  "Feranmi pocket money",
  "Data Gbolahan",
  "Nyosi follow up",
  "Done",
].map((title, i, arr) => ({
  id: (1700000000000 + (arr.length - i) * 1000).toString(),
  title,
  notes: '',
  column: 'done',
  createdAt: new Date(1700000000000 + (arr.length - i) * 1000).toISOString(),
  completedAt: new Date(1700000000000 + (arr.length - i) * 1000).toISOString(),
}));

function loadTasks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && stored.length > 0) return stored;
    // First load: seed with existing done tasks
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TASKS));
    return SEED_TASKS;
  } catch {
    return SEED_TASKS;
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ── State ─────────────────────────────────────────────────
let tasks = loadTasks();
let activeColumn = 'not-started';

// ── Modal ─────────────────────────────────────────────────
function openModal(column) {
  activeColumn = column;
  document.getElementById('modal').classList.add('open');
  document.getElementById('task-input').value = '';
  document.getElementById('task-notes').value = '';
  setTimeout(() => document.getElementById('task-input').focus(), 50);
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function closeModalOnOverlay(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && document.getElementById('modal').classList.contains('open')) {
    if (document.activeElement !== document.getElementById('task-notes')) {
      addTask();
    }
  }
});

// ── Add Task ──────────────────────────────────────────────
function addTask() {
  const title = document.getElementById('task-input').value.trim();
  if (!title) {
    document.getElementById('task-input').focus();
    return;
  }

  const notes = document.getElementById('task-notes').value.trim();
  const task = {
    id: Date.now().toString(),
    title,
    notes,
    column: activeColumn,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  tasks.push(task);
  saveTasks();
  closeModal();
  render();
}

// ── Move Task ─────────────────────────────────────────────
function moveTask(id, newColumn) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.column = newColumn;

  if (newColumn === 'done') {
    task.completedAt = new Date().toISOString();
  } else {
    task.completedAt = null;
  }

  saveTasks();
  render();
}

// ── Delete Task ───────────────────────────────────────────
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

// ── Format Date ───────────────────────────────────────────
function formatDate(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (d.toDateString() === now.toDateString()) {
    return `Today at ${timeStr}`;
  } else if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${timeStr}`;
  } else {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ` at ${timeStr}`;
  }
}

// ── Build Task Card HTML ──────────────────────────────────
function buildTaskCard(task) {
  const col = task.column;

  // Action buttons depending on which column the task is in
  const actions = [];

  if (col !== 'not-started') {
    actions.push(`<button class="btn-move-not-started" onclick="moveTask('${task.id}', 'not-started')">Not Started</button>`);
  }
  if (col !== 'in-progress') {
    actions.push(`<button class="btn-move-progress" onclick="moveTask('${task.id}', 'in-progress')">In Progress</button>`);
  }
  if (col !== 'done') {
    actions.push(`<button class="btn-move-done" onclick="moveTask('${task.id}', 'done')">Done</button>`);
  }
  if (col !== 'wont-do') {
    actions.push(`<button class="btn-move-wont-do" onclick="moveTask('${task.id}', 'wont-do')">Won't Do</button>`);
  }
  actions.push(`<button class="btn-delete" onclick="deleteTask('${task.id}')" title="Delete task">✕</button>`);

  const notesHTML = task.notes
    ? `<div class="task-notes">${escapeHTML(task.notes)}</div>`
    : '';

  const timestampHTML = task.completedAt
    ? `<div class="task-timestamp">Completed ${formatDate(task.completedAt)}</div>`
    : '';

  return `
    <li class="task-card" data-id="${task.id}">
      <div class="task-title">${escapeHTML(task.title)}</div>
      ${notesHTML}
      ${timestampHTML}
      <div class="task-actions">${actions.join('')}</div>
    </li>
  `;
}

// ── Escape HTML to prevent XSS ────────────────────────────
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Render ────────────────────────────────────────────────
function render() {
  const columns = ['not-started', 'in-progress', 'done', 'wont-do'];

  columns.forEach(col => {
    let colTasks = tasks.filter(t => t.column === col);

    // Done column: newest completed at top
    if (col === 'done') {
      colTasks.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    }

    const list = document.getElementById(`list-${col}`);
    const count = document.getElementById(`count-${col}`);

    if (colTasks.length === 0) {
      list.innerHTML = '<li class="empty-state">No tasks here</li>';
    } else {
      list.innerHTML = colTasks.map(buildTaskCard).join('');
    }

    count.textContent = colTasks.length;
  });
}

// ── Init ──────────────────────────────────────────────────
render();
