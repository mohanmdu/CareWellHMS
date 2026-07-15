CREATE TABLE purchase_order (
    id BIGINT NOT NULL AUTO_INCREMENT,
    po_number BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL,
    comments VARCHAR(1000) NULL,
    created_by VARCHAR(100) NULL,
    approved_by VARCHAR(100) NULL,
    approved_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_purchase_order_number UNIQUE (po_number),
    CONSTRAINT fk_purchase_order_supplier FOREIGN KEY (supplier_id) REFERENCES supplier (id)
);

CREATE TABLE purchase_order_item (
    id BIGINT NOT NULL AUTO_INCREMENT,
    purchase_order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_type_name VARCHAR(255) NULL,
    packing INT NOT NULL DEFAULT 1,
    qty INT NOT NULL,
    total_qty INT NOT NULL,
    order_qty INT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_po_item_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_order (id),
    CONSTRAINT fk_po_item_product FOREIGN KEY (product_id) REFERENCES product (id)
);
CREATE INDEX idx_po_item_po ON purchase_order_item (purchase_order_id);

CREATE TABLE grn (
    id BIGINT NOT NULL AUTO_INCREMENT,
    supplier_id BIGINT NOT NULL,
    purchase_type VARCHAR(20) NOT NULL,
    invoice_no VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    invoice_amount DOUBLE NOT NULL DEFAULT 0,
    po_number VARCHAR(50) NULL,
    grn_date DATE NOT NULL,
    grn_amount DOUBLE NOT NULL DEFAULT 0,
    discount_amount DOUBLE NULL DEFAULT 0,
    credit_note VARCHAR(100) NULL,
    debit_note VARCHAR(100) NULL,
    return_amount DOUBLE NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    created_by VARCHAR(100) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_grn_supplier FOREIGN KEY (supplier_id) REFERENCES supplier (id)
);

CREATE TABLE grn_item (
    id BIGINT NOT NULL AUTO_INCREMENT,
    grn_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_type_name VARCHAR(255) NULL,
    packing INT NOT NULL DEFAULT 1,
    qty INT NOT NULL,
    total_qty INT NOT NULL,
    free_qty INT NOT NULL DEFAULT 0,
    batch VARCHAR(100) NULL,
    expiry_date DATE NULL,
    manufacture_date DATE NULL,
    mrp DOUBLE NULL,
    purchase_rate DOUBLE NOT NULL,
    discount_percent DOUBLE NULL DEFAULT 0,
    discount_amount DOUBLE NULL DEFAULT 0,
    hsn_sac VARCHAR(50) NULL,
    sgst_percent DOUBLE NULL DEFAULT 0,
    sgst_amount DOUBLE NOT NULL DEFAULT 0,
    cgst_percent DOUBLE NULL DEFAULT 0,
    cgst_amount DOUBLE NOT NULL DEFAULT 0,
    net_value DOUBLE NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_grn_item_grn FOREIGN KEY (grn_id) REFERENCES grn (id),
    CONSTRAINT fk_grn_item_product FOREIGN KEY (product_id) REFERENCES product (id)
);
CREATE INDEX idx_grn_item_grn ON grn_item (grn_id);
