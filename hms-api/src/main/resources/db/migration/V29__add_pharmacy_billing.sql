CREATE TABLE pharmacy_location (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_pharmacy_location_name UNIQUE (name)
);

-- One row per received GRN item line - created only when that GRN is approved.
-- version mirrors the old DrugBatch's optimistic lock: prevents overselling
-- under concurrent billing.
CREATE TABLE pharmacy_stock (
    id BIGINT NOT NULL AUTO_INCREMENT,
    grn_item_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_type_name VARCHAR(255) NULL,
    batch VARCHAR(100) NULL,
    expiry_date DATE NULL,
    manufacture_date DATE NULL,
    mrp DOUBLE NULL,
    purchase_rate DOUBLE NULL,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_pharmacy_stock_grn_item UNIQUE (grn_item_id),
    CONSTRAINT fk_pharmacy_stock_grn_item FOREIGN KEY (grn_item_id) REFERENCES grn_item (id),
    CONSTRAINT fk_pharmacy_stock_product FOREIGN KEY (product_id) REFERENCES product (id),
    CONSTRAINT chk_pharmacy_stock_qty_non_negative CHECK (quantity_on_hand >= 0)
);
CREATE INDEX idx_pharmacy_stock_product ON pharmacy_stock (product_id);

CREATE TABLE pharmacy_request (
    id BIGINT NOT NULL AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    source VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    location_id BIGINT NULL,
    created_by VARCHAR(100) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_pharmacy_request_patient FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT fk_pharmacy_request_location FOREIGN KEY (location_id) REFERENCES pharmacy_location (id)
);
CREATE INDEX idx_pharmacy_request_patient ON pharmacy_request (patient_id);

CREATE TABLE pharmacy_request_item (
    id BIGINT NOT NULL AUTO_INCREMENT,
    request_id BIGINT NOT NULL,
    product_id BIGINT NULL,
    drug_name VARCHAR(255) NOT NULL,
    qty INT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_pharmacy_request_item_request FOREIGN KEY (request_id) REFERENCES pharmacy_request (id),
    CONSTRAINT fk_pharmacy_request_item_product FOREIGN KEY (product_id) REFERENCES product (id)
);
CREATE INDEX idx_pharmacy_request_item_request ON pharmacy_request_item (request_id);

CREATE TABLE pharmacy_sale (
    id BIGINT NOT NULL AUTO_INCREMENT,
    bill_number BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    location_id BIGINT NOT NULL,
    source VARCHAR(10) NOT NULL,
    pharmacy_request_id BIGINT NULL,
    billing_type VARCHAR(10) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL,
    consultant_id BIGINT NULL,
    discount_percent DOUBLE NULL,
    discount_amount DOUBLE NULL,
    discount_reason VARCHAR(255) NULL,
    total_amount DOUBLE NOT NULL,
    amount_paid DOUBLE NOT NULL,
    balance_amount DOUBLE NOT NULL,
    remarks VARCHAR(500) NULL,
    billed_by VARCHAR(100) NULL,
    billed_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_pharmacy_sale_bill_number UNIQUE (bill_number),
    CONSTRAINT fk_pharmacy_sale_patient FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT fk_pharmacy_sale_location FOREIGN KEY (location_id) REFERENCES pharmacy_location (id),
    CONSTRAINT fk_pharmacy_sale_request FOREIGN KEY (pharmacy_request_id) REFERENCES pharmacy_request (id),
    CONSTRAINT fk_pharmacy_sale_consultant FOREIGN KEY (consultant_id) REFERENCES consultant (id)
);
CREATE INDEX idx_pharmacy_sale_patient ON pharmacy_sale (patient_id);
CREATE INDEX idx_pharmacy_sale_billed_at ON pharmacy_sale (billed_at);

CREATE TABLE pharmacy_sale_item (
    id BIGINT NOT NULL AUTO_INCREMENT,
    sale_id BIGINT NOT NULL,
    stock_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_type_name VARCHAR(255) NULL,
    batch VARCHAR(100) NULL,
    expiry_date DATE NULL,
    mrp DOUBLE NULL,
    quantity INT NOT NULL,
    amount DOUBLE NOT NULL,
    hsn_sac VARCHAR(50) NULL,
    sgst_percent DOUBLE NULL,
    sgst_amount DOUBLE NOT NULL DEFAULT 0,
    cgst_percent DOUBLE NULL,
    cgst_amount DOUBLE NOT NULL DEFAULT 0,
    net_amount DOUBLE NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_pharmacy_sale_item_sale FOREIGN KEY (sale_id) REFERENCES pharmacy_sale (id),
    CONSTRAINT fk_pharmacy_sale_item_stock FOREIGN KEY (stock_id) REFERENCES pharmacy_stock (id)
);
CREATE INDEX idx_pharmacy_sale_item_sale ON pharmacy_sale_item (sale_id);

CREATE TABLE pharmacy_return (
    id BIGINT NOT NULL AUTO_INCREMENT,
    sale_item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    amount DOUBLE NOT NULL,
    remarks VARCHAR(255) NULL,
    returned_by VARCHAR(100) NULL,
    returned_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_pharmacy_return_sale_item FOREIGN KEY (sale_item_id) REFERENCES pharmacy_sale_item (id)
);
