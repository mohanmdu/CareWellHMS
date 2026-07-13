-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE department_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    operation VARCHAR(32) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP(6) NOT NULL
);
