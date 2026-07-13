-- Retire the earlier thin Pharmacy module (Drug/DrugBatch/PharmacySale) in
-- favor of the richer Inventory Master masters below. V6 was already
-- flagged "local-dev provisional"; nothing outside this module referenced
-- these tables except the Dashboard's Pharmacy Revenue KPI (removed in the
-- same change, see DashboardService/DashboardDto).
DROP TABLE IF EXISTS pharmacy_sale_item;
DROP TABLE IF EXISTS pharmacy_sale;
DROP TABLE IF EXISTS drug_batch;
DROP TABLE IF EXISTS drug;

CREATE TABLE supplier (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    contact_person_name VARCHAR(255) NULL,
    mobile_number VARCHAR(20) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NULL,
    landline_number VARCHAR(20) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE manufacturer (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    contact_person_name VARCHAR(255) NULL,
    phone_number VARCHAR(20) NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE product_type (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_product_type_name UNIQUE (name)
);

CREATE TABLE rack (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_rack_name UNIQUE (name)
);

CREATE TABLE product (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    product_type_id BIGINT NOT NULL,
    product_category VARCHAR(255) NULL,
    drug_dosage VARCHAR(255) NULL,
    drug_type VARCHAR(255) NULL,
    rack_id BIGINT NOT NULL,
    manufacturer_id BIGINT NULL,
    med_or_non_med VARCHAR(20) NOT NULL,
    central_gst DOUBLE NOT NULL DEFAULT 0,
    state_gst DOUBLE NOT NULL DEFAULT 0,
    hsn_sac VARCHAR(50) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_product_product_type FOREIGN KEY (product_type_id) REFERENCES product_type (id),
    CONSTRAINT fk_product_rack FOREIGN KEY (rack_id) REFERENCES rack (id),
    CONSTRAINT fk_product_manufacturer FOREIGN KEY (manufacturer_id) REFERENCES manufacturer (id)
);
CREATE INDEX idx_product_product_type ON product (product_type_id);
CREATE INDEX idx_product_rack ON product (rack_id);
CREATE INDEX idx_product_manufacturer ON product (manufacturer_id);
