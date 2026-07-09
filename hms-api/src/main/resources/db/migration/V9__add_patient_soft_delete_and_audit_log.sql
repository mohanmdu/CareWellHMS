-- Local-dev provisional migration (see note in V1__baseline.sql).

ALTER TABLE patient ADD COLUMN age INT NULL;
ALTER TABLE patient ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE patient_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    operation VARCHAR(32) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP(6) NOT NULL
);
