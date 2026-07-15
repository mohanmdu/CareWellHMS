-- Seeds the 5 pharmacy dispensing locations from the Pharmacy Billing spec
-- (each with a unique Location ID via the auto-increment id). Without this,
-- the new Pharmacy Location master starts empty and the Pharmacy Billing
-- screen has nothing to show in its location picker. INSERT IGNORE so this
-- is a no-op if these rows were already seeded manually (unique constraint
-- on name).
INSERT IGNORE INTO pharmacy_location (name, active, created_at, updated_at) VALUES
    ('ER', TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('IP', TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('Major OT', TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('Minor OT', TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('Pharmacy', TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));
