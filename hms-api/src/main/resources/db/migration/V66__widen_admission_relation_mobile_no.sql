-- relation_mobile_no was VARCHAR(20), narrower than every other mobile-number
-- column in this codebase (patient/consultant/general_user all use VARCHAR(32)),
-- causing "Data too long" failures on IP Admission registration.
ALTER TABLE admission
    MODIFY COLUMN relation_mobile_no VARCHAR(32) NULL;
