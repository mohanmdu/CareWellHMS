ALTER TABLE department ADD COLUMN published_to_web BIT(1) NOT NULL DEFAULT 0;
ALTER TABLE consultant ADD COLUMN published_to_web BIT(1) NOT NULL DEFAULT 0;
