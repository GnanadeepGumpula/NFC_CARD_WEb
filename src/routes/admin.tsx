import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  adminDeleteCard,
  adminListCards,
  adminLogin,
  adminUpsertCard,
  changeAdminPasswordFn,
  completeAdminPasswordResetFn,
  requestAdminPasswordResetFn,
} from "@/lib/cards.functions";
import type { AdminCardRow } from "@/lib/card-types";
import {
  Loader2,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  KeyRound,
  Mail,
  LockKeyhole,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Signatureday Memory Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const ADMIN_TOKEN_KEY = "signatureday.admin.tok";
const ADMIN_EMAIL_KEY = "signatureday.admin.email";
const DEFAULT_ADMIN_EMAIL = "admin@signatureday.local";

type Draft = {
  uniqueId: string;
  studentName: string;
  photoUrl: string;
  driveUrl: string;
  spotifyUrl: string;
  videoUrl: string;
};

const emptyDraft: Draft = {
  uniqueId: "",
  studentName: "",
  photoUrl: "",
  driveUrl: "",
  spotifyUrl: "",
  videoUrl: "",
};

function AdminPage() {
  const loginFn = useServerFn(adminLogin);
  const listFn = useServerFn(adminListCards);
  const upsertFn = useServerFn(adminUpsertCard);
  const deleteFn = useServerFn(adminDeleteCard);
  const requestResetFn = useServerFn(requestAdminPasswordResetFn);
  const changePasswordFn = useServerFn(changeAdminPasswordFn);
  const completeResetFn = useServerFn(completeAdminPasswordResetFn);

  const [token, setToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [cards, setCards] = useState<AdminCardRow[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changeCurrentPassword, setChangeCurrentPassword] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");
  const [changeConfirmPassword, setChangeConfirmPassword] = useState("");
  const [changePasswordErr, setChangePasswordErr] = useState<string | null>(null);
  const [changePasswordMsg, setChangePasswordMsg] = useState<string | null>(null);

  const [showResetRequest, setShowResetRequest] = useState(false);
  const [resetEmail, setResetEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [resetRequestErr, setResetRequestErr] = useState<string | null>(null);
  const [resetRequestMsg, setResetRequestMsg] = useState<string | null>(null);

  const [recoveryAccessToken, setRecoveryAccessToken] = useState<string | null>(null);
  const [recoveryRefreshToken, setRecoveryRefreshToken] = useState<string | null>(null);
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");
  const [recoveryErr, setRecoveryErr] = useState<string | null>(null);
  const [recoveryMsg, setRecoveryMsg] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    const storedEmail = localStorage.getItem(ADMIN_EMAIL_KEY);
    if (storedToken) setToken(storedToken);
    if (storedEmail) {
      setAdminEmail(storedEmail);
      setResetEmail(storedEmail);
    }

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashType = hashParams.get("type");
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (hashType === "recovery" && accessToken && refreshToken) {
      setRecoveryAccessToken(accessToken);
      setRecoveryRefreshToken(refreshToken);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const refresh = async (tok: string) => {
    const r = await listFn({ data: { token: tok } });
    if (r.cards) setCards(r.cards as AdminCardRow[]);
    else if (r.error === "Unauthorized") {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setToken(null);
      setCards(null);
    }
  };

  useEffect(() => {
    if (token) refresh(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setLoginErr(null);
    const r = await loginFn({ data: { password } });
    setBusy(false);
    if (!r.ok) {
      setLoginErr(r.error);
      return;
    }
    localStorage.setItem(ADMIN_TOKEN_KEY, r.accessToken);
    localStorage.setItem(ADMIN_EMAIL_KEY, "");
    setToken(r.accessToken);
    setAdminEmail("");
    setPassword("");
    setChangePasswordMsg(null);
    setResetRequestMsg(null);
  };

  const onSave = async (resetPin = false) => {
    if (!draft || !token) return;
    // Basic client-side validation
    const uid = draft.uniqueId.trim();
    const name = draft.studentName.trim();
    if (!uid) return alert("Unique ID is required");
    if (!name) return alert("Student name is required");

    // Normalize photo URL: if user entered without protocol, assume https
    let photo = draft.photoUrl.trim();
    if (photo && !/^https?:\/\//i.test(photo)) photo = `https://${photo}`;

    setBusy(true);
    const r = await upsertFn({
      data: {
        token,
        resetPin,
        card: {
          uniqueId: uid,
          studentName: name,
          photoUrl: photo || null,
          driveUrl: draft.driveUrl.trim() || null,
          spotifyUrl: draft.spotifyUrl.trim() || null,
          videoUrl: draft.videoUrl.trim() || null,
        },
      },
    });
    setBusy(false);
    if (!r.ok) {
      alert(r.error || "Failed to save card");
      return;
    }
    setDraft(null);
    setEditingId(null);
    refresh(token);
  };

  const onDelete = async (uid: string) => {
    if (!token) return;
    if (!confirm(`Delete card ${uid}?`)) return;
    await deleteFn({ data: { token, uniqueId: uid } });
    refresh(token);
  };

  const onRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setResetRequestErr(null);
    setResetRequestMsg(null);
    const r = await requestResetFn({
      data: {
        email: resetEmail,
        redirectTo: `${window.location.origin}/admin`,
      },
    });
    setBusy(false);
    if (!r.ok) {
      setResetRequestErr(r.error);
      return;
    }
    setShowResetRequest(false);
    setResetRequestMsg("Password reset email sent. Check your inbox.");
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (changeNewPassword !== changeConfirmPassword) {
      setChangePasswordErr("New passwords do not match.");
      return;
    }
    setBusy(true);
    setChangePasswordErr(null);
    setChangePasswordMsg(null);
    const r = await changePasswordFn({
      data: {
        token,
        currentPassword: changeCurrentPassword,
        newPassword: changeNewPassword,
      },
    });
    setBusy(false);
    if (!r.ok) {
      setChangePasswordErr(r.error);
      return;
    }
    setChangeCurrentPassword("");
    setChangeNewPassword("");
    setChangeConfirmPassword("");
    setShowChangePassword(false);
    setChangePasswordMsg("Password updated successfully.");
  };

  const onCompleteRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryAccessToken || !recoveryRefreshToken) return;
    if (recoveryPassword !== recoveryConfirmPassword) {
      setRecoveryErr("New passwords do not match.");
      return;
    }
    setBusy(true);
    setRecoveryErr(null);
    setRecoveryMsg(null);
    const r = await completeResetFn({
      data: {
        accessToken: recoveryAccessToken,
        refreshToken: recoveryRefreshToken,
        newPassword: recoveryPassword,
      },
    });
    setBusy(false);
    if (!r.ok) {
      setRecoveryErr(r.error);
      return;
    }
    setRecoveryPassword("");
    setRecoveryConfirmPassword("");
    setRecoveryAccessToken(null);
    setRecoveryRefreshToken(null);
    setRecoveryMsg("Password reset complete. Log in with your new password.");
  };

  if (recoveryAccessToken && recoveryRefreshToken) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <motion.form
          onSubmit={onCompleteRecovery}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 14 }}
          className="glass-strong rounded-3xl p-8 w-full max-w-sm"
        >
          <h1 className="font-display text-2xl font-semibold mb-2">Reset password</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Create a new password for your admin account.
          </p>
          <input
            type="password"
            autoFocus
            value={recoveryPassword}
            onChange={(e) => setRecoveryPassword(e.target.value)}
            placeholder="New password"
            className="w-full glass rounded-xl px-4 py-3 outline-none focus-ring-tv"
          />
          <input
            type="password"
            value={recoveryConfirmPassword}
            onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="mt-3 w-full glass rounded-xl px-4 py-3 outline-none focus-ring-tv"
          />
          {recoveryErr && (
            <p className="mt-3 text-sm text-[color:var(--neon-pink)]">{recoveryErr}</p>
          )}
          {recoveryMsg && (
            <p className="mt-3 text-sm text-[color:var(--neon-cyan)]">{recoveryMsg}</p>
          )}
          <button
            disabled={busy}
            type="submit"
            className="mt-5 w-full glass-strong glow-cyan rounded-xl py-3 font-medium hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {busy ? "..." : "Update password"}
          </button>
        </motion.form>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 14 }}
          className="glass-strong rounded-3xl p-8 w-full max-w-md"
        >
          <h1 className="font-display text-2xl font-semibold mb-2">Admin Shield</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Admin login: enter the admin password to manage cards.
          </p>
          <form onSubmit={onLogin}>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full glass rounded-xl px-4 py-3 outline-none focus-ring-tv"
            />
            {loginErr && (
              <p className="mt-3 text-sm text-[color:var(--neon-pink)]">{loginErr}</p>
            )}
            <button
              disabled={busy}
              type="submit"
              className="mt-5 w-full glass-strong glow-cyan rounded-xl py-3 font-medium hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {busy ? "..." : "Enter"}
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 sm:px-8 py-10 max-w-6xl mx-auto">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold">Admin Shield</h1>
          <p className="text-sm text-muted-foreground">Manage your NFC memory portals.</p>
          <p className="mt-1 text-xs text-muted-foreground/80">Signed in as {adminEmail}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => token && refresh(token)}
            className="glass focus-ring-tv rounded-xl p-3"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowChangePassword((value) => !value)}
            className="glass focus-ring-tv rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm"
          >
            <KeyRound className="w-4 h-4" /> Change password
          </button>
          <button
            onClick={() => {
              localStorage.removeItem(ADMIN_TOKEN_KEY);
              localStorage.removeItem(ADMIN_EMAIL_KEY);
              setToken(null);
              setCards(null);
              setAdminEmail(DEFAULT_ADMIN_EMAIL);
              setShowChangePassword(false);
            }}
            className="glass focus-ring-tv rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {showChangePassword && (
        <motion.form
          onSubmit={onChangePassword}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="sm:col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
            <LockKeyhole className="w-4 h-4" /> Update your admin password
          </div>
          <Field
            label="Current password"
            value={changeCurrentPassword}
            onChange={setChangeCurrentPassword}
            placeholder="Current password"
            type="password"
          />
          <div className="hidden sm:block" />
          <Field
            label="New password"
            value={changeNewPassword}
            onChange={setChangeNewPassword}
            placeholder="New password"
            type="password"
          />
          <Field
            label="Confirm new password"
            value={changeConfirmPassword}
            onChange={setChangeConfirmPassword}
            placeholder="Confirm new password"
            type="password"
          />
          <div className="sm:col-span-2 flex flex-wrap justify-end gap-2 mt-2">
            {changePasswordErr && (
              <p className="mr-auto text-sm text-[color:var(--neon-pink)] self-center">
                {changePasswordErr}
              </p>
            )}
            {changePasswordMsg && (
              <p className="mr-auto text-sm text-[color:var(--neon-cyan)] self-center">
                {changePasswordMsg}
              </p>
            )}
            <button
              onClick={() => setShowChangePassword(false)}
              type="button"
              className="glass rounded-xl px-4 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="glass-strong glow-cyan rounded-xl px-5 py-2.5 text-sm font-medium hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save password"}
            </button>
          </div>
        </motion.form>
      )}

      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <button
          onClick={() => {
            setDraft({ ...emptyDraft });
            setEditingId(null);
          }}
          className="glass-strong glow-cyan rounded-2xl px-5 py-3 inline-flex items-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <Plus className="w-4 h-4" /> New card
        </button>
      </div>

      {draft && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Field
            label="Unique ID (NFC)"
            value={draft.uniqueId}
            onChange={(v) => setDraft({ ...draft, uniqueId: v })}
            disabled={!!editingId}
            placeholder="nfc_001"
          />
          <Field
            label="Student name"
            value={draft.studentName}
            onChange={(v) => setDraft({ ...draft, studentName: v })}
            placeholder="Jane Doe"
          />
          <Field
            label="Photo URL"
            value={draft.photoUrl}
            onChange={(v) => setDraft({ ...draft, photoUrl: v })}
            placeholder="https://..."
          />
          {draft.photoUrl.trim() ? (
            <div className="sm:col-span-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Preview</span>
              <div className="mt-2 w-full h-48 bg-black/5 rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src={/^https?:\/\//i.test(draft.photoUrl.trim()) ? draft.photoUrl.trim() : `https://${draft.photoUrl.trim()}`}
                  alt="photo preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/fallback-photo.png';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : null}
          <Field
            label="Drive URL"
            value={draft.driveUrl}
            onChange={(v) => setDraft({ ...draft, driveUrl: v })}
            placeholder="https://drive.google.com/..."
          />
          <Field
            label="Spotify URL"
            value={draft.spotifyUrl}
            onChange={(v) => setDraft({ ...draft, spotifyUrl: v })}
            placeholder="https://open.spotify.com/track/..."
          />
          <Field
            label="Video URL"
            value={draft.videoUrl}
            onChange={(v) => setDraft({ ...draft, videoUrl: v })}
            placeholder="https://..."
          />
          <div className="sm:col-span-2 flex flex-wrap justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setDraft(null);
                setEditingId(null);
              }}
              className="glass rounded-xl px-4 py-2.5 text-sm"
            >
              Cancel
            </button>
            {editingId && (
              <button
                onClick={() => onSave(true)}
                disabled={busy}
                className="glass rounded-xl px-4 py-2.5 text-sm flex items-center gap-1.5 hover:bg-white/15"
              >
                <KeyRound className="w-4 h-4" /> Save & reset PIN
              </button>
            )}
            <button
              onClick={() => onSave(false)}
              disabled={busy}
              className="glass-strong glow-cyan rounded-xl px-5 py-2.5 text-sm font-medium hover:scale-[1.02] transition-transform"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </button>
          </div>
        </motion.div>
      )}

      {cards === null ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[color:var(--neon-cyan)]" />
        </div>
      ) : cards.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
          No cards yet. Create your first one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3">
                {c.photo_url ? (
                  <img
                    src={c.photo_url}
                    alt={c.student_name}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full glass flex items-center justify-center font-display">
                    {c.student_name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{c.student_name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {c.unique_id} · {c.pin_hash ? "PIN set" : "PIN not set"}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(c.unique_id);
                    setDraft({
                      uniqueId: c.unique_id,
                      studentName: c.student_name,
                      photoUrl: c.photo_url ?? "",
                      driveUrl: c.drive_url ?? "",
                      spotifyUrl: c.spotify_url ?? "",
                      videoUrl: c.video_url ?? "",
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="glass rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-white/15"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <a
                  href={`/card/${c.unique_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="glass rounded-lg px-3 py-1.5 text-xs hover:bg-white/15"
                >
                  Open
                </a>
                <button
                  onClick={() => onDelete(c.unique_id)}
                  className="ml-auto glass rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 text-[color:var(--neon-pink)] hover:bg-white/15"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="glass rounded-xl px-3.5 py-2.5 outline-none focus-ring-tv disabled:opacity-60"
      />
    </label>
  );
}