-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE op_direct_billing (
    id BIGINT NOT NULL AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    invoice_number BIGINT NOT NULL,
    total_amount DOUBLE NOT NULL,
    payment_mode VARCHAR(32) NOT NULL,
    remarks VARCHAR(500) NULL,
    billed_by VARCHAR(100) NULL,
    billed_at DATETIME(6) NOT NULL,
    refund_amount DOUBLE NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_op_direct_billing_invoice UNIQUE (invoice_number),
    CONSTRAINT fk_op_direct_billing_patient FOREIGN KEY (patient_id) REFERENCES patient (id)
);

CREATE INDEX idx_op_direct_billing_billed_at ON op_direct_billing (billed_at);

CREATE TABLE op_direct_billing_item (
    id BIGINT NOT NULL AUTO_INCREMENT,
    op_direct_billing_id BIGINT NOT NULL,
    component_id BIGINT NULL,
    category_name VARCHAR(255) NOT NULL,
    component_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    amount DOUBLE NOT NULL,
    remarks VARCHAR(255) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_op_direct_billing_item_billing FOREIGN KEY (op_direct_billing_id) REFERENCES op_direct_billing (id),
    CONSTRAINT fk_op_direct_billing_item_component FOREIGN KEY (component_id) REFERENCES op_billing_component (id)
);

CREATE INDEX idx_op_direct_billing_item_billing ON op_direct_billing_item (op_direct_billing_id);
