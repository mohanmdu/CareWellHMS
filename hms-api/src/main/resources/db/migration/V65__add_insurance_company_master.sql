CREATE TABLE insurance_company (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    insurance_type VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_insurance_company_name UNIQUE (company_name)
);

CREATE TABLE insurance_company_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    insurance_company_id BIGINT NOT NULL,
    insurance_company_name VARCHAR(255) NOT NULL,
    operation VARCHAR(32) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at DATETIME(6) NOT NULL
);
CREATE INDEX idx_insurance_company_audit_log_performed_at ON insurance_company_audit_log (performed_at);
