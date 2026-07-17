CREATE TABLE pharmacy_supplier_payment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grn_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    pay_mode VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(100) NULL,
    remarks VARCHAR(500) NULL,
    paid_by VARCHAR(100) NULL,
    paid_at DATETIME NOT NULL,
    CONSTRAINT fk_supplier_payment_grn FOREIGN KEY (grn_id) REFERENCES grn (id)
);

CREATE INDEX idx_supplier_payment_grn ON pharmacy_supplier_payment (grn_id);
