-- Links a Lab Requisition to the patient's currently-active admission (if
-- any), so Lab & Investigation charges billed while a patient is an
-- inpatient can be pulled into the Patient Billing Advice / IP Billing
-- ledger for that specific admission. Nullable - OP lab requisitions (the
-- overwhelming majority) never set this. Set once at requisition creation
-- time (LabRequisitionService.create()); not retroactively backfilled for
-- pre-existing rows, since there's no reliable way to know after the fact
-- which admission (if any) was active when an old requisition was made.

ALTER TABLE lab_requisition ADD COLUMN admission_id BIGINT NULL AFTER patient_id;
ALTER TABLE lab_requisition ADD CONSTRAINT fk_lab_requisition_admission FOREIGN KEY (admission_id) REFERENCES admission (id);
CREATE INDEX idx_lab_requisition_admission ON lab_requisition (admission_id);
