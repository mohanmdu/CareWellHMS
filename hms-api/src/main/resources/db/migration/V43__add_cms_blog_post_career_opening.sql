CREATE TABLE cms_blog_post (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    body TEXT NULL,
    cover_image_path VARCHAR(500) NULL,
    published_at TIMESTAMP(6) NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT uq_cms_blog_post_slug UNIQUE (slug)
);

CREATE TABLE cms_career_opening (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department_id BIGINT NULL,
    description TEXT NULL,
    apply_email VARCHAR(255) NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_cms_career_opening_department FOREIGN KEY (department_id) REFERENCES department (id)
);
