-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE consultant_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    consultant_id BIGINT NOT NULL,
    consultant_name VARCHAR(255) NOT NULL,
    operation VARCHAR(32) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP(6) NOT NULL
);
