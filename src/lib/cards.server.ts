import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import https from "https";
import type { PublicCard, UnlockedCard, AdminCardRow } from "./card-types";

const JWT_SECRET =
  process.env.JWT_SECRET || "nfc-portal-default-secret-change-in-production";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Direct REST API calls - avoids Supabase SDK serialization issues
async function supabaseRestCall<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<{ data: T | null; error: string | null }> {
  return new Promise((resolve) => {
    const url = new URL(path, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    };

    let payload = "";
    if (body) {
      payload = JSON.stringify(body);
      (options.headers as any)["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = data ? JSON.parse(data) : null;
            resolve({ data: parsed as T, error: null });
          } else {
            const parsed = data ? JSON.parse(data) : null;
            resolve({
              data: null,
              error: parsed?.message || `HTTP ${res.statusCode}`,
            });
          }
        } catch (e) {
          resolve({ data: null, error: "Failed to parse response" });
        }
      });
    });

    req.on("error", (e) => {
      resolve({ data: null, error: e.message });
    });

    if (payload) req.write(payload);
    req.end();
  });
}

export async function loadPublicCard(uniqueId: string): Promise<PublicCard | null> {
  const { data, error } = await supabaseRestCall<AdminCardRow[]>(
    "GET",
    `/rest/v1/cards?unique_id=eq.${encodeURIComponent(uniqueId)}&select=unique_id,student_name,photo_url,is_first_time`
  );

  if (error || !data || !data[0]) return null;

  const row = data[0];
  return {
    uniqueId: row.unique_id,
    studentName: row.student_name,
    photoUrl: row.photo_url,
    isFirstTime: row.is_first_time,
  };
}

export async function loadUnlockedCard(uniqueId: string): Promise<UnlockedCard | null> {
  const { data, error } = await supabaseRestCall<AdminCardRow[]>(
    "GET",
    `/rest/v1/cards?unique_id=eq.${encodeURIComponent(uniqueId)}&select=*`
  );

  if (error || !data || !data[0]) return null;

  const row = data[0];
  return {
    uniqueId: row.unique_id,
    studentName: row.student_name,
    photoUrl: row.photo_url,
    isFirstTime: row.is_first_time,
    driveUrl: row.drive_url,
    spotifyUrl: row.spotify_url,
    videoUrl: row.video_url,
  };
}

export async function setupPin(uniqueId: string, pin: string) {
  const { data: cards } = await supabaseRestCall<AdminCardRow[]>(
    "GET",
    `/rest/v1/cards?unique_id=eq.${encodeURIComponent(uniqueId)}&select=pin_hash,is_first_time`
  );

  if (!cards || !cards[0]) {
    return { ok: false as const, error: "Card not found" };
  }

  if (cards[0].pin_hash) {
    return { ok: false as const, error: "PIN already set" };
  }

  const hash = await bcrypt.hash(pin, 10);

  const { error } = await supabaseRestCall<null>(
    "PATCH",
    `/rest/v1/cards?unique_id=eq.${encodeURIComponent(uniqueId)}`,
    { pin_hash: hash, is_first_time: false }
  );

  if (error) return { ok: false as const, error };
  return { ok: true as const, token: signToken(uniqueId) };
}

export async function verifyPin(uniqueId: string, pin: string) {
  const { data: cards } = await supabaseRestCall<AdminCardRow[]>(
    "GET",
    `/rest/v1/cards?unique_id=eq.${encodeURIComponent(uniqueId)}&select=pin_hash`
  );

  if (!cards || !cards[0]?.pin_hash) {
    return { ok: false as const, error: "PIN not set" };
  }

  const match = await bcrypt.compare(pin, cards[0].pin_hash);
  if (!match) return { ok: false as const, error: "Incorrect PIN" };
  return { ok: true as const, token: signToken(uniqueId) };
}

export function signToken(uniqueId: string) {
  return jwt.sign({ uniqueId }, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string, uniqueId: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { uniqueId: string };
    return decoded.uniqueId === uniqueId;
  } catch {
    return false;
  }
}

export function signAdminToken() {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "12h" });
}

export function verifyAdminToken(token: string): boolean {
  try {
    const d = jwt.verify(token, JWT_SECRET) as { role: string };
    return d.role === "admin";
  } catch {
    return false;
  }
}

export async function adminLoadAllCards(): Promise<AdminCardRow[] | null> {
  const { data, error } = await supabaseRestCall<AdminCardRow[]>(
    "GET",
    "/rest/v1/cards?select=*&order=created_at.desc"
  );
  return error ? null : data;
}

export async function doAdminUpsertCard(payload: Record<string, any>): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const { error } = await supabaseRestCall<null>(
    "POST",
    "/rest/v1/cards",
    payload
  );
  return { ok: !error, error: error || null };
}

export async function doAdminDeleteCard(uniqueId: string): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const { error } = await supabaseRestCall<null>(
    "DELETE",
    `/rest/v1/cards?unique_id=eq.${encodeURIComponent(uniqueId)}`
  );
  return { ok: !error, error: error || null };
}
