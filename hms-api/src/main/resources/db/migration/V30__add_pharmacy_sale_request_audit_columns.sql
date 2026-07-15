-- PharmacySale extends Auditable (created_at/updated_at), but V29 omitted
-- those columns on pharmacy_sale (pharmacy_location/pharmacy_stock/
-- pharmacy_request already had them). Column-existence guarded because MySQL
-- DDL isn't transactional - an earlier partial run of this script may have
-- already added these columns before failing on an unrelated statement.
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'pharmacy_sale' AND column_name = 'created_at'
);
SET @stmt := IF(@col_exists = 0, 'ALTER TABLE pharmacy_sale ADD COLUMN created_at DATETIME(6) NULL', 'SELECT 1');
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'pharmacy_sale' AND column_name = 'updated_at'
);
SET @stmt := IF(@col_exists = 0, 'ALTER TABLE pharmacy_sale ADD COLUMN updated_at DATETIME(6) NULL', 'SELECT 1');
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE pharmacy_sale SET created_at = billed_at, updated_at = billed_at WHERE created_at IS NULL;
ALTER TABLE pharmacy_sale MODIFY COLUMN created_at DATETIME(6) NOT NULL;
ALTER TABLE pharmacy_sale MODIFY COLUMN updated_at DATETIME(6) NOT NULL;
