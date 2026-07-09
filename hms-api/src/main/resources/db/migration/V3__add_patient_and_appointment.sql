-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE patient (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(32) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(16),
    mobile_number VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    address VARCHAR(500),
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_patient_registration_number UNIQUE (registration_number)
);

CREATE TABLE appointment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    consultant_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    status VARCHAR(32) NOT NULL,
    notes VARCHAR(500),
    cancellation_reason VARCHAR(500),
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT fk_appointment_consultant FOREIGN KEY (consultant_id) REFERENCES consultant (id)
);
