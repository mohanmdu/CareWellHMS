-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE refund (
    id BIGINT NOT NULL AUTO_INCREMENT,
    appointment_id BIGINT NOT NULL,
    refund_number BIGINT NOT NULL,
    refund_amount DOUBLE NOT NULL,
    reason VARCHAR(500) NULL,
    refunded_by VARCHAR(100) NULL,
    refunded_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_refund_appointment UNIQUE (appointment_id),
    CONSTRAINT uq_refund_number UNIQUE (refund_number),
    CONSTRAINT fk_refund_appointment FOREIGN KEY (appointment_id) REFERENCES appointment (id)
);
