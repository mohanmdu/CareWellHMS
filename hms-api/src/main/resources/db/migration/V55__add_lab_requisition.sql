CREATE TABLE lab_requisition (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requisition_number VARCHAR(32) NOT NULL,
    requisition_type VARCHAR(32) NOT NULL DEFAULT 'Labtest',
    patient_id BIGINT NOT NULL,
    consultant_id BIGINT NULL,
    patient_type VARCHAR(10) NULL,
    billing_type VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    total_amount DOUBLE NOT NULL DEFAULT 0,
    requisition_date TIMESTAMP(6) NOT NULL,
    created_by VARCHAR(100) NULL,
    invoice_number BIGINT NULL,
    paid_amount DOUBLE NULL,
    discount_amount DOUBLE NULL,
    payment_mode VARCHAR(32) NULL,
    remarks VARCHAR(500) NULL,
    approved_at TIMESTAMP(6) NULL,
    approved_by VARCHAR(100) NULL,
    cancelled_at TIMESTAMP(6) NULL,
    cancelled_by VARCHAR(100) NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uk_lab_requisition_number UNIQUE (requisition_number),
    CONSTRAINT fk_lab_requisition_patient FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT fk_lab_requisition_consultant FOREIGN KEY (consultant_id) REFERENCES consultant (id)
);

CREATE TABLE lab_requisition_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requisition_id BIGINT NOT NULL,
    sub_category_id BIGINT NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    sub_category_name VARCHAR(255) NOT NULL,
    amount DOUBLE NOT NULL DEFAULT 0,
    CONSTRAINT fk_lab_requisition_item_requisition FOREIGN KEY (requisition_id) REFERENCES lab_requisition (id),
    CONSTRAINT fk_lab_requisition_item_sub_category FOREIGN KEY (sub_category_id) REFERENCES lab_sub_category (id)
);
