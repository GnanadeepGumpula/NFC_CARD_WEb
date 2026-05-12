import { r as reactExports, V as jsxRuntimeExports } from "./server-CUStlXIp.mjs";
import { u as useServerFn, L as LoaderCircle, a as adminListCards, c as completeAdminPasswordResetFn, b as adminLogin, d as changeAdminPasswordFn, e as adminUpsertCard, f as adminDeleteCard, r as requestAdminPasswordResetFn } from "./loader-circle-BO86GkJJ.mjs";
import { m as motion } from "./proxy-C27Bf3Nj.mjs";
import { c as createLucideIcon } from "./createLucideIcon-DY3YDAUN.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./types-4kcaak5A.mjs";
const __iconNode$6 = [
  [
    "path",
    {
      d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
      key: "1s6t7t"
    }
  ],
  ["circle", { cx: "16.5", cy: "7.5", r: ".5", fill: "currentColor", key: "w0ekpg" }]
];
const KeyRound = createLucideIcon("key-round", __iconNode$6);
const __iconNode$5 = [
  ["circle", { cx: "12", cy: "16", r: "1", key: "1au0dj" }],
  ["rect", { x: "3", y: "10", width: "18", height: "12", rx: "2", key: "6s8ecr" }],
  ["path", { d: "M7 10V7a5 5 0 0 1 10 0v3", key: "1pqi11" }]
];
const LockKeyhole = createLucideIcon("lock-keyhole", __iconNode$5);
const __iconNode$4 = [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
];
const LogOut = createLucideIcon("log-out", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode$1);
const __iconNode = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode);
const ADMIN_TOKEN_KEY = "signatureday.admin.tok";
const ADMIN_EMAIL_KEY = "signatureday.admin.email";
const DEFAULT_ADMIN_EMAIL = "admin@signatureday.local";
const emptyDraft = {
  uniqueId: "",
  studentName: "",
  photoUrl: "",
  driveUrl: "",
  spotifyUrl: "",
  videoUrl: "",
  recoveryEmail: ""
};
function AdminPage() {
  const loginFn = useServerFn(adminLogin);
  const listFn = useServerFn(adminListCards);
  const upsertFn = useServerFn(adminUpsertCard);
  const deleteFn = useServerFn(adminDeleteCard);
  useServerFn(requestAdminPasswordResetFn);
  const changePasswordFn = useServerFn(changeAdminPasswordFn);
  const completeResetFn = useServerFn(completeAdminPasswordResetFn);
  const [token, setToken] = reactExports.useState(null);
  const [adminEmail, setAdminEmail] = reactExports.useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = reactExports.useState("");
  const [loginErr, setLoginErr] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [cards, setCards] = reactExports.useState(null);
  const [draft, setDraft] = reactExports.useState(null);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [showChangePassword, setShowChangePassword] = reactExports.useState(false);
  const [changeCurrentPassword, setChangeCurrentPassword] = reactExports.useState("");
  const [changeNewPassword, setChangeNewPassword] = reactExports.useState("");
  const [changeConfirmPassword, setChangeConfirmPassword] = reactExports.useState("");
  const [changePasswordErr, setChangePasswordErr] = reactExports.useState(null);
  const [changePasswordMsg, setChangePasswordMsg] = reactExports.useState(null);
  const [showResetRequest, setShowResetRequest] = reactExports.useState(false);
  const [resetEmail, setResetEmail] = reactExports.useState(DEFAULT_ADMIN_EMAIL);
  const [resetRequestErr, setResetRequestErr] = reactExports.useState(null);
  const [resetRequestMsg, setResetRequestMsg] = reactExports.useState(null);
  const [recoveryAccessToken, setRecoveryAccessToken] = reactExports.useState(null);
  const [recoveryRefreshToken, setRecoveryRefreshToken] = reactExports.useState(null);
  const [recoveryPassword, setRecoveryPassword] = reactExports.useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = reactExports.useState("");
  const [recoveryErr, setRecoveryErr] = reactExports.useState(null);
  const [recoveryMsg, setRecoveryMsg] = reactExports.useState(null);
  reactExports.useEffect(() => {
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
  reactExports.useEffect(() => {
    const expireAdminSession = () => {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_EMAIL_KEY);
      setToken(null);
      setCards(null);
      setAdminEmail(DEFAULT_ADMIN_EMAIL);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") expireAdminSession();
    };
    window.addEventListener("pagehide", expireAdminSession);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", expireAdminSession);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
  const refresh = async (tok) => {
    const r = await listFn({
      data: {
        token: tok
      }
    });
    if (r.cards) setCards(r.cards);
    else if (r.error === "Unauthorized") {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setToken(null);
      setCards(null);
    }
  };
  reactExports.useEffect(() => {
    if (token) refresh(token);
  }, [token]);
  const onLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setLoginErr(null);
    const r = await loginFn({
      data: {
        password
      }
    });
    setBusy(false);
    if (!r.ok) {
      setLoginErr(r.error);
      return;
    }
    localStorage.setItem(ADMIN_TOKEN_KEY, r.accessToken);
    localStorage.setItem(ADMIN_EMAIL_KEY, r.email || DEFAULT_ADMIN_EMAIL);
    setToken(r.accessToken);
    setAdminEmail(r.email || DEFAULT_ADMIN_EMAIL);
    setPassword("");
    setChangePasswordMsg(null);
    setResetRequestMsg(null);
  };
  const onSave = async (resetPin = false) => {
    if (!draft || !token) return;
    const uid = draft.uniqueId.trim();
    const name = draft.studentName.trim();
    if (!uid) return alert("Unique ID is required");
    if (!name) return alert("Student name is required");
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
          recoveryEmail: draft.recoveryEmail.trim() || null
        }
      }
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
  const onDelete = async (uid) => {
    if (!token) return;
    if (!confirm(`Delete card ${uid}?`)) return;
    await deleteFn({
      data: {
        token,
        uniqueId: uid
      }
    });
    refresh(token);
  };
  const onChangePassword = async (e) => {
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
        newPassword: changeNewPassword
      }
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
  const onCompleteRecovery = async (e) => {
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
        newPassword: recoveryPassword
      }
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen flex items-center justify-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.form, { onSubmit: onCompleteRecovery, initial: {
      opacity: 0,
      y: 16
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      type: "spring",
      stiffness: 90,
      damping: 14
    }, className: "glass-strong rounded-3xl p-8 w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-semibold mb-2", children: "Reset password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Create a new password for your admin account." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", autoFocus: true, value: recoveryPassword, onChange: (e) => setRecoveryPassword(e.target.value), placeholder: "New password", className: "w-full glass rounded-xl px-4 py-3 outline-none focus-ring-tv" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: recoveryConfirmPassword, onChange: (e) => setRecoveryConfirmPassword(e.target.value), placeholder: "Confirm new password", className: "mt-3 w-full glass rounded-xl px-4 py-3 outline-none focus-ring-tv" }),
      recoveryErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-[color:var(--neon-pink)]", children: recoveryErr }),
      recoveryMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-[color:var(--neon-cyan)]", children: recoveryMsg }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, type: "submit", className: "mt-5 w-full glass-strong glow-cyan rounded-xl py-3 font-medium hover:scale-[1.02] transition-transform disabled:opacity-50", children: busy ? "..." : "Update password" })
    ] }) });
  }
  if (!token) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen flex items-center justify-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 16
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      type: "spring",
      stiffness: 90,
      damping: 14
    }, className: "glass-strong rounded-3xl p-8 w-full max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-semibold mb-2", children: "Admin Shield" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Admin login: enter the admin password to manage cards." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: onLogin, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Admin password", className: "w-full glass rounded-xl px-4 py-3 outline-none focus-ring-tv" }),
        loginErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-[color:var(--neon-pink)]", children: loginErr }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, type: "submit", className: "mt-5 w-full glass-strong glow-cyan rounded-xl py-3 font-medium hover:scale-[1.02] transition-transform disabled:opacity-50", children: busy ? "..." : "Enter" })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen px-4 sm:px-8 py-10 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: "Admin Shield" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage your NFC memory portals." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground/80", children: [
          "Signed in as ",
          adminEmail
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => token && refresh(token), className: "glass focus-ring-tv rounded-xl p-3", title: "Refresh", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowChangePassword((value) => !value), className: "glass focus-ring-tv rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "w-4 h-4" }),
          " Change password"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          localStorage.removeItem(ADMIN_EMAIL_KEY);
          setToken(null);
          setCards(null);
          setAdminEmail(DEFAULT_ADMIN_EMAIL);
          setShowChangePassword(false);
        }, className: "glass focus-ring-tv rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4" }),
          " Logout"
        ] })
      ] })
    ] }),
    showChangePassword && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.form, { onSubmit: onChangePassword, initial: {
      opacity: 0,
      y: 10
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "glass-strong rounded-3xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LockKeyhole, { className: "w-4 h-4" }),
        " Update your admin password"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Current password", value: changeCurrentPassword, onChange: setChangeCurrentPassword, placeholder: "Current password", type: "password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:block" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "New password", value: changeNewPassword, onChange: setChangeNewPassword, placeholder: "New password", type: "password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Confirm new password", value: changeConfirmPassword, onChange: setChangeConfirmPassword, placeholder: "Confirm new password", type: "password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 flex flex-wrap justify-end gap-2 mt-2", children: [
        changePasswordErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mr-auto text-sm text-[color:var(--neon-pink)] self-center", children: changePasswordErr }),
        changePasswordMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mr-auto text-sm text-[color:var(--neon-cyan)] self-center", children: changePasswordMsg }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowChangePassword(false), type: "button", className: "glass rounded-xl px-4 py-2.5 text-sm", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: busy, className: "glass-strong glow-cyan rounded-xl px-5 py-2.5 text-sm font-medium hover:scale-[1.02] transition-transform disabled:opacity-50", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Save password" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex flex-wrap gap-3 items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
      setDraft({
        ...emptyDraft
      });
      setEditingId(null);
    }, className: "glass-strong glow-cyan rounded-2xl px-5 py-3 inline-flex items-center gap-2 hover:scale-[1.02] transition-transform", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
      " New card"
    ] }) }),
    draft && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 10
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "glass-strong rounded-3xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Unique ID (NFC)", value: draft.uniqueId, onChange: (v) => setDraft({
        ...draft,
        uniqueId: v
      }), disabled: !!editingId, placeholder: "nfc_001" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Student name", value: draft.studentName, onChange: (v) => setDraft({
        ...draft,
        studentName: v
      }), placeholder: "Jane Doe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Photo URL", value: draft.photoUrl, onChange: (v) => setDraft({
        ...draft,
        photoUrl: v
      }), placeholder: "https://..." }),
      draft.photoUrl.trim() ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Preview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 w-full h-48 bg-black/5 rounded-xl flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: /^https?:\/\//i.test(draft.photoUrl.trim()) ? draft.photoUrl.trim() : `https://${draft.photoUrl.trim()}`, alt: "photo preview", onError: (e) => {
          e.target.src = "/fallback-photo.png";
        }, className: "w-full h-full object-cover" }) })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Drive URL", value: draft.driveUrl, onChange: (v) => setDraft({
        ...draft,
        driveUrl: v
      }), placeholder: "https://drive.google.com/..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Spotify URL", value: draft.spotifyUrl, onChange: (v) => setDraft({
        ...draft,
        spotifyUrl: v
      }), placeholder: "https://open.spotify.com/track/..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Video URL", value: draft.videoUrl, onChange: (v) => setDraft({
        ...draft,
        videoUrl: v
      }), placeholder: "https://..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Recovery email", value: draft.recoveryEmail, onChange: (v) => setDraft({
        ...draft,
        recoveryEmail: v
      }), placeholder: "name@email.com", type: "email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 flex flex-wrap justify-end gap-2 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setDraft(null);
          setEditingId(null);
        }, className: "glass rounded-xl px-4 py-2.5 text-sm", children: "Cancel" }),
        editingId && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onSave(true), disabled: busy, className: "glass rounded-xl px-4 py-2.5 text-sm flex items-center gap-1.5 hover:bg-white/15", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "w-4 h-4" }),
          " Save & reset PIN"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSave(false), disabled: busy, className: "glass-strong glow-cyan rounded-xl px-5 py-2.5 text-sm font-medium hover:scale-[1.02] transition-transform", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Save" })
      ] })
    ] }),
    cards === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-[color:var(--neon-cyan)]" }) }) : cards.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-3xl p-10 text-center text-muted-foreground", children: "No cards yet. Create your first one above." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: cards.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        c.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.photo_url, alt: c.student_name, className: "w-12 h-12 rounded-full object-cover ring-1 ring-white/20" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full glass flex items-center justify-center font-display", children: c.student_name.charAt(0) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: c.student_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
            c.unique_id,
            " · ",
            c.pin_hash ? "PIN set" : "PIN not set"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setEditingId(c.unique_id);
          setDraft({
            uniqueId: c.unique_id,
            studentName: c.student_name,
            photoUrl: c.photo_url ?? "",
            driveUrl: c.drive_url ?? "",
            spotifyUrl: c.spotify_url ?? "",
            videoUrl: c.video_url ?? "",
            recoveryEmail: c.recovery_email ?? ""
          });
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
        }, className: "glass rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-white/15", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }),
          " Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/card/${c.unique_id}`, target: "_blank", rel: "noreferrer", className: "glass rounded-lg px-3 py-1.5 text-xs hover:bg-white/15", children: "Open" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onDelete(c.unique_id), className: "ml-auto glass rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 text-[color:var(--neon-pink)] hover:bg-white/15", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),
          " Delete"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-xs text-muted-foreground", children: [
        "Recovery email: ",
        c.recovery_email || "Not set"
      ] })
    ] }, c.id)) })
  ] });
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value, onChange: (e) => onChange(e.target.value), placeholder, disabled, className: "glass rounded-xl px-3.5 py-2.5 outline-none focus-ring-tv disabled:opacity-60" })
  ] });
}
export {
  AdminPage as component
};
