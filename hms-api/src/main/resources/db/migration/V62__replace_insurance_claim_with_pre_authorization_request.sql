-- Replaces the generic Insurance Claims module (Pre-Auth + Enhancement
-- claim types in one flat grid) with a Pre Authorization Request-only
-- module built around the Admission cross-module seeding workflow -
-- V8__add_insurance_claim.sql was itself a "local-dev provisional
-- migration", so this drops it outright rather than altering in place.
DROP TABLE insurance_claim;

CREATE TABLE pre_authorization_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(32) NOT NULL,
    patient_id BIGINT NOT NULL,
    admission_id BIGINT NULL,
    policy_number VARCHAR(100) NULL,
    insurer_name VARCHAR(255) NULL,
    tpa_name VARCHAR(255) NULL,
    corporate_name VARCHAR(255) NULL,
    requested_amount DOUBLE NOT NULL DEFAULT 0,
    approved_amount DOUBLE NULL,
    status VARCHAR(32) NOT NULL,
    decision_reason VARCHAR(500) NULL,
    raised_at TIMESTAMP(6) NULL,
    raised_by VARCHAR(100) NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_pre_authorization_request_number UNIQUE (request_number),
    CONSTRAINT fk_pre_authorization_request_patient FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT fk_pre_authorization_request_admission FOREIGN KEY (admission_id) REFERENCES admission (id)
);
