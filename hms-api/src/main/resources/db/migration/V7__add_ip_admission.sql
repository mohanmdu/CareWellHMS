-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE room_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    daily_rate DOUBLE NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_room_type_name UNIQUE (name)
);

CREATE TABLE room (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL,
    room_type_id BIGINT NOT NULL,
    occupied BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_room_number UNIQUE (room_number),
    CONSTRAINT fk_room_room_type FOREIGN KEY (room_type_id) REFERENCES room_type (id)
);

CREATE TABLE admission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admission_number VARCHAR(32) NOT NULL,
    patient_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    admission_date DATETIME(6) NOT NULL,
    status VARCHAR(32) NOT NULL,
    advance_amount DOUBLE NOT NULL DEFAULT 0,
    total_billed DOUBLE NULL,
    settlement_amount DOUBLE NULL,
    discharge_date DATETIME(6) NULL,
    discharge_summary VARCHAR(2000) NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_admission_number UNIQUE (admission_number),
    CONSTRAINT fk_admission_patient FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT fk_admission_room FOREIGN KEY (room_id) REFERENCES room (id)
);
