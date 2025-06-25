document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        alert(`Файл "${file.name}" успешно выбран для загрузки`);
        alert('Нажмите кнопку "Сформировать отчет"');
        // Здесь можно добавить логику для фактической загрузки файла
    }
});

function parseFile() {
    document.getElementById('output').style.display="";
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert("Выберите файл!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const parsedData = parseServicesData(content);
        displayResults(parsedData);
    };
    reader.readAsText(file, 'UTF-8');
}

function parseServicesData(content) {
    const lines = content.split('\n')
        .filter(line => line.trim() && !line.startsWith(';;;;;;;;'))
        .map(line => line.replace(/#ЗНАЧ!/g, '').replace(/#Н\/Д/g, 'Н/Д'));

    const parsedData = [];
    for (const line of lines) {
        const cells = line.split(';').map(cell => cell.trim());
        if (cells.length < 14) continue;

        parsedData.push({
            'Договор': cells[0] || '',
            'Единица измерения': cells[2] || '',
            'Роль': cells[3] || '',
            'Подразделение': cells[5] || '',
            'Функция': cells[6] || '',
            'Категория': cells[7] || '',
            'Кол-во единиц': cells[10] || '',
            'Стоимость (мес)': cells[11] || '',
            'Стоимость (весь период)': cells[13] || ''
        });
    }
    return parsedData;
}

function displayResults(data) {
    const resultDiv = document.getElementById('output');
    if (data.length === 0) {
        resultDiv.innerHTML = "<p>Нет данных для отображения.</p>";
        return;
    }

    let html = '<table><thead><tr>';
    for (const key in data[0]) {
        html += `<th>${key}</th>`;
    }
    html += '</tr></thead><tbody>';

    data.forEach(row => {
        html += '<tr>';
        for (const key in row) {
            html += `<td>${row[key]}</td>`;
        }
        html += '</tr>';
    });

    html += '</tbody></table>';
    resultDiv.innerHTML = html;
}
