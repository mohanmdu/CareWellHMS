CREATE TABLE patient_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    comments VARCHAR(1000) NULL,
    file_path VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NULL,
    uploaded_by VARCHAR(100) NULL,
    uploaded_at DATETIME NOT NULL,
    CONSTRAINT fk_patient_report_patient FOREIGN KEY (patient_id) REFERENCES patient (id)
);
