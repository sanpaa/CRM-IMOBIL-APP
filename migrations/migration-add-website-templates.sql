CREATE TABLE IF NOT EXISTS website_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  page_type text NOT NULL,
  html text,
  css text,
  meta_title text,
  meta_description text,
  meta_keywords text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
