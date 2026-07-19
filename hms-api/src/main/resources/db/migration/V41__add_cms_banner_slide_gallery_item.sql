CREATE TABLE cms_banner_slide (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500) NULL,
    image_path VARCHAR(500) NULL,
    link_url VARCHAR(500) NULL,
    sort_order INT NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL
);

CREATE TABLE cms_gallery_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(16) NOT NULL,
    title VARCHAR(255) NULL,
    media_path_or_url VARCHAR(500) NULL,
    album VARCHAR(255) NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL
);
