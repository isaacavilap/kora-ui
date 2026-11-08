-- Who can open the paid parts of kora-ui (template source). Lives in the Istmo Code users database (neondb, next to
-- neon_auth), keyed by neon_auth."user".id. One row = a kora customer. Additive only: no other table changes.
-- No foreign key into neon_auth on purpose: that schema is managed by Neon Auth and must not depend on ours.
CREATE TABLE IF NOT EXISTS public.kora_access (
  user_id    text PRIMARY KEY,
  source     text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'wompi')),
  -- Wompi transaction id (later), or a note for manual grants.
  reference  text,
  granted_at timestamptz NOT NULL DEFAULT now(),
  -- null = no end date.
  expires_at timestamptz,
  revoked_at timestamptz
);
