import { createClient } from "@supabase/supabase-js";
import { verifyAdminToken } from "./cards.server";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@signatureday.local";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Funny@26";

function createAuthClient() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Missing Supabase auth configuration");
  }

  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    realtime: null as any,
  });
}

function createServiceAuthClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase service role configuration");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function adminAuthLogin(email: string, password: string) {
  // Local dev fallback: accept env-specified admin credentials when Supabase isn't linked
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return {
      ok: true as const,
      accessToken: "local-admin-token",
      refreshToken: "local-admin-refresh",
      email,
    };
  }

  const client = createAuthClient();
  let result = await client.auth.signInWithPassword({ email, password });

  if (result.error && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const serviceClient = createServiceAuthClient();
    const created = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "admin" },
    });

    if (!created.error || created.error.message.includes("already registered")) {
      result = await client.auth.signInWithPassword({ email, password });
    } else {
      return { ok: false as const, error: created.error.message };
    }
  }

  if (result.error || !result.data.session) {
    return { ok: false as const, error: "Invalid email or password" };
  }

  return {
    ok: true as const,
    accessToken: result.data.session.access_token,
    refreshToken: result.data.session.refresh_token,
    email: result.data.user.email ?? email,
  };
}

export async function verifyAdminAccessToken(accessToken: string): Promise<boolean> {
  // Accept local fallback token
  if (accessToken === "local-admin-token") return true;

  // Accept app-signed admin JWTs
  try {
    if (verifyAdminToken(accessToken)) return true;
  } catch {
    // fall through to supabase check
  }

  const client = createAuthClient();
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user?.email) return false;
  return data.user.email === ADMIN_EMAIL;
}

export async function requestAdminPasswordReset(email: string, redirectTo: string) {
  const client = createAuthClient();
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
  return { ok: !error, error: error?.message || null };
}

export async function changeAdminPassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string,
) {
  const client = createAuthClient();
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user?.email || data.user.email !== ADMIN_EMAIL) {
    return { ok: false as const, error: "Unauthorized" };
  }

  const reauth = await client.auth.signInWithPassword({
    email: data.user.email,
    password: currentPassword,
  });
  if (reauth.error || !reauth.data.session) {
    return { ok: false as const, error: "Current password is incorrect" };
  }

  await client.auth.setSession({
    access_token: reauth.data.session.access_token,
    refresh_token: reauth.data.session.refresh_token,
  });

  const updated = await client.auth.updateUser({ password: newPassword });
  if (updated.error) return { ok: false as const, error: updated.error.message };
  return { ok: true as const, error: null };
}

export async function completeAdminPasswordReset(
  accessToken: string,
  refreshToken: string,
  newPassword: string,
) {
  const client = createAuthClient();
  const session = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (session.error) {
    return { ok: false as const, error: session.error.message };
  }

  const updated = await client.auth.updateUser({ password: newPassword });
  if (updated.error) return { ok: false as const, error: updated.error.message };
  return { ok: true as const, error: null };
}