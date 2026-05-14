import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractGoogleDriveFileId(input: string | null | undefined): string | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withProtocol);
    const host = url.hostname.toLowerCase();

    if (host !== "drive.google.com" && host !== "docs.google.com") {
      return null;
    }

    const pathMatch = url.pathname.match(/\/file\/d\/([^/]+)/i);
    const idFromPath = pathMatch?.[1] ?? null;
    const idFromPreviewPath = url.pathname.match(/\/(?:preview|view)\/([^/]+)/i)?.[1] ?? null;
    const idFromQuery = url.searchParams.get("id");

    return idFromPath || idFromPreviewPath || idFromQuery;
  } catch {
    return null;
  }
}

export function normalizePhotoUrl(input: string | null | undefined): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withProtocol);
    const fileId = extractGoogleDriveFileId(url.toString());
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600`;
    }

    return url.toString();
  } catch {
    return withProtocol;
  }
}
