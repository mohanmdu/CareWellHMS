-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE drug (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    manufacturer VARCHAR(255),
    unit_of_measure VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_drug_name UNIQUE (name)
);

-- version column + CHECK(quantity_on_hand >= 0) are the two concrete fixes
-- for migration doc risk R10 (legacy unlocked bulk-update overselling bug).
CREATE TABLE drug_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    drug_id BIGINT NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    purchase_price DOUBLE NOT NULL DEFAULT 0,
    selling_price DOUBLE NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_drug_batch_drug FOREIGN KEY (drug_id) REFERENCES drug (id),
    CONSTRAINT chk_drug_batch_quantity_non_negative CHECK (quantity_on_hand >= 0)
);

CREATE TABLE pharmacy_sale (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_number VARCHAR(32) NOT NULL,
    patient_id BIGINT NOT NULL,
    total_amount DOUBLE NOT NULL DEFAULT 0,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_pharmacy_sale_number UNIQUE (sale_number),
    CONSTRAINT fk_pharmacy_sale_patient FOREIGN KEY (patient_id) REFERENCES patient (id)
);

CREATE TABLE pharmacy_sale_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    drug_batch_id BIGINT NOT NULL,
    drug_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DOUBLE NOT NULL,
    line_total DOUBLE NOT NULL,
    CONSTRAINT fk_pharmacy_sale_item_sale FOREIGN KEY (sale_id) REFERENCES pharmacy_sale (id),
    CONSTRAINT fk_pharmacy_sale_item_batch FOREIGN KEY (drug_batch_id) REFERENCES drug_batch (id)
);
