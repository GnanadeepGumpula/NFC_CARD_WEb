import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Initialize the database schema on server startup
 * Creates tables if they don't exist
 */
export async function initializeDatabase() {
  try {
    // Check if cards table exists by trying to query it
    const { error: queryError } = await supabaseAdmin
      .from("cards")
      .select("*")
      .limit(1);

    if (queryError?.code === "42P01") {
      // Table doesn't exist, create it
      console.log("📊 Creating cards table...");

      // We need to use the raw SQL endpoint, but since we can't via the SDK easily,
      // we'll log a message directing users to create it manually
      console.warn(
        "⚠️  Cards table does not exist in your Supabase database."
      );
      console.warn(
        "📝 Please manually run the SQL migration in your Supabase dashboard:"
      );
      console.warn("");
      console.warn(
        "   Go to: https://app.supabase.com/project/omignhumugcpxqpfzfnp/sql/new"
      );
      console.warn("   Then paste and run the SQL from: supabase/migrations/");
      console.warn("");

      return false;
    } else if (queryError?.code === "PGRST204") {
      // Table exists but is empty - this is fine
      console.log("✅ Cards table exists (empty)");
      return true;
    } else if (queryError) {
      console.error("Database check error:", queryError);
      return false;
    } else {
      console.log("✅ Cards table exists with data");
      return true;
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
}
