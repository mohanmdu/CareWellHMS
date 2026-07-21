ALTER TABLE patient_report
    ADD COLUMN deleted_at DATETIME NULL,
    ADD COLUMN deleted_by VARCHAR(100) NULL,
    ADD COLUMN delete_reason VARCHAR(500) NULL;
