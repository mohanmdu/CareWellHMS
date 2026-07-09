-- Local-dev provisional migration (see note in V1__baseline.sql).

ALTER TABLE department
    ADD COLUMN created_at TIMESTAMP(6) NULL,
    ADD COLUMN updated_at TIMESTAMP(6) NULL;

CREATE TABLE role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_role_name UNIQUE (name)
);

CREATE TABLE consultant (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id BIGINT NOT NULL,
    specialization VARCHAR(255),
    email VARCHAR(255),
    mobile_number VARCHAR(32),
    consultation_fee DOUBLE NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_consultant_department FOREIGN KEY (department_id) REFERENCES department (id)
);
