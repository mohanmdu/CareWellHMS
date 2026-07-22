ALTER TABLE clinic_settings
    ADD COLUMN theme_mode VARCHAR(16) NOT NULL DEFAULT 'LIGHT',
    ADD COLUMN theme_tertiary_color VARCHAR(9) NULL,
    ADD COLUMN font_family VARCHAR(120) NULL,
    ADD COLUMN corner_radius_style VARCHAR(16) NOT NULL DEFAULT 'ROUNDED',
    ADD COLUMN header_background_color VARCHAR(9) NULL,
    ADD COLUMN footer_background_color VARCHAR(9) NULL,
    ADD COLUMN footer_text VARCHAR(500) NULL;
