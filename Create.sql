CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'Номер договора (например, сс-25-033-12)',
    contract_name VARCHAR(255) NOT NULL COMMENT 'Наименование договора',
    conclusion_date DATE COMMENT 'Дата заключения',
    start_date DATE NOT NULL COMMENT 'Дата начала действия',
    end_date DATE NOT NULL COMMENT 'Дата окончания действия',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contract_number (contract_number)
) COMMENT 'Основная таблица договоров';

CREATE TABLE service_types (
    id VARCHAR(10) PRIMARY KEY COMMENT 'Код типа услуги (DS, QD, INF)',
    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Наименование услуги',
    description TEXT COMMENT 'Описание услуги',
    INDEX idx_service_type (id)
) COMMENT 'Типы оказываемых услуг';

CREATE TABLE specialist_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(10) NOT NULL UNIQUE COMMENT 'Категория специалиста (К1, К2 и т.д.)',
    rate DECIMAL(10,2) NOT NULL COMMENT 'Ставка в час',
    INDEX idx_category (category)
) COMMENT 'Ставки специалистов по категориям';

CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_number VARCHAR(20) NOT NULL COMMENT 'Номер договора',
    service_type_id VARCHAR(10) NOT NULL COMMENT 'Тип услуги',
    unit_of_measure VARCHAR(50) NOT NULL COMMENT 'Единица измерения (Роль, Система)',
    executor_role VARCHAR(100) NOT NULL COMMENT 'Роль исполнителя',
    department VARCHAR(100) NOT NULL COMMENT 'Подразделение',
    production_function VARCHAR(100) NOT NULL COMMENT 'Производственная функция',
    specialist_category VARCHAR(10) COMMENT 'Категория специалиста',
    quantity DECIMAL(10,2) NOT NULL COMMENT 'Количество единиц измерения',
    rate_per_unit DECIMAL(15,2) COMMENT 'Стоимость на одну единицу измерения в месяц',
    monthly_total DECIMAL(15,2) COMMENT 'Стоимость на все единицы измерения в месяц',
    contract_period_total DECIMAL(15,2) COMMENT 'ИТОГО за весь период договора',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_number) REFERENCES contracts(contract_number),
    FOREIGN KEY (service_type_id) REFERENCES service_types(name),
    FOREIGN KEY (specialist_category) REFERENCES specialist_rates(category),
    INDEX idx_contract_service (contract_number, service_type_id)
) COMMENT 'Услуги по договорам';
