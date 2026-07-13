-- Local-dev provisional migration (see note in V1__baseline.sql).

ALTER TABLE consultant ADD COLUMN slots_per_hour INT NOT NULL DEFAULT 1;

ALTER TABLE consultant_timing ADD COLUMN session VARCHAR(16) NOT NULL DEFAULT 'MORNING';
ALTER TABLE consultant_timing ADD CONSTRAINT uq_consultant_timing_day_session UNIQUE (consultant_id, day_of_week, session);
ALTER TABLE consultant_timing DROP INDEX uq_consultant_timing_day;
