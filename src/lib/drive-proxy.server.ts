import { json } from "@tanstack/react-start";

export async function proxyDriveImage(fileId: string): Promise<Response> {
  if (!fileId.trim()) {
    return json({ error: "Missing file ID" }, { status: 400 });
  }

  const url = `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600`;

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

    const finalUrl = response.url || "";
    const contentType = response.headers.get("content-type") || "";

    if (finalUrl.includes("accounts.google.com") || !contentType.startsWith("image/")) {
      return json(
        {
          error:
            "Google Drive returned a login page or non-image response. The file must be shared with anyone who has the link.",
        },
        { status: 403 }
      );
    }

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
