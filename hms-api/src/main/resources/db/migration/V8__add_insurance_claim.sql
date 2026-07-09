-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE insurance_claim (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    claim_number VARCHAR(32) NOT NULL,
    patient_id BIGINT NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    insurer_name VARCHAR(255) NOT NULL,
    claim_type VARCHAR(32) NOT NULL,
    requested_amount DOUBLE NOT NULL DEFAULT 0,
    approved_amount DOUBLE NULL,
    status VARCHAR(32) NOT NULL,
    decision_reason VARCHAR(500) NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_insurance_claim_number UNIQUE (claim_number),
    CONSTRAINT fk_insurance_claim_patient FOREIGN KEY (patient_id) REFERENCES patient (id)
);
