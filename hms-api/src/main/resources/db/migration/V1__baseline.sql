-- Provisional local-dev baseline (bootstrapped from the com.pms.masters.entity
-- Department entity), NOT verified against the hospital's live production
-- database - that database runs on-site at Navjeevan Hospital, not on this
-- dev machine. Reconcile this migration against a real export before
-- pointing hms-api at production data (see migration doc §7 Phase 0/3).

CREATE TABLE department (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_department_name UNIQUE (name)
);
