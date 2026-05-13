import { json } from "@tanstack/react-start";

export async function proxyDriveImage(fileId: string): Promise<Response> {
  const url = `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return json({ error: "Failed to fetch image" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=86400",
        "access-control-allow-origin": "*",
      },
    });
  } catch (error) {
    console.error("Drive proxy error:", error);
    return json({ error: "Failed to proxy image" }, { status: 500 });
  }
}
