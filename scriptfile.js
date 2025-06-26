document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        alert(`Файл "${file.name}" успешно выбран для загрузки`);
        alert('Ваш отчет уже готов!');
    }
});

function readXLSX() {
    document.getElementById('output').style.display=""
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert("Выберите файл!");
        return;
    }
    const formData = new FormData();
        formData.append('file', file);
    
        // Отправляем файл на сервер
        fetch('http://127.0.0.1:5000/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Обработка ответа сервера
            if (data.success) {
                console.log('Ответ сервера:', data);  // Выводим весь объект data в консоль
                
                //document.getElementById('output').textContent = data;
                // Если дата приходит в data, например data.date, то так:
                // console.log('Дата с сервера:', data.date);

                // Или выводите в элемент страницы, например:
                // document.getElementById('output').textContent = JSON.stringify(data);
            } else {
                console.error('Ошибка обработки файла на сервере.');
            }
        })
        .catch(error => {
            console.error('Ошибка при отправке файла:', error);
        });
    

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Очистка предыдущих данных
        document.getElementById('sheetTabs').innerHTML = '';
        document.getElementById('sheetContents').innerHTML = '';

        // Обработка каждого листа
        workbook.SheetNames.forEach((sheetName, index) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Создание вкладки для листа
            const tab = document.createElement('div');
            tab.className = 'sheet-tab' + (index === 0 ? ' active' : '');
            tab.textContent = sheetName;
            tab.onclick = () => switchSheet(index);
            document.getElementById('sheetTabs').appendChild(tab);

            // Создание содержимого листа
            const content = document.createElement('div');
            content.className = 'sheet-content' + (index === 0 ? ' active' : '');
            content.innerHTML = generateTableHTML(jsonData);
            document.getElementById('sheetContents').appendChild(content);
        });
    };
    reader.readAsArrayBuffer(file);
}

function switchSheet(index) {
    // Активация выбранной вкладки
    document.querySelectorAll('.sheet-tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });

    // Активация соответствующего содержимого
    document.querySelectorAll('.sheet-content').forEach((content, i) => {
        content.classList.toggle('active', i === index);
    });
}

function generateTableHTML(data) {
    if (data.length === 0) return '<p>Нет данных</p>';

    let html = '<table class = "tablenew"><thead><tr>';
    // Заголовки (первая строка)
    data[0].forEach(cell => {
        html += `<th>${cell || ''}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Данные (остальные строки)
    for (let i = 1; i < data.length; i++) {
        html += '<tr>';
        data[i].forEach(cell => {
            html += `<td>${cell || ''}</td>`;
        });
        html += '</tr>';
    }
    html += '</tbody></table>';

    return html;
}

// Автоматическая загрузка при выборе файла
document.getElementById('fileInput').addEventListener('change', readXLSX);
