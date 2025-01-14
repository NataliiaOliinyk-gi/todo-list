function getCurrentDate() {
    const weekDays = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const months = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
    const today = new Date();
    const dayWeek = weekDays[today.getDay()];
    const day = today.getDate();
    const month = months[today.getMonth()];
    return {
        dayWeek,
        day,
        month,
    }
}

function displayCurrentDate(currentDate) {
    const weekDay = document.querySelector('.header-info h2');
    const monthAndDay = document.querySelector('.header-info p');
    weekDay.textContent = currentDate.dayWeek;
    monthAndDay.textContent = `${currentDate.day} ${currentDate.month}`;
}

function startApp() {
    // Показываем текущую дату
    displayCurrentDate(getCurrentDate());

    // Подтягиваем элементы DOM
    const tasksList = document.getElementById('tasks'); //Список задач (ul)
    const form = document.getElementById('addNewEntryForm'); // Форма добавления новой задачи
    const tabsTasks = document.getElementById('tabsTasks'); // Контейнер для вкладки задач
    const allTasksTab = document.getElementById('allTasks'); // Вкладка "Все задачи"
    const activeTasksTab = document.getElementById('activeTasks'); // Вкладка "Активные задачи"
    const completedTasksTab = document.getElementById('completedTasks'); // Вкладка "Выполненные задачи"
    const addTaskButton = document.querySelector('.add-task-button'); // Кнопка добавления новой задачи
    const modalWindow = document.getElementById('modalWindow'); // Модальное окно
    const modalNewEntry = document.querySelector('.new-entry'); // Контейнер для списка задач
    const search = document.getElementById('search'); // Поиск
    const searchBtn = document.getElementById('searchBtn'); // Кнопка поиска "Лупа"
    const titleTodoList = document.getElementById('titleTodoList'); // Заголовок "Список дел"
    

    // Инициализация массив задач из localStorage
    const tasks = getTasksFromLocalStorage();
    let currentTasks = [];

    // Функция для инициализации массива задач из localStorage
    function getTasksFromLocalStorage() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    // Функция для получения из localStorage активной вкладки
    function getStateFromLocalStorage() {
        return localStorage.getItem('state') || 'all';
    }

    // Функция для сохранения массива задач в localStorage
    function saveTasksToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Функция для сохранения в localStorage активной вкладки
    function saveStateToLocalStorage(state) {
        localStorage.setItem('state', state);
    }

    // Функция для добавления новой задачи
    function addTask(description, date, reminder) {
        let id = tasks.length;

        tasks.push(
            {
                id,
                description,
                date,
                completed: false,
                reminder,
            }
        )

        saveTasksToLocalStorage();
        renderTasks('active');
        saveStateToLocalStorage('active');
        setActiveTab(activeTasksTab);
    }

    // Функция для отображения задач с учетом фильтрации
    function renderTasks(filter = 'all', search = '') {
        tasksList.innerHTML = ''; // Очищаем текущий список задач

        currentTasks = tasks.filter(task => {
            if (filter === 'all') {
                return true;
            }
            else if (filter === 'active') {
                return !task.completed;
            }
            else {
                return task.completed;
            }
        })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .filter(task => {
                if (search == '') {
                    return true;
                }
                else
                    if (task.description.includes(search)) {
                        return true;
                    }
                    else {
                        return false;
                    }
            });

        currentTasks.forEach((task, index) => {
            const li = document.createElement('li'); // Создаем элемент списка задач
            li.classList.add('tack-list');

            const formattedDate = getInputAndSetDate(task.date); // получаем дату и время для вывода на экран

            li.innerHTML = `
                    <label class="custom-checkbox">
                        <!-- добавим чекбокс для выполнения задачи -->
                        <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}">
                        <span></span>
                        <!-- описание задачи. Если задача завершена, добавляем зачеркивание текста -->
                        <div>
                            <p class="task-data" ${task.completed ? 'style="opacity: 0.5"' : ''}>${formattedDate}</p>
                            <p class="task-description" ${task.completed ? 'style="text-decoration: line-through; opacity: 0.5"' : ''}>${task.description}</p>
                        </div>
                    </label>
                `;
            tasksList.appendChild(li); // добавляем задачу в список
        });

    }

    // Обработчик событие отправки формы для добавления новой задачи
    form.addEventListener('submit', event => {
        event.preventDefault();

        const description = event.target.elements.descriptionEntry.value;
        const date = event.target.elements.dataEntry.value;
        const reminder = event.target.elements.reminder.checked;

        // Проверяем, что поля заполнены
        if (description && date) {
            // Добавляем новую задачу
            addTask(description, date, reminder);
            form.reset();
            visibilityOffModalWindow();
        }
    });

    // Обработчик изменения состояния задачи
    tasksList.addEventListener('change', event => {
        if (event.target.matches('input[type="checkbox"]')) {
            const index = event.target.getAttribute('data-index');
            toggleTaskCompletion(index);
        }
    })

    // Функция для переключения статуса выполнения задачи
    function toggleTaskCompletion(currentIndex) {

        const index = currentTasks[currentIndex].id;

        tasks[index].completed = !tasks[index].completed;
        saveTasksToLocalStorage();
        renderTasks(loadAndSetTab());
    }

    // Обработчик переключение вкладки "Все задачи"
    allTasksTab.addEventListener('click', () => {
        handlingTabTask('all', allTasksTab);
    })

    // Обработчик переключение вкладки "Активные задачи"
    activeTasksTab.addEventListener('click', () => {
        handlingTabTask('active', activeTasksTab);
    })

    // Обработчик переключение вкладки "Завершенные задачи"
    completedTasksTab.addEventListener('click', () => {
        handlingTabTask('completed', completedTasksTab);
    })

    // Функция для обработки переключения вкладок на активную
    function handlingTabTask(state, activeTab) {
        renderTasks(state);
        setActiveTab(activeTab)
        saveStateToLocalStorage(state);
        search.value = '';
    }

    // Функция для выделения активной вкладки
    function setActiveTab(activeTab) {
        [allTasksTab, activeTasksTab, completedTasksTab].forEach(tab => tab.classList.remove('active'));
        activeTab.classList.add('active');
    }

    // Функция для получения из localStorage активной вкладки и выделения этой активной вкладки
    function loadAndSetTab() {
        let state = getStateFromLocalStorage();

        if (state == 'all') setActiveTab(allTasksTab);
        if (state == 'active') setActiveTab(activeTasksTab);
        if (state == 'completed') setActiveTab(completedTasksTab);

        return state;
    }

    // Обработчик события для добавления новой задачи
    addTaskButton.addEventListener('click', () => {
        visibilityOnModalWindow();
    });

    // Функция для включения видимости модального окна
    function visibilityOnModalWindow() {
        modalWindow.classList.add('active');
        modalNewEntry.classList.add('active');
        titleTodoList.style.display = "block";
        tabsTasks.style.display = "none";
    }

    // Функция для выключения видимости модального окна
    function visibilityOffModalWindow() {
        modalWindow.classList.remove('active');
        modalNewEntry.classList.remove('active');
        titleTodoList.style.display = "none";
        tabsTasks.style.display = "flex";
    }

    // Обработчик закрытия модального окна при клике вне добавления новой задачи
    modalWindow.addEventListener("click", event => {
        if (event.target === modalWindow) {
            visibilityOffModalWindow();
        }
    });

    //Обработчик закрытия модального окна кнопкой "Отмена"
    document.querySelector('button[type="reset"]').addEventListener('click', () => {
        visibilityOffModalWindow();
    });

    //Обработчик закрытия модального окна кнопкой 'Escape'
    document.addEventListener('keydown', (event) => {
        if(event.key === 'Escape') {
            visibilityOffModalWindow();
        };
    });

    // Функция для вывода даты и времени задачи на экран
    function getInputAndSetDate(inputDate) {
        const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

        const date = new Date(inputDate);

        const day = date.getDate(); // день
        const month = months[date.getMonth()]; // месяц
        const hours = String(date.getHours()).padStart(2, "0"); // часы
        const minutes = String(date.getMinutes()).padStart(2, "0"); // минуты
        const formattedDate = `${day} ${month}, ${hours}:${minutes}`;

        return formattedDate;
    }

    // Обработчик событие поиска
    search.addEventListener('input', () => {
        const searchInput = search.value;
        const state = loadAndSetTab();
        renderTasks(state, searchInput);
    });

    // Обработчик событие нажатия на кнопку "Лупа"
    // очищает строку поиска
    searchBtn.addEventListener('click', () => {
        search.value = '';
    })



    renderTasks(loadAndSetTab());
}

startApp();