-- Local-dev provisional migration (see note in V1__baseline.sql).

ALTER TABLE appointment ADD COLUMN cancelled_by VARCHAR(16) NULL;
