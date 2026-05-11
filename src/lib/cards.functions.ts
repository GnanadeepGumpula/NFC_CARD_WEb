import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  ADMIN_PASSWORD,
  doAdminDeleteCard,
  doAdminUpsertCard,
  adminLoadAllCards,
  loadPublicCard,
  loadUnlockedCard,
  setupPin,
  signAdminToken,
  verifyAdminToken,
  verifyPin,
  verifyToken,
} from "./cards.server";

export const getCardPublic = createServerFn({ method: "POST" })
  .inputValidator((data: { uniqueId: string }) =>
    z.object({ uniqueId: z.string().min(1).max(64) }).parse(data),
  )
  .handler(async ({ data }) => {
    const card = await loadPublicCard(data.uniqueId);
    return { card };
  });

export const initializePin = createServerFn({ method: "POST" })
  .inputValidator((data: { uniqueId: string; pin: string }) =>
    z
      .object({ uniqueId: z.string().min(1).max(64), pin: z.string().regex(/^\d{4,6}$/) })
      .parse(data),
  )
  .handler(async ({ data }) => setupPin(data.uniqueId, data.pin));

export const unlockCard = createServerFn({ method: "POST" })
  .inputValidator((data: { uniqueId: string; pin: string }) =>
    z
      .object({ uniqueId: z.string().min(1).max(64), pin: z.string().regex(/^\d{4,6}$/) })
      .parse(data),
  )
  .handler(async ({ data }) => verifyPin(data.uniqueId, data.pin));

export const getCardWithToken = createServerFn({ method: "POST" })
  .inputValidator((data: { uniqueId: string; token: string }) =>
    z
      .object({ uniqueId: z.string().min(1).max(64), token: z.string().min(10).max(2000) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (!verifyToken(data.token, data.uniqueId)) return { card: null };
    const card = await loadUnlockedCard(data.uniqueId);
    return { card };
  });

// ---------- Admin ----------
export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) =>
    z.object({ password: z.string().min(1).max(200) }).parse(data),
  )
  .handler(async ({ data }) => {
    if (data.password !== ADMIN_PASSWORD)
      return { ok: false as const, error: "Invalid password" };
    return { ok: true as const, token: signAdminToken() };
  });

const adminCardSchema = z.object({
  uniqueId: z.string().min(1).max(64),
  studentName: z.string().min(1).max(120),
  photoUrl: z.string().url().max(1000).nullish().or(z.literal("")),
  driveUrl: z.string().url().max(1000).nullish().or(z.literal("")),
  spotifyUrl: z.string().url().max(1000).nullish().or(z.literal("")),
  videoUrl: z.string().url().max(1000).nullish().or(z.literal("")),
});

export const adminListCards = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) =>
    z.object({ token: z.string().min(10).max(2000) }).parse(data),
  )
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) return { cards: null, error: "Unauthorized" };
    const cards = await adminLoadAllCards();
    if (!cards) return { cards: null, error: "Failed to load cards" };
    return { cards, error: null };
  });

export const adminUpsertCard = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      token: string;
      card: z.infer<typeof adminCardSchema>;
      resetPin?: boolean;
    }) =>
      z
        .object({
          token: z.string().min(10).max(2000),
          card: adminCardSchema,
          resetPin: z.boolean().optional(),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) return { ok: false as const, error: "Unauthorized" };
    const c = data.card;
    const payload = {
      unique_id: c.uniqueId,
      student_name: c.studentName,
      photo_url: c.photoUrl || null,
      drive_url: c.driveUrl || null,
      spotify_url: c.spotifyUrl || null,
      video_url: c.videoUrl || null,
      ...(data.resetPin ? { pin_hash: null, is_first_time: true } : {}),
    };
    const result = await doAdminUpsertCard(payload);
    return result;
  });

export const adminDeleteCard = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; uniqueId: string }) =>
    z
      .object({ token: z.string().min(10).max(2000), uniqueId: z.string().min(1).max(64) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) return { ok: false as const, error: "Unauthorized" };
    const result = await doAdminDeleteCard(data.uniqueId);
    return result;
  });
