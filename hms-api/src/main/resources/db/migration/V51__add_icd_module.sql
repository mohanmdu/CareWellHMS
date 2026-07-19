CREATE TABLE icd_code (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(16) NOT NULL,
    code VARCHAR(20) NOT NULL,
    disease_name VARCHAR(255) NOT NULL,
    chapter VARCHAR(255) NULL,
    category VARCHAR(255) NULL,
    who_version VARCHAR(50) NULL,
    short_description TEXT NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    UNIQUE KEY uk_icd_code_version_code (version, code)
);

CREATE TABLE icd_code_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    icd_code_id BIGINT NOT NULL,
    icd_code VARCHAR(20) NOT NULL,
    operation VARCHAR(32) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP(6) NOT NULL
);

CREATE TABLE patient_diagnosis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    icd_code_id BIGINT NOT NULL,
    diagnosis_type VARCHAR(16) NOT NULL,
    department_id BIGINT NULL,
    consultant_id BIGINT NULL,
    diagnosis_date DATE NOT NULL,
    status VARCHAR(16) NOT NULL,
    severity VARCHAR(16) NULL,
    comments TEXT NULL,
    clinical_notes TEXT NULL,
    added_by VARCHAR(100) NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_patient_diagnosis_patient FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT fk_patient_diagnosis_icd_code FOREIGN KEY (icd_code_id) REFERENCES icd_code (id),
    CONSTRAINT fk_patient_diagnosis_department FOREIGN KEY (department_id) REFERENCES department (id),
    CONSTRAINT fk_patient_diagnosis_consultant FOREIGN KEY (consultant_id) REFERENCES consultant (id),
    INDEX idx_patient_diagnosis_patient (patient_id)
);

