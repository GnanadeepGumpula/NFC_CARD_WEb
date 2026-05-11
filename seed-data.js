import https from "https";

const SUPABASE_URL = "https://omignhumugcpxqpfzfnp.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9taWduaHVtdWdjcHhxcGZ6Zm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUxNzcxOSwiZXhwIjoyMDk0MDkzNzE5fQ.FM2otd3QN0o9UYb91FBxd-NcEluBwEWse14JUVMgHRA";

const sampleCards = [
  {
    unique_id: "demo",
    student_name: "Demo User",
    photo_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    drive_url: "https://drive.google.com/",
    spotify_url: "https://open.spotify.com/",
    video_url: "https://www.youtube.com/",
    is_first_time: true,
  },
  {
    unique_id: "card001",
    student_name: "Sarah Johnson",
    photo_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    drive_url:
      "https://drive.google.com/drive/folders/1ABC123?usp=sharing",
    spotify_url:
      "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYsB",
    video_url:
      "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
    is_first_time: false,
  },
  {
    unique_id: "card002",
    student_name: "Michael Chen",
    photo_url:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    drive_url:
      "https://drive.google.com/drive/folders/1XYZ789?usp=sharing",
    spotify_url:
      "https://open.spotify.com/playlist/37i9dQZF1DXbTxeAqix7",
    video_url:
      "https://www.youtube.com/playlist?list=PLsomething123",
    is_first_time: false,
  },
  {
    unique_id: "card003",
    student_name: "Emma Rodriguez",
    photo_url:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    drive_url:
      "https://drive.google.com/drive/folders/1DEF456?usp=sharing",
    spotify_url:
      "https://open.spotify.com/playlist/37i9dQZF1DXaXB0",
    video_url:
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    is_first_time: false,
  },
  {
    unique_id: "card004",
    student_name: "James Wilson",
    photo_url:
      "https://images.unsplash.com/photo-1507009997318-601c66f096e0?w=400&h=400&fit=crop",
    drive_url:
      "https://drive.google.com/drive/folders/1GHI789?usp=sharing",
    spotify_url:
      "https://open.spotify.com/playlist/37i9dQZF1DXcKBIy",
    video_url:
      "https://www.youtube.com/playlist?list=PLtest456",
    is_first_time: true,
  },
];

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

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            body: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on("error", reject);

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function checkCardExists(uniqueId) {
  const response = await makeRequest(
    "GET",
    `/rest/v1/cards?unique_id=eq.${encodeURIComponent(uniqueId)}&select=unique_id`
  );
  return response.status === 200 && response.body && response.body.length > 0;
}

async function insertCard(card) {
  const response = await makeRequest("POST", "/rest/v1/cards", card);
  return {
    status: response.status,
    success: response.status === 201,
    error: response.body?.message || response.body?.error,
  };
}

async function seedDatabase() {
  try {
    console.log("🌱 Starting to seed sample data...\n");

    let insertedCount = 0;
    let skippedCount = 0;

    for (const card of sampleCards) {
      // Check if card already exists
      const exists = await checkCardExists(card.unique_id);

      if (exists) {
        console.log(
          `⏭️  Skipped: "${card.student_name}" (${card.unique_id}) - already exists`
        );
        skippedCount++;
        continue;
      }

      // Insert new card
      const result = await insertCard(card);

      if (result.success) {
        console.log(`✅ Added: "${card.student_name}" (${card.unique_id})`);
        insertedCount++;
      } else {
        console.error(
          `❌ Error inserting ${card.student_name}:`,
          result.error
        );
      }
    }

    console.log("\n📊 Seeding Summary:");
    console.log(`   ✅ Inserted: ${insertedCount} cards`);
    console.log(`   ⏭️  Skipped: ${skippedCount} cards`);
    console.log(`   📝 Total: ${sampleCards.length} sample cards\n`);

    console.log("🎉 Sample data seeding complete!\n");
    console.log("📱 Try these unique IDs to view cards:");
    sampleCards.forEach((card) => {
      console.log(`   • http://localhost:8081/card/${card.unique_id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
}

seedDatabase();
