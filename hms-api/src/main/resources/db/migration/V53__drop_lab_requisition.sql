-- Removes the provisional Lab & Radiology requisition module (V5) - replaced
-- by a Category/Sub-Category/Component master-data hierarchy (V54) matching
-- the real reference app instead of the placeholder free-text billing-item
-- based requisition flow.
DROP TABLE lab_requisition_item;
DROP TABLE lab_requisition;
