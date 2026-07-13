-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE appointment_audit_log (
    id BIGINT NOT NULL AUTO_INCREMENT,
    appointment_id BIGINT NULL,
    operation VARCHAR(32) NOT NULL,
    patient_name VARCHAR(255) NULL,
    consultant_name VARCHAR(255) NULL,
    department_name VARCHAR(255) NULL,
    appointment_date DATE NULL,
    slot_time TIME NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'web',
    previous_value TEXT NULL,
    new_value TEXT NULL,
    performed_by VARCHAR(100) NULL,
    performed_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_appointment_audit_log_appointment FOREIGN KEY (appointment_id) REFERENCES appointment (id)
);

CREATE INDEX idx_appointment_audit_log_appointment ON appointment_audit_log (appointment_id);
CREATE INDEX idx_appointment_audit_log_performed_at ON appointment_audit_log (performed_at);
