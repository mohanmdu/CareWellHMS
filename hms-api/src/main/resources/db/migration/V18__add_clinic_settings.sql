-- Local-dev provisional migration (see note in V1__baseline.sql).

CREATE TABLE clinic_settings (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NULL,
    phone VARCHAR(64) NULL,
    email VARCHAR(255) NULL,
    logo_path VARCHAR(255) NULL
);

-- Singleton row (id=1) - seeded so GET /api/settings/clinic never 404s;
-- admins edit these values via the Clinic Settings screen per deployment.
INSERT INTO clinic_settings (id, name, address, phone, email, logo_path)
VALUES (1, 'Your Hospital Name', 'Enter your address in Clinic Settings', NULL, NULL, NULL);