-- Starter reference set of well-known WHO ICD-10 codes spanning several
-- chapters/departments, so the module is immediately usable; the full
-- ~14,000-code WHO catalog is expected to be brought in via the Import (CSV)
-- feature rather than hand-seeded here.
INSERT INTO icd_code (version, code, disease_name, chapter, category, who_version, short_description, active, created_at, updated_at)
VALUES
('ICD_10', 'A09', 'Diarrhoea and gastroenteritis of presumed infectious origin', 'Certain infectious and parasitic diseases', 'Infectious Disease', 'ICD-10 2019', 'Acute infectious gastroenteritis/diarrhoea.', 1, NOW(), NOW()),
('ICD_10', 'B34.9', 'Viral infection, unspecified', 'Certain infectious and parasitic diseases', 'Infectious Disease', 'ICD-10 2019', 'Viral infection of unspecified site.', 1, NOW(), NOW()),
('ICD_10', 'E03.9', 'Hypothyroidism, unspecified', 'Endocrine, nutritional and metabolic diseases', 'Endocrinology', 'ICD-10 2019', 'Unspecified underactive thyroid.', 1, NOW(), NOW()),
('ICD_10', 'E11.9', 'Type 2 diabetes mellitus without complications', 'Endocrine, nutritional and metabolic diseases', 'Endocrinology', 'ICD-10 2019', 'Non-insulin-dependent diabetes without complication.', 1, NOW(), NOW()),
('ICD_10', 'I10', 'Essential (primary) hypertension', 'Diseases of the circulatory system', 'Cardiology', 'ICD-10 2019', 'High blood pressure with no identified secondary cause.', 1, NOW(), NOW()),
('ICD_10', 'I21.9', 'Acute myocardial infarction, unspecified', 'Diseases of the circulatory system', 'Cardiology', 'ICD-10 2019', 'Unspecified acute heart attack.', 1, NOW(), NOW()),
('ICD_10', 'I50.9', 'Heart failure, unspecified', 'Diseases of the circulatory system', 'Cardiology', 'ICD-10 2019', 'Unspecified type of heart failure.', 1, NOW(), NOW()),
('ICD_10', 'J02.9', 'Acute pharyngitis, unspecified', 'Diseases of the respiratory system', 'Respiratory Medicine', 'ICD-10 2019', 'Unspecified acute sore throat.', 1, NOW(), NOW()),
('ICD_10', 'J18.9', 'Pneumonia, unspecified organism', 'Diseases of the respiratory system', 'Respiratory Medicine', 'ICD-10 2019', 'Pneumonia with organism not specified.', 1, NOW(), NOW()),
('ICD_10', 'J44.9', 'Chronic obstructive pulmonary disease, unspecified', 'Diseases of the respiratory system', 'Respiratory Medicine', 'ICD-10 2019', 'Unspecified COPD.', 1, NOW(), NOW()),
('ICD_10', 'J45.9', 'Asthma, unspecified', 'Diseases of the respiratory system', 'Respiratory Medicine', 'ICD-10 2019', 'Unspecified asthma.', 1, NOW(), NOW()),
('ICD_10', 'K21.9', 'Gastro-oesophageal reflux disease without oesophagitis', 'Diseases of the digestive system', 'Gastroenterology', 'ICD-10 2019', 'GERD without oesophagitis.', 1, NOW(), NOW()),
('ICD_10', 'K29.7', 'Gastritis, unspecified', 'Diseases of the digestive system', 'Gastroenterology', 'ICD-10 2019', 'Unspecified gastritis.', 1, NOW(), NOW()),
('ICD_10', 'K35.80', 'Unspecified acute appendicitis', 'Diseases of the digestive system', 'Gastroenterology', 'ICD-10 2019', 'Acute appendicitis, unspecified.', 1, NOW(), NOW()),
('ICD_10', 'N18.9', 'Chronic kidney disease, unspecified', 'Diseases of the genitourinary system', 'Nephrology', 'ICD-10 2019', 'Unspecified stage chronic kidney disease.', 1, NOW(), NOW()),
('ICD_10', 'N39.0', 'Urinary tract infection, site not specified', 'Diseases of the genitourinary system', 'Nephrology', 'ICD-10 2019', 'UTI of unspecified site.', 1, NOW(), NOW()),
('ICD_10', 'M17.9', 'Osteoarthritis of knee, unspecified', 'Diseases of the musculoskeletal system', 'Orthopaedics', 'ICD-10 2019', 'Unspecified knee osteoarthritis.', 1, NOW(), NOW()),
('ICD_10', 'M54.5', 'Low back pain', 'Diseases of the musculoskeletal system', 'Orthopaedics', 'ICD-10 2019', 'Non-specific low back pain.', 1, NOW(), NOW()),
('ICD_10', 'G40.9', 'Epilepsy, unspecified', 'Diseases of the nervous system', 'Neurology', 'ICD-10 2019', 'Unspecified epilepsy.', 1, NOW(), NOW()),
('ICD_10', 'G43.9', 'Migraine, unspecified', 'Diseases of the nervous system', 'Neurology', 'ICD-10 2019', 'Unspecified migraine.', 1, NOW(), NOW()),
('ICD_10', 'F32.9', 'Major depressive disorder, single episode, unspecified', 'Mental and behavioural disorders', 'Psychiatry', 'ICD-10 2019', 'Unspecified single-episode depression.', 1, NOW(), NOW()),
('ICD_10', 'F41.9', 'Anxiety disorder, unspecified', 'Mental and behavioural disorders', 'Psychiatry', 'ICD-10 2019', 'Unspecified anxiety disorder.', 1, NOW(), NOW()),
('ICD_10', 'O14.9', 'Pre-eclampsia, unspecified', 'Pregnancy, childbirth and the puerperium', 'Obstetrics & Gynaecology', 'ICD-10 2019', 'Unspecified severity pre-eclampsia.', 1, NOW(), NOW()),
('ICD_10', 'O80', 'Single spontaneous delivery', 'Pregnancy, childbirth and the puerperium', 'Obstetrics & Gynaecology', 'ICD-10 2019', 'Normal single spontaneous delivery.', 1, NOW(), NOW()),
('ICD_10', 'R10.4', 'Other and unspecified abdominal pain', 'Symptoms, signs and abnormal findings', 'General Medicine', 'ICD-10 2019', 'Unspecified abdominal pain.', 1, NOW(), NOW()),
('ICD_10', 'R50.9', 'Fever, unspecified', 'Symptoms, signs and abnormal findings', 'General Medicine', 'ICD-10 2019', 'Fever of unspecified cause.', 1, NOW(), NOW()),
('ICD_10', 'S06.0', 'Concussion', 'Injury, poisoning and certain other consequences of external causes', 'Trauma & Emergency', 'ICD-10 2019', 'Traumatic brain concussion.', 1, NOW(), NOW()),
('ICD_10', 'L20.9', 'Atopic dermatitis, unspecified', 'Diseases of the skin and subcutaneous tissue', 'Dermatology', 'ICD-10 2019', 'Unspecified atopic dermatitis.', 1, NOW(), NOW()),
('ICD_10', 'H10.9', 'Conjunctivitis, unspecified', 'Diseases of the eye and adnexa', 'Ophthalmology', 'ICD-10 2019', 'Unspecified conjunctivitis.', 1, NOW(), NOW()),
('ICD_11', '5A11', 'Type 2 diabetes mellitus', 'Endocrine, nutritional or metabolic diseases', 'Endocrinology', 'ICD-11 2022', 'ICD-11 equivalent of type 2 diabetes.', 1, NOW(), NOW()),
('ICD_11', 'BA00', 'Essential hypertension', 'Diseases of the circulatory system', 'Cardiology', 'ICD-11 2022', 'ICD-11 equivalent of essential hypertension.', 1, NOW(), NOW());
