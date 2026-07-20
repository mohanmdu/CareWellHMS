-- Investigations billing advice items are sourced from the existing OP
-- Billing Catalog (op_billing_component), not the Lab Sub-Category master,
-- so they have no sub_category_id to set.
ALTER TABLE lab_requisition_item MODIFY sub_category_id BIGINT NULL;
