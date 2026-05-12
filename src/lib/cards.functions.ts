import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  doAdminDeleteCard,
  doAdminUpsertCard,
  adminLoadAllCards,
  loadPublicCard,
  loadUnlockedCard,
  setupPin,
  updatePin,
  verifyPin,
  verifyToken,
  supabaseRestCall,
} from "./cards.server";
import {
  adminAuthLogin,
  changeAdminPassword,
  completeAdminPasswordReset,
  requestAdminPasswordReset,
  verifyAdminAccessToken,
} from "./admin-auth.server";

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
  .inputValidator((data: { email: string; password: string }) =>
    z
      .object({
        email: z.string().email().max(320),
        password: z.string().min(1).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    return adminAuthLogin(data.email, data.password);
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
    if (!(await verifyAdminAccessToken(data.token)))
      return { cards: null, error: "Unauthorized" };
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
    if (!(await verifyAdminAccessToken(data.token)))
      return { ok: false as const, error: "Unauthorized" };
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
    if (!(await verifyAdminAccessToken(data.token)))
      return { ok: false as const, error: "Unauthorized" };
    const result = await doAdminDeleteCard(data.uniqueId);
    return result;
  });

export const requestAdminPasswordResetFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; redirectTo: string }) =>
    z
      .object({
        email: z.string().email().max(320),
        redirectTo: z.string().url().max(2000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => requestAdminPasswordReset(data.email, data.redirectTo));

export const changeAdminPasswordFn = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; currentPassword: string; newPassword: string }) =>
    z
      .object({
        token: z.string().min(10).max(2000),
        currentPassword: z.string().min(1).max(200),
        newPassword: z.string().min(8).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data }) =>
    changeAdminPassword(data.token, data.currentPassword, data.newPassword),
  );

export const completeAdminPasswordResetFn = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; refreshToken: string; newPassword: string }) =>
    z
      .object({
        accessToken: z.string().min(10).max(4000),
        refreshToken: z.string().min(10).max(4000),
        newPassword: z.string().min(8).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data }) =>
    completeAdminPasswordReset(data.accessToken, data.refreshToken, data.newPassword),
  );

// ---------- Card User Recovery ----------
export const storeCardRecoveryEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { uniqueId: string; token: string; email: string }) =>
    z
      .object({
        uniqueId: z.string().min(1).max(64),
        token: z.string().min(10).max(2000),
        email: z.string().email().max(320),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (!verifyToken(data.token, data.uniqueId)) {
      return { ok: false as const, error: "Unauthorized" };
    }
    // Update card with recovery email
    const { data: result, error } = await supabaseRestCall<{ updated: number }>(
      "PATCH",
      `/rest/v1/cards?unique_id=eq.${encodeURIComponent(data.uniqueId)}`,
      { recovery_email: data.email }
    );
    if (error || !result) return { ok: false as const, error: error || "Failed to update" };
    return { ok: true as const, error: null };
  });

export const changeCardPin = createServerFn({ method: "POST" })
  .inputValidator((data: { uniqueId: string; token: string; currentPin: string; newPin: string }) =>
    z
      .object({
        uniqueId: z.string().min(1).max(64),
        token: z.string().min(10).max(2000),
        currentPin: z.string().regex(/^\d{4,6}$/),
        newPin: z.string().regex(/^\d{4,6}$/),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (!verifyToken(data.token, data.uniqueId)) {
      return { ok: false as const, error: "Unauthorized" };
    }
    // Verify current PIN
    const verify = await verifyPin(data.uniqueId, data.currentPin);
    if (!verify.ok) return { ok: false as const, error: "Current PIN is incorrect" };
    // Update with new PIN (not setupPin which is for first-time setup)
    const update = await updatePin(data.uniqueId, data.newPin);
    return update;
  });
