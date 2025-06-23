// Обработчик загрузки файла
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        alert(`Файл "${file.name}" успешно выбран для загрузки`);
        // Здесь можно добавить логику для фактической загрузки файла
    }
});

// Обработчик кнопки формирования отчета
document.getElementById('generateReportBtn').addEventListener('click', function() {
    alert('Отчет формируется...');
    // Здесь можно добавить логику для формирования отчета
});