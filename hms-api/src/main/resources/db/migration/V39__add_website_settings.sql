ALTER TABLE clinic_settings
  ADD COLUMN website_enabled BIT(1) NOT NULL DEFAULT 0,
  ADD COLUMN domain VARCHAR(255) NULL,
  ADD COLUMN theme_primary_color VARCHAR(9) NULL,
  ADD COLUMN theme_secondary_color VARCHAR(9) NULL,
  ADD COLUMN favicon_path VARCHAR(500) NULL,
  ADD COLUMN seo_default_title VARCHAR(255) NULL,
  ADD COLUMN seo_default_description VARCHAR(500) NULL,
  ADD COLUMN social_facebook_url VARCHAR(255) NULL,
  ADD COLUMN social_instagram_url VARCHAR(255) NULL,
  ADD COLUMN social_youtube_url VARCHAR(255) NULL,
  ADD COLUMN whatsapp_number VARCHAR(20) NULL;
