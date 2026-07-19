ALTER TABLE admission ADD COLUMN discharge_type VARCHAR(32) NULL;
ALTER TABLE admission ADD COLUMN discharge_number VARCHAR(50) NULL;

CREATE TABLE ip_payment_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admission_id BIGINT NOT NULL,
    request_type VARCHAR(32) NOT NULL,
    amount DOUBLE NOT NULL,
    description VARCHAR(255) NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    payment_mode VARCHAR(32) NULL,
    requested_at TIMESTAMP(6) NOT NULL,
    requested_by VARCHAR(150) NULL,
    approved_at TIMESTAMP(6) NULL,
    approved_by VARCHAR(150) NULL,
    ip_payment_id BIGINT NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_ip_payment_request_admission FOREIGN KEY (admission_id) REFERENCES admission (id),
    CONSTRAINT fk_ip_payment_request_payment FOREIGN KEY (ip_payment_id) REFERENCES ip_payment (id)
);
