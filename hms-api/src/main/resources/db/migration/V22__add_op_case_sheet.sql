-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE op_case_sheet (
    id BIGINT NOT NULL AUTO_INCREMENT,
    appointment_id BIGINT NOT NULL,
    food_drug_allergy VARCHAR(500) NULL,
    height_cm DOUBLE NULL,
    weight_kg DOUBLE NULL,
    bmi DOUBLE NULL,
    temperature_f DOUBLE NULL,
    pulse_bpm INT NULL,
    respiration_bpm INT NULL,
    bp_systolic INT NULL,
    bp_diastolic INT NULL,
    spo2 DOUBLE NULL,
    body_fat_percent DOUBLE NULL,
    chief_complaints VARCHAR(1000) NULL,
    past_medical_condition VARCHAR(1000) NULL,
    current_medication VARCHAR(1000) NULL,
    physical_activity VARCHAR(255) NULL,
    sleep_duration_hours VARCHAR(50) NULL,
    smoking VARCHAR(10) NULL,
    alcohol VARCHAR(10) NULL,
    surgery VARCHAR(255) NULL,
    family_history VARCHAR(255) NULL,
    provisional_diagnosis VARCHAR(500) NULL,
    cbg VARCHAR(100) NULL,
    findings VARCHAR(1000) NULL,
    investigation VARCHAR(1000) NULL,
    doctor_notes_1 VARCHAR(1000) NULL,
    doctor_notes_2 VARCHAR(1000) NULL,
    diet VARCHAR(1000) NULL,
    remarks VARCHAR(1000) NULL,
    review_date DATE NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_op_case_sheet_appointment UNIQUE (appointment_id),
    CONSTRAINT fk_op_case_sheet_appointment FOREIGN KEY (appointment_id) REFERENCES appointment (id)
);

CREATE INDEX idx_op_case_sheet_review_date ON op_case_sheet (review_date);

CREATE TABLE op_prescription_item (
    id BIGINT NOT NULL AUTO_INCREMENT,
    case_sheet_id BIGINT NOT NULL,
    drug_name VARCHAR(255) NOT NULL,
    qty INT NULL,
    intake VARCHAR(100) NULL,
    morning_dose INT NULL,
    afternoon_dose INT NULL,
    evening_dose INT NULL,
    night_dose INT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_op_prescription_item_case_sheet FOREIGN KEY (case_sheet_id) REFERENCES op_case_sheet (id)
);

CREATE INDEX idx_op_prescription_item_case_sheet ON op_prescription_item (case_sheet_id);
