-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE general_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(32) NOT NULL,
    email VARCHAR(255) NULL,
    role_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_general_user_role FOREIGN KEY (role_id) REFERENCES role (id)
);

CREATE TABLE general_user_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    general_user_id BIGINT NOT NULL,
    general_user_name VARCHAR(255) NOT NULL,
    operation VARCHAR(32) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP(6) NOT NULL
);
