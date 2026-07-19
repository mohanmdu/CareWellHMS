CREATE TABLE cms_news_event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NULL,
    event_date DATE NULL,
    cover_image_path VARCHAR(500) NULL,
    published_at TIMESTAMP(6) NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL
);

CREATE TABLE cms_testimonial (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    quote TEXT NOT NULL,
    rating INT NULL,
    photo_path VARCHAR(500) NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL
);
