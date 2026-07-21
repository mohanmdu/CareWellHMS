ALTER TABLE pre_authorization_request
    ADD COLUMN claim_number VARCHAR(100) NULL,
    ADD COLUMN approved_by VARCHAR(100) NULL,
    ADD COLUMN decided_at DATETIME NULL;
