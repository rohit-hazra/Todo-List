document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('newTaskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const emptyMessage = document.getElementById('emptyMessage');
    const tabs = document.querySelectorAll('.tab');
    const activeTabTitle = document.getElementById('activeTabTitle');
    const currentDateElement = document.getElementById('currentDate');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function updateLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateCurrentDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        const dateString = now.toLocaleDateString('en-US', options);

        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // 24-hour to 12-hour format

        const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
        currentDateElement.textContent = `${dateString} | ${timeString}`;
    }

    setInterval(updateCurrentDateTime, 1000);
    updateCurrentDateTime();

    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';
        let filteredTasks = tasks;
        if (filter === 'pending') {
            filteredTasks = tasks.filter(t => !t.completed);
        }
        if (filter === 'completed') {
            filteredTasks = tasks.filter(t => t.completed);
        }

        if (filteredTasks.length === 0) {
            emptyMessage.classList.remove('hidden');
        } else {
            emptyMessage.classList.add('hidden');
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = 'task-item';
                li.dataset.id = task.id;
                li.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <div class="task-content">
                        <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                        <span class="task-date">Added: ${new Date(task.createdAt).toLocaleString()}</span>
                    </div>
                    <div class="task-actions">
                        <button class="edit-btn" title="Edit">🖊️</button>
                        <button class="delete-btn" title="Delete">❌</button>
                    </div>
                `;
                taskList.appendChild(li);
            });
        }
    }

    function addTask() {
        const text = newTaskInput.value.trim();
        if (!text) return;
        tasks.push({
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date()
        });
        newTaskInput.value = '';
        updateLocalStorage();
        renderTasks(document.querySelector('.tab.active').dataset.tab);
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        updateLocalStorage();
        renderTasks(document.querySelector('.tab.active').dataset.tab);
    }

    function toggleTask(id) {
        tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        updateLocalStorage();
        renderTasks(document.querySelector('.tab.active').dataset.tab);
    }

    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        const li = taskList.querySelector(`[data-id="${id}"]`);
        const span = li.querySelector('.task-text');

        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.text;
        input.className = 'edit-task';

        span.replaceWith(input);
        input.focus();

        input.addEventListener('blur', () => {
            task.text = input.value.trim() || task.text;
            updateLocalStorage();
            renderTasks(document.querySelector('.tab.active').dataset.tab);
        });

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    }

    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keydown', e => {
        e.key === 'Enter' && addTask()
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            activeTabTitle.textContent = this.textContent;
            renderTasks(this.dataset.tab);
        });
    });

    taskList.addEventListener('click', e => {
        const li = e.target.closest('.task-item');
        if (!li) {
            return;
        }
        const id = parseInt(li.dataset.id);

        if (e.target.classList.contains('task-checkbox')) {
            toggleTask(id);
        }
        if (e.target.classList.contains('delete-btn')) {
            deleteTask(id);
        }
        if (e.target.classList.contains('edit-btn')) {
            editTask(id);
        }
    });

    renderTasks('all');
});
