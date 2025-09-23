// HabitForge - Habit Tracker Script

// DOM elements
const habitInput = document.getElementById('habit-input');
const addBtn = document.getElementById('add-btn');
const habitsContainer = document.getElementById('habits-container');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const currentMonthYearSpan = document.getElementById('current-month-year');
const hamburgerBtn = document.getElementById('hamburger-btn');
const themeMenu = document.getElementById('theme-menu');
const themeOptions = document.querySelectorAll('.theme-option');
const accentPicker = document.getElementById('accent-picker');

// Global variables
let habits = [];
let habitIdCounter = 0;
let displayedMonth;
let displayedYear;

// Load habits from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    displayedMonth = now.getMonth();
    displayedYear = now.getFullYear();
    updateMonthDisplay();
    loadHabits();
    loadTheme();
});

// Event listeners
addBtn.addEventListener('click', addHabit);
habitInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addHabit();
});
prevMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(1));
hamburgerBtn.addEventListener('click', toggleThemeMenu);
themeOptions.forEach(option => {
    option.addEventListener('click', (e) => changeTheme(e.target.dataset.theme));
});
accentPicker.addEventListener('input', (e) => changeAccent(e.target.value));

// Load habits from localStorage
function loadHabits() {
    const storedHabits = localStorage.getItem('habitForge_habits');
    if (storedHabits) {
        habits = JSON.parse(storedHabits);
        habitIdCounter = habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 0;
        renderHabits();
    }
}

// Save habits to localStorage
function saveHabits() {
    localStorage.setItem('habitForge_habits', JSON.stringify(habits));
}

// Add a new habit
function addHabit() {
    const habitName = habitInput.value.trim();
    if (habitName === '') return;

    const newHabit = {
        id: habitIdCounter++,
        name: habitName,
        completions: {}
    };

    habits.push(newHabit);
    habitInput.value = '';
    saveHabits();
    renderHabits();
}

// Delete a habit
function deleteHabit(habitId) {
    habits = habits.filter(habit => habit.id !== habitId);
    saveHabits();
    renderHabits();
}

// Change month
function changeMonth(delta) {
    displayedMonth += delta;
    if (displayedMonth < 0) {
        displayedMonth = 11;
        displayedYear--;
    } else if (displayedMonth > 11) {
        displayedMonth = 0;
        displayedYear++;
    }
    updateMonthDisplay();
    renderHabits();
}

// Update month display
function updateMonthDisplay() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthYearSpan.textContent = `${monthNames[displayedMonth]} ${displayedYear}`;
}

// Complete today
function completeToday(habitId) {
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        habit.completions[date] = true;
        saveHabits();

        // Update the UI
        const habitDiv = document.querySelector(`.habit[data-habit-id="${habitId}"]`);
        if (habitDiv) {
            const dayDiv = habitDiv.querySelector(`.day[data-date="${date}"]`);
            if (dayDiv) {
                dayDiv.classList.add('completed');
                dayDiv.textContent = '';
            }

            // Update progress if the displayed month is current
            if (displayedMonth === today.getMonth() && displayedYear === today.getFullYear()) {
                const progressDiv = habitDiv.querySelector('.progress-report');
                if (progressDiv) {
                    const newProgress = createProgressReport(habit);
                    progressDiv.replaceWith(newProgress);
                }
            }
        }
    }
}

// Toggle theme menu
function toggleThemeMenu() {
    themeMenu.classList.toggle('hidden');
}

// Change theme
function changeTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('habitForge_theme', theme);
    themeMenu.classList.add('hidden');
    // Apply saved accent
    const savedAccent = localStorage.getItem('habitForge_accent') || getDefaultAccent(theme);
    changeAccent(savedAccent);
}

// Change accent
function changeAccent(color) {
    document.documentElement.style.setProperty('--accent-color', color);
    localStorage.setItem('habitForge_accent', color);
    accentPicker.value = color;
}

// Get default accent for theme
function getDefaultAccent(theme) {
    const defaults = {
        dark: '#4caf50',
        light: '#2196f3',
        mid: '#ff9800'
    };
    return defaults[theme] || '#4caf50';
}

