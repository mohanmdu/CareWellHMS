-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE op_billing_category (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_op_billing_category_name UNIQUE (name)
);

CREATE TABLE op_billing_component (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DOUBLE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_op_billing_component_category FOREIGN KEY (category_id) REFERENCES op_billing_category (id)
);

CREATE INDEX idx_op_billing_component_category ON op_billing_component (category_id);
