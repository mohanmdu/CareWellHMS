CREATE TABLE lab_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    op_amount DOUBLE NOT NULL DEFAULT 0,
    ip_amount DOUBLE NOT NULL DEFAULT 0,
    ordering_no INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    UNIQUE KEY uk_lab_category_name (name)
);

CREATE TABLE lab_sub_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    op_amount DOUBLE NOT NULL DEFAULT 0,
    ip_amount DOUBLE NOT NULL DEFAULT 0,
    notes TEXT NULL,
    ordering_no INT NOT NULL DEFAULT 0,
    heading VARCHAR(255) NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_lab_sub_category_category FOREIGN KEY (category_id) REFERENCES lab_category (id)
);

CREATE TABLE lab_component (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sub_category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    field_type VARCHAR(100) NULL,
    sample_type VARCHAR(100) NULL,
    method VARCHAR(100) NULL,
    male_range_from VARCHAR(50) NULL,
    male_range_to VARCHAR(50) NULL,
    female_range_from VARCHAR(50) NULL,
    female_range_to VARCHAR(50) NULL,
    normal_range TEXT NULL,
    units VARCHAR(50) NULL,
    ordering_no INT NOT NULL DEFAULT 0,
    component_heading VARCHAR(255) NULL,
    conventional_factor VARCHAR(100) NULL,
    si_unit VARCHAR(100) NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_lab_component_sub_category FOREIGN KEY (sub_category_id) REFERENCES lab_sub_category (id)
);
