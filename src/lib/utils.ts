import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizePhotoUrl(input: string | null | undefined): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withProtocol);
    const host = url.hostname.toLowerCase();

    if (host === "drive.google.com" || host === "docs.google.com") {
      const pathMatch = url.pathname.match(/\/file\/d\/([^/]+)/i);
      const idFromPath = pathMatch?.[1] ?? null;
      const idFromQuery = url.searchParams.get("id");
      const fileId = idFromPath || idFromQuery;
      if (fileId) {
        // Use Google's own image CDN which works for public files
        return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}`;
      }
    }

    return url.toString();
  } catch {
    return withProtocol;
  }
}
