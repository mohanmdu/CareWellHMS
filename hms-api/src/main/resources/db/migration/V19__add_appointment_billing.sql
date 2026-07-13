-- Local-dev provisional migration (see note in V1__baseline.sql).

ALTER TABLE appointment
    ADD COLUMN paid_amount DOUBLE NULL,
    ADD COLUMN discount_amount DOUBLE NULL,
    ADD COLUMN doctor_referral_amount DOUBLE NULL,
    ADD COLUMN payment_mode VARCHAR(32) NULL,
    ADD COLUMN billing_remarks VARCHAR(500) NULL,
    ADD COLUMN billed_at TIMESTAMP(6) NULL;
