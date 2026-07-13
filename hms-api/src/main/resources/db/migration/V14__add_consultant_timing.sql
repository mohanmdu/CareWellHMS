-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE consultant_timing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    consultant_id BIGINT NOT NULL,
    day_of_week VARCHAR(16) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT uq_consultant_timing_day UNIQUE (consultant_id, day_of_week),
    CONSTRAINT fk_consultant_timing_consultant FOREIGN KEY (consultant_id) REFERENCES consultant (id)
);
