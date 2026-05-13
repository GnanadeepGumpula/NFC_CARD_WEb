import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/drive-image/$fileId")({
  GET: async ({ request, params }) => {
    const { fileId } = params;

    if (!fileId) {
      return new Response(JSON.stringify({ error: "Missing file ID" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    try {
      // Use Google Drive's direct download endpoint with webContentLink approach
      const url = `https://drive.google.com/uc?id=${encodeURIComponent(fileId)}&export=download`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Sec-Ch-Ua-Mobile": "?0",
        },
      });

      if (!response.ok) {
        console.error(`Drive fetch failed: ${response.status} ${response.statusText}`);
        return new Response(
          JSON.stringify({
            error: "Unable to load image. Please verify the file ID is correct and the file is shared publicly.",
            details: `Drive responded with status ${response.status}`,
          }),
          {
            status: 502,
            headers: { "content-type": "application/json" },
          }
        );
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      const buffer = await response.arrayBuffer();

      return new Response(buffer, {
        status: 200,
        headers: {
          "content-type": contentType,
          "cache-control": "public, max-age=3600",
          "access-control-allow-origin": "*",
        },
      });
    } catch (error) {
      console.error("Drive proxy error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch image",
          message: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        }
      );
    }
  },
});
