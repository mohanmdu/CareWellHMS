CREATE TABLE ip_billing_line_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admission_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    consultant_id BIGINT NULL,
    component_id BIGINT NOT NULL,
    remarks VARCHAR(500) NULL,
    quantity INT NOT NULL,
    unit_amount DOUBLE NOT NULL,
    units VARCHAR(32) NULL,
    line_total DOUBLE NOT NULL,
    discount_amount DOUBLE NOT NULL DEFAULT 0,
    refund_amount DOUBLE NOT NULL DEFAULT 0,
    discount_reason VARCHAR(500) NULL,
    requested_on TIMESTAMP(6) NOT NULL,
    created_by VARCHAR(150) NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_ip_billing_line_item_admission FOREIGN KEY (admission_id) REFERENCES admission (id),
    CONSTRAINT fk_ip_billing_line_item_category FOREIGN KEY (category_id) REFERENCES ip_billing_category (id),
    CONSTRAINT fk_ip_billing_line_item_consultant FOREIGN KEY (consultant_id) REFERENCES consultant (id),
    CONSTRAINT fk_ip_billing_line_item_component FOREIGN KEY (component_id) REFERENCES ip_billing_component (id)
);

CREATE TABLE ip_payment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admission_id BIGINT NOT NULL,
    payment_date TIMESTAMP(6) NOT NULL,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    payment_type VARCHAR(32) NULL,
    invoiced_amount DOUBLE NOT NULL DEFAULT 0,
    refund_amount DOUBLE NOT NULL DEFAULT 0,
    net_amount DOUBLE NOT NULL DEFAULT 0,
    created_by VARCHAR(150) NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_ip_payment_admission FOREIGN KEY (admission_id) REFERENCES admission (id)
);
