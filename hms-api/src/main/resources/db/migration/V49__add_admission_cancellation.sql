ALTER TABLE admission ADD COLUMN created_by VARCHAR(150) NULL;
ALTER TABLE admission ADD COLUMN cancelled_at DATETIME(6) NULL;
ALTER TABLE admission ADD COLUMN cancelled_by VARCHAR(150) NULL;
ALTER TABLE admission ADD COLUMN cancellation_reason VARCHAR(500) NULL;
