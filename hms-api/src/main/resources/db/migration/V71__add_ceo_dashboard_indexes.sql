-- Indexes for the CEO/MD Dashboard's date-range aggregate queries. Several
-- of these columns are filtered by existing report screens too (Admission
-- Report, Discharge List, Collection Report, Lab Collection Report) but had
-- no index at all until now - those screens benefit from this too, not just
-- the new dashboard.

CREATE INDEX idx_admission_admission_date ON admission (admission_date);
CREATE INDEX idx_admission_discharge_date ON admission (discharge_date);
CREATE INDEX idx_appointment_appointment_date ON appointment (appointment_date);
CREATE INDEX idx_appointment_patient_appointment_date ON appointment (patient_id, appointment_date, id);
CREATE INDEX idx_lab_requisition_approved_at ON lab_requisition (approved_at);
CREATE INDEX idx_ip_billing_line_item_requested_on ON ip_billing_line_item (requested_on);
CREATE INDEX idx_pharmacy_sale_source_billed_at ON pharmacy_sale (source, billed_at);
CREATE INDEX idx_admission_room_history_dates ON admission_room_history (from_date, to_date);
