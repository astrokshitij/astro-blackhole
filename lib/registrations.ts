import "server-only";

import { neon } from "@neondatabase/serverless";

export type RegistrationInput = {
  type: string;
  name: string;
  email: string;
  organisation: string;
  audience: string;
  preferredDate: string;
  message: string;
  source: string;
};

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

export async function saveRegistration(input: RegistrationInput) {
  const sql = database();

  await sql`
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
    )
  `;

  const rows = await sql`
    INSERT INTO registrations (
      enquiry_type,
      name,
      email,
      organisation,
      audience,
      preferred_date,
      message,
      source
    ) VALUES (
      ${input.type},
      ${input.name},
      ${input.email},
      ${input.organisation},
      ${input.audience},
      ${input.preferredDate},
      ${input.message},
      ${input.source}
    )
    RETURNING id
  `;

  return String(rows[0].id);
}
