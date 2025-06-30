from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import pandas as pd
import db_helper
import numpy as np

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всех маршрутов и источников

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# Метод с обработкой фвйла
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify(success=False, error='Файл не найден в запросе'), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify(success=False, error='Имя файла пустое'), 400

    # Чтобы прочитать файл с помощью pandas, используем file.stream или file.read()
    # file.stream — это поток, который можно передать в pd.ExcelFile

    xls = pd.ExcelFile(file.stream)

    '''
    print("Листы в файле:", xls.sheet_names)
    for sheet_name in xls.sheet_names[:4]:
        print(f"\nСодержимое листа '{sheet_name}':")
        df = pd.read_excel(xls, sheet_name=sheet_name)
        print(df)
    '''

    # Обработка "Наименование услуги"
    print("\nНаименование услуги:")
    df = pd.read_excel(xls, sheet_name="Наименование услуги")
    arr = [list(tuple(df.iloc[i])) for i in range(df.shape[0])]
    for i in arr:
        db_helper.add_service_type(i)
    # Обработка "Ставки специвлистов ч.ч."
    print("\nСтавки специвлистов ч.ч.:")
    df = pd.read_excel(xls, sheet_name="Ставки специвлистов ч.ч.")
    arr = [list(tuple(df.iloc[i])) for i in range(df.shape[0])]
    for i in arr:
        db_helper.add_specialist_rate(i)
    # Обработка "Даты"
    print("\nДаты:")    
    df = pd.read_excel(xls, sheet_name="Даты")
    help_pars = lambda x: int(x) if isinstance(x, np.integer) else float(x) if isinstance(x, np.floating) else x
    #print(tuple( help_pars(x) for x in df.iloc[0]))
    arr = [[help_pars(x) for x in df.iloc[i]] for i in range(df.shape[0])]
    for i in arr:
        db_helper.add_contract(i)
    # Обработка "Услуги"
    print("\nУслуги:")
    df = pd.read_excel(xls, sheet_name="Услуги")
    arr = [[df[j][i] for j in df.keys()] for i in range(df.shape[0])]
    for i in arr:
        db_helper.add_service(i)

    #print(arr_2)


    
    # Если хотите, можно сохранить файл на диск
    filename = secure_filename(file.filename)


    data = db_helper.simple_select()

    return jsonify(success=True, data=data), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)
