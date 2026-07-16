-- Internal Receipt / Stock Adjustment - one row per drug/batch adjustment,
-- unified under a transaction_type discriminator matching the legacy
-- single-screen "Select Return Type" selector. Location is descriptive
-- metadata on the transaction only - PharmacyStock stays one global ledger,
-- not partitioned per location (see plan Context).
CREATE TABLE pharmacy_stock_transaction (
    id BIGINT NOT NULL AUTO_INCREMENT,
    stock_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    batch VARCHAR(100) NULL,
    transaction_type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    location_id BIGINT NOT NULL,
    reason VARCHAR(255) NULL,
    updated_by VARCHAR(100) NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_pharmacy_stock_txn_stock FOREIGN KEY (stock_id) REFERENCES pharmacy_stock (id),
    CONSTRAINT fk_pharmacy_stock_txn_location FOREIGN KEY (location_id) REFERENCES pharmacy_location (id),
    CONSTRAINT chk_pharmacy_stock_txn_type CHECK (transaction_type IN ('INTERNAL_RECEIPT', 'STOCK_ADJUSTMENT'))
);
CREATE INDEX idx_pharmacy_stock_txn_stock ON pharmacy_stock_transaction (stock_id);
CREATE INDEX idx_pharmacy_stock_txn_type ON pharmacy_stock_transaction (transaction_type);
CREATE INDEX idx_pharmacy_stock_txn_updated_at ON pharmacy_stock_transaction (updated_at);

-- Batch-wise Stock Modifier's "Qty per Pack" has no existing home - GrnItem's
-- packing is receipt-time history, not a live-editable value.
ALTER TABLE pharmacy_stock ADD COLUMN packing INT NULL DEFAULT 1;

-- Purchase Return - single-step (immediate), unlike Sales Return's
-- PENDING/APPROVED workflow: no separate approval module was requested for
-- this one, so there is no status column at all.
CREATE TABLE pharmacy_purchase_return (
    id BIGINT NOT NULL AUTO_INCREMENT,
    supplier_id BIGINT NOT NULL,
    return_type VARCHAR(20) NOT NULL,
    remarks VARCHAR(500) NULL,
    total_amount DOUBLE NOT NULL DEFAULT 0,
    returned_by VARCHAR(100) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_pharmacy_purchase_return_supplier FOREIGN KEY (supplier_id) REFERENCES supplier (id),
    CONSTRAINT chk_pharmacy_purchase_return_type CHECK (return_type IN ('NORMAL', 'EXPIRED', 'SLOW_MOVING', 'FAST_MOVING', 'NON_MOVING'))
);
CREATE INDEX idx_pharmacy_purchase_return_supplier ON pharmacy_purchase_return (supplier_id);
CREATE INDEX idx_pharmacy_purchase_return_created_at ON pharmacy_purchase_return (created_at);

CREATE TABLE pharmacy_purchase_return_item (
    id BIGINT NOT NULL AUTO_INCREMENT,
    purchase_return_id BIGINT NOT NULL,
    stock_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    batch VARCHAR(100) NULL,
    mrp DOUBLE NULL,
    purchase_rate DOUBLE NULL,
    quantity INT NOT NULL,
    net_amount DOUBLE NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_pharmacy_purchase_return_item_return FOREIGN KEY (purchase_return_id) REFERENCES pharmacy_purchase_return (id),
    CONSTRAINT fk_pharmacy_purchase_return_item_stock FOREIGN KEY (stock_id) REFERENCES pharmacy_stock (id),
    CONSTRAINT chk_pharmacy_purchase_return_item_qty_positive CHECK (quantity > 0)
);
CREATE INDEX idx_pharmacy_purchase_return_item_return ON pharmacy_purchase_return_item (purchase_return_id);

-- Two more locations so Stock Adjustment's default ("Main Store") and
-- Stock Adjustment by Location's IP/OP tiles share the existing
-- pharmacy_location master rather than a second location concept.
INSERT IGNORE INTO pharmacy_location (name, active, created_at, updated_at) VALUES
    ('Main Store', TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('OP', TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));
