CREATE TABLE ip_billing_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    active BIT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL
);

CREATE TABLE ip_billing_component (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    ip_amount DOUBLE NOT NULL DEFAULT 0,
    insurance_amount DOUBLE NOT NULL DEFAULT 0,
    active BIT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    CONSTRAINT fk_ip_billing_component_category FOREIGN KEY (category_id) REFERENCES ip_billing_category (id)
);

CREATE TABLE ip_billing_component_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    component_id BIGINT NOT NULL,
    component_name VARCHAR(255) NOT NULL,
    operation VARCHAR(32) NOT NULL,
    content VARCHAR(1000) NULL,
    previous_content VARCHAR(1000) NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at DATETIME NOT NULL
);

CREATE INDEX idx_ip_billing_component_audit_log_performed_at ON ip_billing_component_audit_log (performed_at);
