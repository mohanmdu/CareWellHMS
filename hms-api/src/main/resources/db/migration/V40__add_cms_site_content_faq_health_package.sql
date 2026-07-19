CREATE TABLE cms_site_content (
    id BIGINT PRIMARY KEY,
    about_us_body TEXT NULL,
    mission_body TEXT NULL,
    vision_body TEXT NULL,
    home_intro_title VARCHAR(255) NULL,
    home_intro_body TEXT NULL
);

-- Singleton row (id=1), same seeding rationale as clinic_settings (V18) -
-- GET /api/masters/cms/site-content should never 404.
INSERT INTO cms_site_content (id, about_us_body, mission_body, vision_body, home_intro_title, home_intro_body)
VALUES (1, NULL, NULL, NULL, NULL, NULL);

CREATE TABLE cms_faq (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL
);

CREATE TABLE cms_health_package (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    price DOUBLE NOT NULL DEFAULT 0,
    includes_text TEXT NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL
);
