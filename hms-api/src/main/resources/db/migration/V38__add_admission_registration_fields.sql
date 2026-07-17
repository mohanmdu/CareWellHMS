ALTER TABLE admission
  MODIFY COLUMN room_id BIGINT NULL;

ALTER TABLE admission
  ADD COLUMN room_type_id BIGINT NULL AFTER room_id,
  ADD COLUMN attender_name VARCHAR(255) NULL,
  ADD COLUMN relation_type VARCHAR(100) NULL,
  ADD COLUMN father_spouse_name VARCHAR(255) NULL,
  ADD COLUMN relation_mobile_no VARCHAR(20) NULL,
  ADD COLUMN occupation VARCHAR(100) NULL,
  ADD COLUMN marital_status VARCHAR(32) NULL,
  ADD COLUMN period_of_stay_days INT NULL,
  ADD COLUMN description_of_case VARCHAR(32) NULL,
  ADD COLUMN referral_doctor VARCHAR(255) NULL,
  ADD COLUMN primary_consultant VARCHAR(255) NULL,
  ADD COLUMN secondary_consultant VARCHAR(255) NULL,
  ADD COLUMN payment_type VARCHAR(32) NULL,
  ADD COLUMN height_cm DOUBLE NULL,
  ADD COLUMN weight_kg DOUBLE NULL,
  ADD COLUMN mlc BIT(1) NOT NULL DEFAULT 0,
  ADD COLUMN insurance_type VARCHAR(64) NULL,
  ADD COLUMN patient_type VARCHAR(32) NULL,
  ADD COLUMN remarks VARCHAR(1000) NULL,
  ADD COLUMN aadhaar_number VARCHAR(20) NULL,
  ADD COLUMN ventilator_required BIT(1) NOT NULL DEFAULT 0,
  ADD COLUMN monitor_required BIT(1) NOT NULL DEFAULT 0,
  ADD COLUMN photo_path VARCHAR(500) NULL,
  ADD CONSTRAINT fk_admission_room_type FOREIGN KEY (room_type_id) REFERENCES room_type (id);
