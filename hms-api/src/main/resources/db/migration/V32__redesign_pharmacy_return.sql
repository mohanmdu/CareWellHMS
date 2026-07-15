-- The V29 pharmacy_return table modeled a return as one unconditional insert
-- per sale-item line, with no status/workflow and no header grouping
-- multiple lines into a single submission. It's replaced by a header
-- (pharmacy_return) + lines (pharmacy_return_item) model so "Sales Return by
-- Invoice" can add several line items to one return-in-progress before a
-- single PENDING submission, and "Sales Return Approval" flips the whole
-- batch to APPROVED atomically (crediting stock for every line) - see
-- PharmacyReturnService. No production data exists against the old shape
-- (POST /api/pharmacy/returns had zero frontend callers), so the old table
-- is dropped and recreated rather than migrated column-by-column.
DROP TABLE IF EXISTS pharmacy_return;

CREATE TABLE pharmacy_return (
    id BIGINT NOT NULL AUTO_INCREMENT,
    sale_id BIGINT NOT NULL,
    return_type VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_amount DOUBLE NOT NULL DEFAULT 0,
    remarks VARCHAR(500) NULL,
    submitted_by VARCHAR(100) NULL,
    submitted_at DATETIME(6) NOT NULL,
    approved_by VARCHAR(100) NULL,
    approved_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_pharmacy_return_sale FOREIGN KEY (sale_id) REFERENCES pharmacy_sale (id),
    CONSTRAINT chk_pharmacy_return_status CHECK (status IN ('PENDING', 'APPROVED')),
    CONSTRAINT chk_pharmacy_return_type CHECK (return_type IN ('CASH', 'CASHLESS'))
);
CREATE INDEX idx_pharmacy_return_sale ON pharmacy_return (sale_id);
CREATE INDEX idx_pharmacy_return_status ON pharmacy_return (status);
CREATE INDEX idx_pharmacy_return_submitted_at ON pharmacy_return (submitted_at);

CREATE TABLE pharmacy_return_item (
    id BIGINT NOT NULL AUTO_INCREMENT,
    return_id BIGINT NOT NULL,
    sale_item_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    batch VARCHAR(100) NULL,
    mrp DOUBLE NULL,
    quantity INT NOT NULL,
    amount DOUBLE NOT NULL,
    sgst_percent DOUBLE NULL,
    sgst_amount DOUBLE NOT NULL DEFAULT 0,
    cgst_percent DOUBLE NULL,
    cgst_amount DOUBLE NOT NULL DEFAULT 0,
    net_amount DOUBLE NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_pharmacy_return_item_return FOREIGN KEY (return_id) REFERENCES pharmacy_return (id),
    CONSTRAINT fk_pharmacy_return_item_sale_item FOREIGN KEY (sale_item_id) REFERENCES pharmacy_sale_item (id),
    CONSTRAINT chk_pharmacy_return_item_qty_positive CHECK (quantity > 0)
);
CREATE INDEX idx_pharmacy_return_item_return ON pharmacy_return_item (return_id);
CREATE INDEX idx_pharmacy_return_item_sale_item ON pharmacy_return_item (sale_item_id);
