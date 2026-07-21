ALTER TABLE lab_requisition ADD COLUMN refund_amount DOUBLE NULL;

CREATE TABLE lab_refund (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requisition_id BIGINT NOT NULL,
    refund_number BIGINT NOT NULL,
    refund_amount DOUBLE NOT NULL,
    reason VARCHAR(500) NULL,
    refunded_by VARCHAR(100) NULL,
    refunded_at DATETIME NOT NULL,
    CONSTRAINT uq_lab_refund_requisition UNIQUE (requisition_id),
    CONSTRAINT fk_lab_refund_requisition FOREIGN KEY (requisition_id) REFERENCES lab_requisition (id)
);
