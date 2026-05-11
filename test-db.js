import https from "https";

const SUPABASE_URL = "https://omignhumugcpxqpfzfnp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9taWduaHVtdWdjcHhxcGZ6Zm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUxNzcxOSwiZXhwIjoyMDk0MDkzNzE5fQ.FM2otd3QN0o9UYb91FBxd-NcEluBwEWse14JUVMgHRA";

async function testDatabase() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/cards`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log("Status:", res.statusCode);
        console.log("Response:", data);
        const parsed = JSON.parse(data);
        console.log(`\n✅ Found ${parsed.length} cards in database:`);
        parsed.forEach((card) => {
          console.log(`   - ${card.unique_id}: ${card.student_name}`);
        });
        resolve();
      });
    });

    req.on("error", (e) => {
      console.error("Error:", e);
      reject(e);
    });

    req.end();
  });
}

testDatabase();
