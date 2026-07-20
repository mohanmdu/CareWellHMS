CREATE TABLE lab_test_entry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requisition_id BIGINT NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'NEW',
    specimen_types VARCHAR(255) NULL,
    reported_date TIMESTAMP(6) NULL,
    remarks VARCHAR(500) NULL,
    updated_by VARCHAR(100) NULL,
    approved_at TIMESTAMP(6) NULL,
    approved_by VARCHAR(100) NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uk_lab_test_entry_requisition UNIQUE (requisition_id),
    CONSTRAINT fk_lab_test_entry_requisition FOREIGN KEY (requisition_id) REFERENCES lab_requisition (id)
);

CREATE TABLE lab_test_result (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lab_test_entry_id BIGINT NOT NULL,
    component_id BIGINT NOT NULL,
    result_value VARCHAR(500) NULL,
    abnormal BIT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_lab_test_result_entry FOREIGN KEY (lab_test_entry_id) REFERENCES lab_test_entry (id),
    CONSTRAINT fk_lab_test_result_component FOREIGN KEY (component_id) REFERENCES lab_component (id)
);
