Generate a Supabase migration SQL file for the schema change described in the prompt argument.

Steps:
1. Determine the next migration number by reading the existing files in `supabase/migrations/` (format: `YYYYMMDDHHMMSS_description.sql`)
2. Generate the timestamp using the current date and time
3. Create the file at `supabase/migrations/<timestamp>_<short-description>.sql`
4. Write valid PostgreSQL SQL that:
   - Uses `IF NOT EXISTS` / `IF EXISTS` guards where appropriate to make the migration idempotent
   - Enables RLS on any new tables: `ALTER TABLE <name> ENABLE ROW LEVEL SECURITY;`
   - Includes appropriate RLS policies for the new table (public read for published content, authenticated insert/update, admin-only delete)
   - Uses `gen_random_uuid()` for UUID primary keys (not `uuid_generate_v4()`)
   - Uses `TIMESTAMPTZ` for all timestamp columns
5. Also generate a corresponding rollback file at `supabase/migrations/<timestamp>_<short-description>.rollback.sql` with the `DROP` statements

After creating the files, print the full content of the migration for review. Do not apply it automatically — remind the user to run `npx supabase db push` after review.
