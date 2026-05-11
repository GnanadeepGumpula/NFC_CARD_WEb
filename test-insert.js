import https from "https";

const SUPABASE_URL = "https://omignhumugcpxqpfzfnp.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9taWduaHVtdWdjcHhxcGZ6Zm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUxNzcxOSwiZXhwIjoyMDk0MDkzNzE5fQ.FM2otd3QN0o9UYb91FBxd-NcEluBwEWse14JUVMgHRA";

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    };

    let payload = "";
    if (body) {
      payload = JSON.stringify(body);
      options.headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            body: parsed,
            rawBody: data,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            rawBody: data,
          });
        }
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function testInsert() {
  console.log("🧪 Testing single card insert...\n");
  
  const testCard = {
    unique_id: "test-card-debug",
    student_name: "Test Debug",
    photo_url: "https://example.com/photo.jpg",
    is_first_time: true,
  };

  console.log("📤 Sending POST to /rest/v1/cards");
  console.log("Card data:", JSON.stringify(testCard, null, 2));
  console.log("Using service role key:", SUPABASE_SERVICE_ROLE_KEY.substring(0, 50) + "...\n");

  const response = await makeRequest("POST", "/rest/v1/cards", testCard);
  
  console.log("📥 Response Status:", response.status);
  console.log("📥 Response Body:", JSON.stringify(response.body, null, 2));
  console.log("📥 Raw Response:", response.rawBody);

  if (response.status >= 200 && response.status < 300) {
    console.log("\n✅ Insert returned success status");
  } else {
    console.log("\n❌ Insert returned error status");
  }

  // Now verify the card exists
  console.log("\n\n🔍 Querying to verify card exists...");
  const queryResponse = await makeRequest(
    "GET",
    `/rest/v1/cards?unique_id=eq.test-card-debug&select=*`
  );
  
  console.log("Query Status:", queryResponse.status);
  console.log("Query Results:", JSON.stringify(queryResponse.body, null, 2));
  
  if (queryResponse.body && queryResponse.body.length > 0) {
    console.log("\n✅ Card IS in database!");
  } else {
    console.log("\n❌ Card NOT found in database!");
  }
}

testInsert().catch(console.error);
