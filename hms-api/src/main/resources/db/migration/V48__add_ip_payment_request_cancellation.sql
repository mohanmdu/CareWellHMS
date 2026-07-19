ALTER TABLE ip_payment_request ADD COLUMN cancel_reason VARCHAR(500) NULL;
ALTER TABLE ip_payment_request ADD COLUMN cancelled_at TIMESTAMP(6) NULL;
ALTER TABLE ip_payment_request ADD COLUMN cancelled_by VARCHAR(150) NULL;
