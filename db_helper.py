import mysql.connector
import math

def simple_select():
    """
    Возвращает содержимое всех таблиц базы данных в виде словаря:
    {
        'table_name1': {
            'columns': ['col1', 'col2', ...],
            'rows': [
                [val1, val2, ...],
                ...
            ]
        },
        'table_name2': {...},
        ...
    }
    """
    data = {}
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='daniil',
            password='1',
            database='contracts_db'
        )
        cursor = conn.cursor()

        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()

        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT * FROM `{table_name}`")
            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]  # Получаем имена столбцов
            data[table_name] = {
                'columns': columns,
                'rows': [list(row) for row in rows]  # Преобразуем кортежи в списки для удобства
            }

    except mysql.connector.Error as err:
        print(f"Ошибка: {err}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    return data


def get_connection(host='localhost', user='daniil', password='1', database='contracts_db'):
    return mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database
    )

def add_service_type(arg_arr):
    """
    Добавляет запись в таблицу service_types.
    arg_arr: tuple или список из (id, name, description)
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
        # Получаем максимальный id
        cursor.execute("SELECT MAX(CAST(id AS UNSIGNED)) FROM service_types")
        max_id = cursor.fetchone()[0]
        if max_id is None:
            max_id = 0
        arg_arr[0] = str(max_id + 1)


        
        sql = "INSERT INTO service_types (id, name, description) VALUES (%s, %s, %s)"
        cursor.execute(sql, arg_arr)
        conn.commit()
        print('Service type добавлен')
    except mysql.connector.Error as err:
        print(f"Ошибка при добавлении service_type: {err}")
    finally:
        cursor.close()
        conn.close()

def add_contract(arg_arr):
    """
    Добавляет запись в таблицу contracts.
    arg_arr: tuple или список из (contract_number, contract_name, conclusion_date, start_date, end_date)
    даты в формате 'YYYY-MM-DD' или datetime.date
    """
    try:
        arg_arr = arg_arr[1:]
        conn = get_connection()
        cursor = conn.cursor()
        sql = """
        INSERT INTO contracts 
        (contract_number, contract_name, conclusion_date, start_date, end_date) 
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, arg_arr)
        conn.commit()
        print('Contract добавлен')
    except mysql.connector.Error as err:
        print(f"Ошибка при добавлении contract: {err}")
    finally:
        cursor.close()
        conn.close()

def add_specialist_rate(arg_arr):
    """
    Добавляет запись в таблицу specialist_rates.
    arg_arr: tuple или список из (category, rate)
    """
    if len(arg_arr) >2: arg_arr = arg_arr[1:3]
    try:
        conn = get_connection()
        cursor = conn.cursor()
        sql = "INSERT INTO specialist_rates (category, rate) VALUES (%s, %s)"
        cursor.execute(sql, arg_arr)
        conn.commit()
        print('Specialist rate добавлен')
    except mysql.connector.Error as err:
        print(f"Ошибка при добавлении specialist_rate: {err}")
    finally:
        cursor.close()
        conn.close()

def add_service(arg_arr):
    """
    Добавляет запись в таблицу services.
    arg_arr: tuple или список из
    (contract_number, service_type_id, unit_of_measure, executor_role, department, production_function,
     specialist_category, quantity, rate_per_unit, monthly_total, contract_period_total)
    """
    try:
        arg_arr = arg_arr[:11]
        arg_arr = [0 if (isinstance(x, float) and math.isnan(x)) else x for x in arg_arr]

        conn = get_connection()
        cursor = conn.cursor()

        # Проверяем существует ли уже такая запись
        check_sql = """
        SELECT COUNT(*) FROM services
        WHERE contract_number = %s
          AND service_type_id = %s
          AND unit_of_measure = %s
          AND executor_role = %s
          AND department = %s
          AND production_function = %s
          AND specialist_category = %s
        """
        cursor.execute(check_sql, arg_arr[:7])
        (count,) = cursor.fetchone()
        if count > 0:
            print('Дубликат записи в services, добавление пропущено')
            return  # Не добавляем дубликат

        # Если нет дубликата — вставляем
        insert_sql = """
        INSERT INTO services 
        (contract_number, service_type_id, unit_of_measure, executor_role, department, production_function,
         specialist_category, quantity, rate_per_unit, monthly_total, contract_period_total)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_sql, arg_arr)
        conn.commit()
        print('Service добавлен')

    except mysql.connector.Error as err:
        print(f"Ошибка при добавлении service: {err}")
    finally:
        cursor.close()
        conn.close()



"""
ПРИМЕР ЗАПОЛНЕНЯ ЗАПРОСОВ


# Добавим тип услуги
add_service_type(('DS', 'Диагностическая услуга', 'Услуга по диагностике оборудования'))

# Добавим договор
add_contract(('СС-25-033-12', 'Договор на обслуживание', '2025-01-01', '2025-01-10', '2025-12-31'))

# Добавим ставку специалиста
add_specialist_rate(('К1', 1500.00))

# Добавим услугу по договору
add_service((
    'СС-25-033-12',  # contract_number
    'DS',            # service_type_id
    'Роль',          # unit_of_measure
    'Инженер',       # executor_role
    'Отдел техподдержки',  # department
    'Техническая поддержка', # production_function
    'К1',            # specialist_category
    10.0,            # quantity
    150.00,          # rate_per_unit
    1500.00,         # monthly_total
    18000.00         # contract_period_total
))
"""




if __name__ == "__main__":
    
    simple_select()