// Load theme
function loadTheme() {
    const savedTheme = localStorage.getItem('habitForge_theme') || 'dark';
    const savedAccent = localStorage.getItem('habitForge_accent') || getDefaultAccent(savedTheme);
    document.body.className = `theme-${savedTheme}`;
    changeAccent(savedAccent);
}

// Toggle completion for a specific day
function toggleCompletion(habitId, date) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    habit.completions[date] = !habit.completions[date];
    saveHabits();

    // Update the UI directly without re-rendering
    const habitDiv = document.querySelector(`.habit[data-habit-id="${habitId}"]`);
    if (habitDiv) {
        const dayDiv = habitDiv.querySelector(`.day[data-date="${date}"]`);
        if (dayDiv) {
            const isCompleted = habit.completions[date];
            dayDiv.classList.toggle('completed', isCompleted);
            if (isCompleted) {
                dayDiv.textContent = '';
            } else {
                dayDiv.textContent = dayDiv.getAttribute('data-day');
            }
        }
        // Update progress
        const progressDiv = habitDiv.querySelector('.progress-report');
        if (progressDiv) {
            const newProgress = createProgressReport(habit);
            progressDiv.replaceWith(newProgress);
        }
    }
}

// Render all habits
function renderHabits() {
    habitsContainer.innerHTML = '';
    habits.forEach(habit => {
        const habitElement = createHabitElement(habit);
        habitsContainer.appendChild(habitElement);
    });
}

// Create habit element
function createHabitElement(habit) {
    const habitDiv = document.createElement('div');
    habitDiv.className = 'habit';
    habitDiv.setAttribute('data-habit-id', habit.id);

    const headerDiv = document.createElement('div');
    headerDiv.className = 'habit-header';

    const nameH2 = document.createElement('h2');
    nameH2.className = 'habit-name';
    nameH2.textContent = habit.name;

    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn';
    completeBtn.textContent = '✓ Today';
    completeBtn.addEventListener('click', () => completeToday(habit.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => deleteHabit(habit.id));

    headerDiv.appendChild(nameH2);
    headerDiv.appendChild(completeBtn);
    headerDiv.appendChild(deleteBtn);

    const progressDiv = createProgressReport(habit);
    const calendarDiv = createCalendar(habit);

    habitDiv.appendChild(headerDiv);
    habitDiv.appendChild(progressDiv);
    habitDiv.appendChild(calendarDiv);

    return habitDiv;
}

// Create progress report
function createProgressReport(habit) {
    const progressDiv = document.createElement('div');
    progressDiv.className = 'progress-report';

    const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();

    let completedDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${displayedYear}-${String(displayedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (habit.completions[date]) completedDays++;
    }

    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    progressText.textContent = `Completed: ${completedDays} / ${daysInMonth} days`;

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = `${(completedDays / daysInMonth) * 100}%`;

    progressBar.appendChild(progressFill);

    progressDiv.appendChild(progressText);
    progressDiv.appendChild(progressBar);

    return progressDiv;
}

// Create calendar
function createCalendar(habit) {
    const calendarDiv = document.createElement('div');
    calendarDiv.className = 'calendar';

    const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(displayedYear, displayedMonth, 1).getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        calendarDiv.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.textContent = day;
        dayDiv.setAttribute('data-day', day);

        const date = `${displayedYear}-${String(displayedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dayDiv.setAttribute('data-date', date);
        const isCompleted = habit.completions[date];

        if (isCompleted) {
            dayDiv.classList.add('completed');
            dayDiv.textContent = '';
        }

        // Check if it's today
        const today = new Date();
        if (today.getFullYear() === displayedYear && today.getMonth() === displayedMonth && today.getDate() === day) {
            dayDiv.classList.add('today');
        }

        dayDiv.addEventListener('click', () => toggleCompletion(habit.id, date));
        calendarDiv.appendChild(dayDiv);
    }

    return calendarDiv;
}

