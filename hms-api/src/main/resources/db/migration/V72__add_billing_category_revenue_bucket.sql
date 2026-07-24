-- Tags each billing category with which CEO/MD Dashboard revenue slice it
-- rolls up into (see com.pms.masters.entity.RevenueBucket). These 3 masters
-- are free-text, admin-typed, with no fixed taxonomy - this makes "Consulting
-- Fee" vs "Room Rent" vs "Other" a deterministic, admin-correctable setting
-- instead of a guess from the category's display name. The keyword backfill
-- below is best-effort - review the auto-tagged categories via the new
-- "Revenue Bucket" dropdown on each masters screen after this migration runs.

ALTER TABLE ip_billing_category ADD COLUMN revenue_bucket VARCHAR(20) NOT NULL DEFAULT 'OTHER';
ALTER TABLE op_billing_category ADD COLUMN revenue_bucket VARCHAR(20) NOT NULL DEFAULT 'OTHER';
ALTER TABLE lab_category ADD COLUMN revenue_bucket VARCHAR(20) NOT NULL DEFAULT 'LAB';

UPDATE ip_billing_category SET revenue_bucket = 'CONSULTING_FEE'
  WHERE LOWER(name) LIKE '%consult%' OR LOWER(name) LIKE '%doctor fee%' OR LOWER(name) LIKE '%visit fee%';
UPDATE op_billing_category SET revenue_bucket = 'CONSULTING_FEE'
  WHERE LOWER(name) LIKE '%consult%';
UPDATE lab_category SET revenue_bucket = 'RADIOLOGY'
  WHERE LOWER(name) LIKE '%x-ray%' OR LOWER(name) LIKE '%xray%' OR LOWER(name) LIKE '%radiology%'
     OR LOWER(name) LIKE '%scan%' OR LOWER(name) LIKE '%usg%' OR LOWER(name) LIKE '%ultrasound%';

CREATE INDEX idx_ip_billing_category_revenue_bucket ON ip_billing_category (revenue_bucket);
CREATE INDEX idx_op_billing_category_revenue_bucket ON op_billing_category (revenue_bucket);
CREATE INDEX idx_lab_category_revenue_bucket ON lab_category (revenue_bucket);
