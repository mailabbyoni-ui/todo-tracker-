// ── Storage ──────────────────────────────────────────────
const STORAGE_KEY = 'todo-tracker-tasks';

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
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
