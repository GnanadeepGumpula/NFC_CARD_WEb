import { r as reactExports, V as jsxRuntimeExports } from "./server-CUStlXIp.mjs";
import { u as useParams } from "./router-CZ2KFAs9.mjs";
import { u as useServerFn, L as LoaderCircle, m as resetCardPin } from "./loader-circle-BO86GkJJ.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./types-4kcaak5A.mjs";
import "./createLucideIcon-DY3YDAUN.mjs";
function ResetPage() {
  const {
    id
  } = useParams({
    from: "/card/$id/reset"
  });
  const [token] = reactExports.useState(() => new URLSearchParams(window.location.search).get("token") || "");
  const [newPin, setNewPin] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [msg, setMsg] = reactExports.useState(null);
  const resetFn = useServerFn(resetCardPin);
  const doReset = async (e) => {
    e?.preventDefault();
    setMsg(null);
    if (!token) return setMsg("Missing token in URL");
    if (newPin.length < 4) return setMsg("PIN must be at least 4 digits");
    setBusy(true);
    const r = await resetFn({
      data: {
        uniqueId: id,
        token,
        newPin
      }
    });
    setBusy(false);
    if (r.ok) {
      setMsg("PIN updated — you can now unlock the card.");
    } else {
      setMsg(r.error || "Failed to reset PIN");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen flex items-center justify-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md glass-strong rounded-3xl p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold mb-4", children: "Reset PIN" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Enter a new PIN for this card." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: doReset, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", inputMode: "numeric", pattern: "[0-9]*", value: newPin, onChange: (e) => setNewPin(e.target.value), placeholder: "New PIN", className: "w-full glass rounded-xl px-4 py-3 outline-none" }),
      msg && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[color:var(--neon-pink)]", children: msg }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: busy, className: "w-full glass-strong glow-cyan rounded-xl py-3 font-medium", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mx-auto" }) : "Set PIN" })
    ] })
  ] }) });
}
export {
  ResetPage as component
};
