-- Local-dev provisional migration (see note in V1__baseline.sql).

ALTER TABLE appointment
    ADD COLUMN invoice_number BIGINT NULL,
    ADD COLUMN billed_by VARCHAR(100) NULL,
    ADD COLUMN refund_amount DOUBLE NULL;
