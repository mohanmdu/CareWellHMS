-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE lab_requisition (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requisition_number VARCHAR(32) NOT NULL,
    patient_id BIGINT NOT NULL,
    appointment_id BIGINT NULL,
    status VARCHAR(32) NOT NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_lab_requisition_number UNIQUE (requisition_number),
    CONSTRAINT fk_lab_requisition_patient FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT fk_lab_requisition_appointment FOREIGN KEY (appointment_id) REFERENCES appointment (id)
);

CREATE TABLE lab_requisition_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requisition_id BIGINT NOT NULL,
    billing_item_id BIGINT NOT NULL,
    specimen_type VARCHAR(100),
    status VARCHAR(32) NOT NULL,
    result_value VARCHAR(500),
    normal_range VARCHAR(255),
    CONSTRAINT fk_lab_requisition_item_requisition FOREIGN KEY (requisition_id) REFERENCES lab_requisition (id),
    CONSTRAINT fk_lab_requisition_item_billing_item FOREIGN KEY (billing_item_id) REFERENCES billing_item (id)
);
