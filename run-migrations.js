import https from "https";

const SUPABASE_URL = "https://omignhumugcpxqpfzfnp.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9taWduaHVtdWdjcHhxcGZ6Zm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUxNzcxOSwiZXhwIjoyMDk0MDkzNzE5fQ.FM2otd3QN0o9UYb91FBxd-NcEluBwEWse14JUVMgHRA";

const migrationSQL = `
-- Cards table for NFC memory portals
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  photo_url TEXT,
  pin_hash TEXT,
  drive_url TEXT,
  spotify_url TEXT,
  video_url TEXT,
  is_first_time BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_cards_unique_id ON public.cards(unique_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS cards_set_updated_at ON public.cards;

CREATE TRIGGER cards_set_updated_at
BEFORE UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
`;

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(
      "/rest/v1/rpc/exec_sql",
      SUPABASE_URL
    );

    const payload = JSON.stringify({ sql });

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function runMigrations() {
  try {
    console.log("🚀 Starting database migrations...\n");

    const response = await executeSql(migrationSQL);

    if (response.status >= 200 && response.status < 300) {
      console.log("✅ Migrations completed successfully!");
      console.log("📊 Cards table created in Supabase database!");
      process.exit(0);
    } else {
      console.log("⚠️  Response status:", response.status);
      console.log("Response body:", response.body);

      // Check if table already exists
      if (response.body.includes("already exists")) {
        console.log("✅ Table already exists!");
        process.exit(0);
      }

      if (response.status === 404) {
        console.log("📝 SQL execution endpoint not found, but table may exist.");
        console.log(
          "💡 Tip: Verify the tables in Supabase dashboard at:"
        );
        console.log(
          "   https://app.supabase.com/project/omignhumugcpxqpfzfnp/editor"
        );
        process.exit(0);
      }

      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  }
}

runMigrations();
