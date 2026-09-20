CREATE TABLE IF NOT EXISTS registrations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'new',
  enquiry_type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organisation TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT '',
  preferred_date TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'website'
);

CREATE INDEX IF NOT EXISTS registrations_created_at_idx
  ON registrations (created_at DESC);

CREATE INDEX IF NOT EXISTS registrations_status_idx
  ON registrations (status);
