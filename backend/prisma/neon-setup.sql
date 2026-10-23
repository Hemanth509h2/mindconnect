-- One-time setup for MindConnect in STAAD's Neon *app* database
-- (ep-bold-butterfly…, database neondb). Run it in the Neon SQL Editor as
-- neondb_owner, with a strong password of your own in place of CHANGE_ME.
--
-- MindConnect gets its own schemas and a login role that can only use them:
-- it has no access to STAAD's tables in "public".

CREATE ROLE mindconnect WITH LOGIN PASSWORD 'CHANGE_ME';

CREATE SCHEMA mindconnect;      -- production (Vercel)
CREATE SCHEMA mindconnect_dev;  -- local development

GRANT USAGE, CREATE ON SCHEMA mindconnect, mindconnect_dev TO mindconnect;

-- Lets `prisma db push` create and check its schema. The role still can't
-- read or change anything it doesn't own.
GRANT CREATE ON DATABASE neondb TO mindconnect;

-- To remove MindConnect later:
--   DROP SCHEMA mindconnect, mindconnect_dev CASCADE;
--   REVOKE CREATE ON DATABASE neondb FROM mindconnect;
--   DROP ROLE mindconnect;
