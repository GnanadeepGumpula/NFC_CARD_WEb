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
import { signToken, signAdminToken } from "./cards.server";
import nodemailer from "nodemailer";
import {
  adminAuthLogin,
  changeAdminPassword,
  completeAdminPasswordReset,
  requestAdminPasswordReset,
  verifyAdminAccessToken,
  ADMIN_EMAIL,
} from "./admin-auth.server";
import { ADMIN_PASSWORD } from "./admin-auth.server";

export const getCardPublic = createServerFn({ method: "POST" })
  .inputValidator((data: { uniqueId: string }) =>
    z.object({ uniqueId: z.string().min(1).max(64) }).parse(data),
  )
  .handler(async ({ data }) => {
    const card = await loadPublicCard(data.uniqueId);
    return { card };
  });

// Reset card PIN using a valid token (no current PIN required)
export const resetCardPin = createServerFn({ method: "POST" })
  .inputValidator((data: { uniqueId: string; token: string; newPin: string }) =>
    z
      .object({
        uniqueId: z.string().min(1).max(64),
        token: z.string().min(10),
        newPin: z.string().min(4).max(12),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    // Verify token
    if (!verifyToken(data.token, data.uniqueId)) {
      return { ok: false as const, error: "Invalid or expired token" };
    }

    // Update PIN via server helper
    try {
      const r = await updatePin(data.uniqueId, data.newPin);
      if (!r.ok) return { ok: false as const, error: r.error || "Failed to update PIN" };
      return { ok: true as const, error: null };
    } catch (e: any) {
      return { ok: false as const, error: e?.message || "Failed to reset PIN" };
    }
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
    z
      .object({
        password: z.string().min(1).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    // Password-only UI, hidden admin email on the server.
    return adminAuthLogin(process.env.ADMIN_EMAIL || ADMIN_EMAIL, data.password);
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
    // allow saving during first-time setup (token present) or when token verifies
    if (data.token) {
      if (!verifyToken(data.token, data.uniqueId)) {
        return { ok: false as const, error: "Unauthorized" };
      }
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

// Request PIN reset: sends email to stored recovery_email with reset link
export const requestCardPinReset = createServerFn({ method: "POST" })
  .inputValidator((data: { uniqueId: string }) =>
    z
      .object({
        uniqueId: z.string().min(1).max(64),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    // Lookup recovery email
    const { data: cards, error } = await supabaseRestCall<{ recovery_email: string }[]>(
      "GET",
      `/rest/v1/cards?unique_id=eq.${encodeURIComponent(data.uniqueId)}&select=recovery_email`
    );
    if (error || !cards || !cards[0] || !cards[0].recovery_email) {
      return { ok: false as const, error: "No recovery email set for this card" };
    }
    const to = cards[0].recovery_email;

    // Generate a short-lived token for reset (use signToken)
    const token = signToken(data.uniqueId);

    // Build reset URL (frontend route)
    const RESET_BASE = process.env.APP_URL || process.env.VERCEL_URL || "http://localhost:8080";
    const resetUrl = `${RESET_BASE.replace(/\/+$/,'')}/card/${encodeURIComponent(data.uniqueId)}/reset?token=${encodeURIComponent(token)}`;

    // Send email via SMTP (nodemailer) if configured
    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost) {
      // For environments without SMTP, return resetUrl so developer can copy it
      return { ok: true as const, error: null, resetUrl } as any;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: (process.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailFrom = process.env.EMAIL_FROM || `no-reply@${new URL(process.env.APP_URL || RESET_BASE).hostname}`;

    try {
      await transporter.sendMail({
        from: mailFrom,
        to,
        subject: "Signatureday — PIN reset",
        text: `Use this link to reset your PIN: ${resetUrl}`,
        html: `<p>Use this link to reset your PIN:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });
      return { ok: true as const, error: null };
    } catch (e: any) {
      return { ok: false as const, error: e.message || "Failed to send email" };
    }
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
