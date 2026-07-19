CREATE TABLE activity_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    module VARCHAR(64) NOT NULL,
    operation VARCHAR(64) NOT NULL,
    content VARCHAR(1000) NULL,
    previous_content VARCHAR(1000) NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP(6) NOT NULL,
    status VARCHAR(32) NOT NULL,
    patient_uhid VARCHAR(100) NULL,
    patient_name VARCHAR(255) NULL,
    op_number VARCHAR(50) NULL,
    ip_number VARCHAR(50) NULL,
    screen_name VARCHAR(100) NULL,
    remarks VARCHAR(500) NULL,
    INDEX idx_activity_log_performed_at (performed_at)
);
