-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE billing_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_billing_category_name UNIQUE (name)
);

CREATE TABLE billing_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    billing_category_id BIGINT NOT NULL,
    price DOUBLE NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_billing_item_category FOREIGN KEY (billing_category_id) REFERENCES billing_category (id)
);

CREATE TABLE invoice (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(32) NOT NULL,
    patient_id BIGINT NOT NULL,
    appointment_id BIGINT NULL,
    status VARCHAR(32) NOT NULL,
    total_amount DOUBLE NOT NULL DEFAULT 0,
    cancellation_reason VARCHAR(500),
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_invoice_number UNIQUE (invoice_number),
    CONSTRAINT fk_invoice_patient FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT fk_invoice_appointment FOREIGN KEY (appointment_id) REFERENCES appointment (id)
);

CREATE TABLE invoice_line_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    billing_item_id BIGINT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DOUBLE NOT NULL,
    line_total DOUBLE NOT NULL,
    CONSTRAINT fk_invoice_line_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoice (id),
    CONSTRAINT fk_invoice_line_item_billing_item FOREIGN KEY (billing_item_id) REFERENCES billing_item (id)
);
