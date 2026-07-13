-- Local-dev provisional migration (see note in V1__baseline.sql).

ALTER TABLE consultant
    ADD COLUMN specialization_id BIGINT NULL,
    ADD COLUMN profile TEXT NULL,
    ADD COLUMN address TEXT NULL,
    ADD COLUMN accepting_appointments BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN image_path VARCHAR(255) NULL,
    ADD CONSTRAINT fk_consultant_specialization FOREIGN KEY (specialization_id) REFERENCES specialization (id);

ALTER TABLE consultant DROP COLUMN specialization;
