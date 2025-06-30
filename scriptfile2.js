// Глобальная переменная для хранения данных всех таблиц
let allTableData = {};

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        alert(`Файл "${file.name}" успешно выбран для загрузки`);
        alert('Ваш отчет уже готов!');
        readXLSX(); // Запускаем загрузку сразу после выбора файла
    }
});

function renderTable(tableData) {
    const container = document.getElementById('output');
    container.style.display = "block";
    document.getElementById('tableButtons').style.display = 'flex';
    container.innerHTML = ''; // Очистить контейнер

    if (!tableData || !tableData.columns || !tableData.rows) {
        container.textContent = 'Нет данных для отображения';
        return;
    }

    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';

    // Заголовок таблицы
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    tableData.columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        th.style.border = '1px solid #ddd';
        th.style.padding = '10px 12px';
        th.style.backgroundColor = '#f8f9fa';
        th.style.position = 'sticky';
        th.style.top = '0';
        th.style.zIndex = '1';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = document.createElement('tbody');
    tableData.rows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            let displayValue = cell;
            if (cell === null || cell === undefined) {
                displayValue = ''; // Пустая строка для null/undefined
            } else if (cell instanceof Date) {
                displayValue = cell.toLocaleDateString(); // Форматируем дату
            } else if (typeof cell === 'number') {
                displayValue = cell.toLocaleString();
            }
            td.textContent = displayValue;
            td.style.border = '1px solid #ddd';
            td.style.padding = '8px 12px';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.appendChild(table);
}

// Функция для создания кнопок таблиц
function createTableButtons(data) {
    const tableButtonsContainer = document.getElementById('tableButtons');
    tableButtonsContainer.innerHTML = ''; // Очищаем контейнер перед добавлением новых кнопок

    // Получаем названия таблиц из ответа сервера
    const tableNames = Object.keys(data);

    tableNames.forEach(tableName => {
        const button = document.createElement('button');
        button.textContent = tableName;
        button.classList.add('table-button'); // Добавляем класс для стилизации
        button.addEventListener('click', () => {
            // Удаляем класс 'active' со всех кнопок
            document.querySelectorAll('.table-button').forEach(btn => btn.classList.remove('active'));
            // Добавляем класс 'active' текущей кнопке
            button.classList.add('active');
            renderTable(allTableData[tableName]); // Рендерим выбранную таблицу
        });
        tableButtonsContainer.appendChild(button);
    });

    // Автоматически показать первую таблицу при загрузке кнопок
    if (tableNames.length > 0) {
        tableButtonsContainer.querySelector('.table-button').click();
    }
}

function readXLSX() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert("Выберите файл!");
        return;
    }
    const formData = new FormData();
    formData.append('file', file);

    // Скрываем контейнер с кнопками и очищаем вывод, пока идет загрузка
    document.getElementById('tableButtons').innerHTML = '';
    const output = document.getElementById('output');
    output.style.display = "block";
    output.innerHTML = '<p style="text-align:center; font-style: italic; color: #555;">Загрузка данных...</p>';

    fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Ответ сервера:', data);

                if (data.data) {
                    allTableData = data.data;
                    createTableButtons(allTableData);
                } else {
                    output.textContent = 'В ответе сервера нет данных таблиц.';
                }
            } else {
                console.error('Ошибка обработки файла на сервере:', data.error || 'Неизвестная ошибка');
                output.textContent = `Ошибка: ${data.error || 'Неизвестная ошибка'}`;
            }
        })
        .catch(error => {
            console.error('Ошибка при отправке файла:', error);
            output.textContent = `Ошибка при отправке файла: ${error.message}`;
        });
}

