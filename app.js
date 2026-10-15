// ── Firebase Setup ────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyA04K4OFv0L1XAZFOicaHKvMo6LSCSASNU",
  authDomain: "todo-tracker-37dd4.firebaseapp.com",
  projectId: "todo-tracker-37dd4",
  storageBucket: "todo-tracker-37dd4.firebasestorage.app",
  messagingSenderId: "692033845978",
  appId: "1:692033845978:web:28b632820ddb1c51c683e3"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const tasksCol = db.collection('tasks');

// ── State ─────────────────────────────────────────────────
let tasks = [];
let activeColumn = 'not-started';

// ── Real-time listener ────────────────────────────────────
let stopListening = null;

function startListening() {
  stopListening = tasksCol.onSnapshot(snapshot => {
    tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    render();
  });
}

// ── Sign in ───────────────────────────────────────────────
async function signIn() {
  const email = document.getElementById('email-input').value.trim();
  const password = document.getElementById('password-input').value;
  const error = document.getElementById('password-error');
  error.textContent = '';
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (e) {
    error.textContent = 'Incorrect email or password. Try again.';
    document.getElementById('password-input').value = '';
    document.getElementById('password-input').focus();
  }
}

function signOut() {
  auth.signOut();
}

document.getElementById('password-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') signIn();
});

auth.onAuthStateChanged(user => {
  const screen = document.getElementById('password-screen');
  if (user) {
    screen.style.display = 'none';
    document.body.style.overflow = '';
    if (!stopListening) startListening();
  } else {
    if (stopListening) { stopListening(); stopListening = null; }
    tasks = [];
    render();
    screen.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
});

// ── Modal ─────────────────────────────────────────────────
let editingTaskId = null;

function openModal(column) {
  editingTaskId = null;
  activeColumn = column;
  document.getElementById('modal-title').textContent = 'Add New Task';
  document.getElementById('modal-submit-btn').textContent = 'Add Task';
  document.getElementById('modal-submit-btn').onclick = addTask;
  document.getElementById('task-input').value = '';
  document.getElementById('task-notes').value = '';
  document.getElementById('modal').classList.add('open');
  setTimeout(() => document.getElementById('task-input').focus(), 50);
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingTaskId = id;
  document.getElementById('modal-title').textContent = 'Edit Task';
  document.getElementById('modal-submit-btn').textContent = 'Save';
  document.getElementById('modal-submit-btn').onclick = saveEdit;
  document.getElementById('task-input').value = task.title;
  document.getElementById('task-notes').value = task.notes || '';
  document.getElementById('modal').classList.add('open');
  setTimeout(() => document.getElementById('task-input').focus(), 50);
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  editingTaskId = null;
}

function closeModalOnOverlay(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && document.getElementById('modal').classList.contains('open')) {
    if (document.activeElement !== document.getElementById('task-notes')) {
      editingTaskId ? saveEdit() : addTask();
    }
  }
});

// ── Add Task ──────────────────────────────────────────────
async function addTask() {
  const title = document.getElementById('task-input').value.trim();
  if (!title) {
    document.getElementById('task-input').focus();
    return;
  }

  const notes = document.getElementById('task-notes').value.trim();
  const id = Date.now().toString();
  const task = {
    id,
    title,
    notes,
    column: activeColumn,
    seeded: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  closeModal();
  await tasksCol.doc(id).set(task);
}

// ── Move Task ─────────────────────────────────────────────
async function moveTask(id, newColumn) {
  const now = new Date().toISOString();
  const update = {
    column: newColumn,
    seeded: false,
    completedAt: newColumn === 'done' ? now : null,
  };
  if (newColumn !== 'done') {
    update.createdAt = now;
  }
  await tasksCol.doc(id).update(update);
}

// ── Save Edit ─────────────────────────────────────────────
async function saveEdit() {
  const title = document.getElementById('task-input').value.trim();
  if (!title || !editingTaskId) return;
  const notes = document.getElementById('task-notes').value.trim();
  const id = editingTaskId;
  closeModal();
  await tasksCol.doc(id).update({ title, notes });
}

// ── Delete Task (with undo) ───────────────────────────────
let undoTimer = null;
let pendingDelete = null;

async function deleteTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  if (undoTimer) {
    clearTimeout(undoTimer);
    undoTimer = null;
  }

  pendingDelete = task;

  // Delete from Firebase immediately so refresh doesn't bring it back
  await tasksCol.doc(id).delete();
  showUndoToast(task.title);

  // After 5 seconds, close the undo window
  undoTimer = setTimeout(() => {
    pendingDelete = null;
    undoTimer = null;
    hideUndoToast();
  }, 5000);
}

async function undoDelete() {
  if (!pendingDelete) return;
  clearTimeout(undoTimer);
  await tasksCol.doc(pendingDelete.id).set(pendingDelete);
  pendingDelete = null;
  undoTimer = null;
  hideUndoToast();
}

function showUndoToast(title) {
  const toast = document.getElementById('undo-toast');
  document.getElementById('undo-toast-msg').textContent = `"${title.length > 30 ? title.slice(0, 30) + '…' : title}" deleted`;
  toast.classList.add('show');
  setTimeout(hideUndoToast, 5000);
}

function hideUndoToast() {
  document.getElementById('undo-toast').classList.remove('show');
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
  actions.push(`<button class="btn-edit" onclick="openEditModal('${task.id}')" title="Edit task">✎</button>`);
  actions.push(`<button class="btn-delete" onclick="deleteTask('${task.id}')" title="Delete task">✕</button>`);

  const notesHTML = task.notes
    ? `<div class="task-notes">${escapeHTML(task.notes)}</div>`
    : '';

  const timestampHTML = task.completedAt && !task.seeded
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

// ── Escape HTML ───────────────────────────────────────────
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

    if (col === 'done') {
      colTasks.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    } else if (col === 'not-started' || col === 'in-progress' || col === 'wont-do') {
      colTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

