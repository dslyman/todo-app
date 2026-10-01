// ---------- Grab elements from the page ----------
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const counter = document.getElementById("task-counter");
const emptyMessage = document.getElementById("empty-message");
const clearBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

// ---------- App state ----------
const STORAGE_KEY = "todo-tasks";
let tasks = loadTasks();     // array of { id, text, completed }
let currentFilter = "all";   // "all" | "active" | "completed"

// ---------- Saving and loading (localStorage) ----------
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return []; // storage unavailable or data corrupted
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn("Could not save tasks:", error);
  }
}

// ---------- Task actions ----------
function addTask(text) {
  tasks.push({
    id: Date.now(),   // simple unique id
    text: text,
    completed: false
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find(function (t) { return t.id === id; });
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

function deleteTask(id, itemElement) {
  // Play the fade-out animation first, then remove the task
  itemElement.classList.add("removing");
  setTimeout(function () {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    saveTasks();
    render();
  }, 200);
}

function clearCompleted() {
  tasks = tasks.filter(function (t) { return !t.completed; });
  saveTasks();
  render();
}

// ---------- Drawing the page ----------
function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter(function (t) { return !t.completed; });
  }
  if (currentFilter === "completed") {
    return tasks.filter(function (t) { return t.completed; });
  }
  return tasks;
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "task-item" + (task.completed ? " completed" : "");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-check";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", "Mark \"" + task.text + "\" as completed");
  checkbox.addEventListener("change", function () {
    toggleTask(task.id);
  });

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text; // textContent keeps user input safe

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.innerHTML = "&times;";
  deleteBtn.setAttribute("aria-label", "Delete \"" + task.text + "\"");
  deleteBtn.addEventListener("click", function () {
    deleteTask(task.id, item);
  });

  item.append(checkbox, text, deleteBtn);
  return item;
}

function render() {
  // 1. Rebuild the list
  list.innerHTML = "";
  const visible = getVisibleTasks();
  visible.forEach(function (task) {
    list.appendChild(createTaskElement(task));
  });

  // 2. Empty-state message
  if (visible.length === 0) {
    const messages = {
      all: "No tasks yet. Add your first one above.",
      active: "Nothing left to do. Nice work!",
      completed: "No completed tasks yet."
    };
    emptyMessage.textContent = messages[currentFilter];
    emptyMessage.hidden = false;
  } else {
    emptyMessage.hidden = true;
  }

  // 3. Counter (counts tasks that are not completed)
  const remaining = tasks.filter(function (t) { return !t.completed; }).length;
  counter.textContent = remaining + (remaining === 1 ? " task left" : " tasks left");

  // 4. Only show "Clear completed" when there is something to clear
  const hasCompleted = tasks.some(function (t) { return t.completed; });
  clearBtn.hidden = !hasCompleted;
}

// ---------- Event listeners ----------
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading
  const text = input.value.trim();
  if (text === "") return;
  addTask(text);
  input.value = "";
  input.focus();
});

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(function (b) {
      b.classList.toggle("active", b === button);
    });
    render();
  });
});

clearBtn.addEventListener("click", clearCompleted);

// ---------- Start the app ----------
render();
