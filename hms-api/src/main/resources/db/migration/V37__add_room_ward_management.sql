ALTER TABLE room_type
  CHANGE COLUMN daily_rate rent_cash DOUBLE NOT NULL DEFAULT 0,
  ADD COLUMN rent_claim DOUBLE NOT NULL DEFAULT 0 AFTER rent_cash;

ALTER TABLE room
  ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE' AFTER room_type_id,
  ADD COLUMN active BIT(1) NOT NULL DEFAULT 1;

UPDATE room SET status = 'ALLOCATED' WHERE occupied = TRUE;

ALTER TABLE room DROP COLUMN occupied;

CREATE TABLE room_type_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_type_id BIGINT NOT NULL,
    room_type_name VARCHAR(255) NOT NULL,
    operation VARCHAR(32) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at DATETIME(6) NOT NULL
);
CREATE INDEX idx_room_type_audit_log_performed_at ON room_type_audit_log (performed_at);

CREATE TABLE room_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    operation VARCHAR(32) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at DATETIME(6) NOT NULL
);
CREATE INDEX idx_room_audit_log_performed_at ON room_audit_log (performed_at);
