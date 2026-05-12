import { r as reactExports, V as jsxRuntimeExports } from "./server-CUStlXIp.mjs";
import { u as useParams } from "./router-CZ2KFAs9.mjs";
import { u as useServerFn, L as LoaderCircle, g as getCardPublic, h as getCardWithToken, i as changeCardPin, s as storeCardRecoveryEmail, j as requestCardPinReset, k as initializePin, l as unlockCard } from "./loader-circle-BO86GkJJ.mjs";
import { m as motion, u as usePresence, a as useConstant, b as useIsomorphicLayoutEffect, L as LayoutGroupContext, P as PresenceContext, M as MotionConfigContext, i as isHTMLElement } from "./proxy-C27Bf3Nj.mjs";
import { c as createLucideIcon } from "./createLucideIcon-DY3YDAUN.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./types-4kcaak5A.mjs";
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return reactExports.useCallback(composeRefs(...refs), refs);
}
class PopChildMeasure extends reactExports.Component {
  getSnapshotBeforeUpdate(prevProps) {
    const element = this.props.childRef.current;
    if (isHTMLElement(element) && prevProps.isPresent && !this.props.isPresent && this.props.pop !== false) {
      const parent = element.offsetParent;
      const parentWidth = isHTMLElement(parent) ? parent.offsetWidth || 0 : 0;
      const parentHeight = isHTMLElement(parent) ? parent.offsetHeight || 0 : 0;
      const computedStyle = getComputedStyle(element);
      const size = this.props.sizeRef.current;
      size.height = parseFloat(computedStyle.height);
      size.width = parseFloat(computedStyle.width);
      size.top = element.offsetTop;
      size.left = element.offsetLeft;
      size.right = parentWidth - size.width - size.left;
      size.bottom = parentHeight - size.height - size.top;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function PopChild({ children, isPresent, anchorX, anchorY, root, pop }) {
  const id = reactExports.useId();
  const ref = reactExports.useRef(null);
  const size = reactExports.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  });
  const { nonce } = reactExports.useContext(MotionConfigContext);
  const childRef = children.props?.ref ?? children?.ref;
  const composedRef = useComposedRefs(ref, childRef);
  reactExports.useInsertionEffect(() => {
    const { width, height, top, left, right, bottom } = size.current;
    if (isPresent || pop === false || !ref.current || !width || !height)
      return;
    const x = anchorX === "left" ? `left: ${left}` : `right: ${right}`;
    const y = anchorY === "bottom" ? `bottom: ${bottom}` : `top: ${top}`;
    ref.current.dataset.motionPopId = id;
    const style = document.createElement("style");
    if (nonce)
      style.nonce = nonce;
    const parent = root ?? document.head;
    parent.appendChild(style);
    if (style.sheet) {
      style.sheet.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            ${x}px !important;
            ${y}px !important;
          }
        `);
    }
    return () => {
      ref.current?.removeAttribute("data-motion-pop-id");
      if (parent.contains(style)) {
        parent.removeChild(style);
      }
    };
  }, [isPresent]);
  return jsxRuntimeExports.jsx(PopChildMeasure, { isPresent, childRef: ref, sizeRef: size, pop, children: pop === false ? children : reactExports.cloneElement(children, { ref: composedRef }) });
}
const PresenceChild = ({ children, initial, isPresent, onExitComplete, custom, presenceAffectsLayout, mode, anchorX, anchorY, root }) => {
  const presenceChildren = useConstant(newChildrenMap);
  const id = reactExports.useId();
  let isReusedContext = true;
  let context = reactExports.useMemo(() => {
    isReusedContext = false;
    return {
      id,
      initial,
      isPresent,
      custom,
      onExitComplete: (childId) => {
        presenceChildren.set(childId, true);
        for (const isComplete of presenceChildren.values()) {
          if (!isComplete)
            return;
        }
        onExitComplete && onExitComplete();
      },
      register: (childId) => {
        presenceChildren.set(childId, false);
        return () => presenceChildren.delete(childId);
      }
    };
  }, [isPresent, presenceChildren, onExitComplete]);
  if (presenceAffectsLayout && isReusedContext) {
    context = { ...context };
  }
  reactExports.useMemo(() => {
    presenceChildren.forEach((_, key) => presenceChildren.set(key, false));
  }, [isPresent]);
  reactExports.useEffect(() => {
    !isPresent && !presenceChildren.size && onExitComplete && onExitComplete();
  }, [isPresent]);
  children = jsxRuntimeExports.jsx(PopChild, { pop: mode === "popLayout", isPresent, anchorX, anchorY, root, children });
  return jsxRuntimeExports.jsx(PresenceContext.Provider, { value: context, children });
};
function newChildrenMap() {
  return /* @__PURE__ */ new Map();
}
const getChildKey = (child) => child.key || "";
function onlyElements(children) {
  const filtered = [];
  reactExports.Children.forEach(children, (child) => {
    if (reactExports.isValidElement(child))
      filtered.push(child);
  });
  return filtered;
}
const AnimatePresence = ({ children, custom, initial = true, onExitComplete, presenceAffectsLayout = true, mode = "sync", propagate = false, anchorX = "left", anchorY = "top", root }) => {
  const [isParentPresent, safeToRemove] = usePresence(propagate);
  const presentChildren = reactExports.useMemo(() => onlyElements(children), [children]);
  const presentKeys = propagate && !isParentPresent ? [] : presentChildren.map(getChildKey);
  const isInitialRender = reactExports.useRef(true);
  const pendingPresentChildren = reactExports.useRef(presentChildren);
  const exitComplete = useConstant(() => /* @__PURE__ */ new Map());
  const exitingComponents = reactExports.useRef(/* @__PURE__ */ new Set());
  const [diffedChildren, setDiffedChildren] = reactExports.useState(presentChildren);
  const [renderedChildren, setRenderedChildren] = reactExports.useState(presentChildren);
  useIsomorphicLayoutEffect(() => {
    isInitialRender.current = false;
    pendingPresentChildren.current = presentChildren;
    for (let i = 0; i < renderedChildren.length; i++) {
      const key = getChildKey(renderedChildren[i]);
      if (!presentKeys.includes(key)) {
        if (exitComplete.get(key) !== true) {
          exitComplete.set(key, false);
        }
      } else {
        exitComplete.delete(key);
        exitingComponents.current.delete(key);
      }
    }
  }, [renderedChildren, presentKeys.length, presentKeys.join("-")]);
  const exitingChildren = [];
  if (presentChildren !== diffedChildren) {
    let nextChildren = [...presentChildren];
    for (let i = 0; i < renderedChildren.length; i++) {
      const child = renderedChildren[i];
      const key = getChildKey(child);
      if (!presentKeys.includes(key)) {
        nextChildren.splice(i, 0, child);
        exitingChildren.push(child);
      }
    }
    if (mode === "wait" && exitingChildren.length) {
      nextChildren = exitingChildren;
    }
    setRenderedChildren(onlyElements(nextChildren));
    setDiffedChildren(presentChildren);
    return null;
  }
  const { forceRender } = reactExports.useContext(LayoutGroupContext);
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: renderedChildren.map((child) => {
    const key = getChildKey(child);
    const isPresent = propagate && !isParentPresent ? false : presentChildren === renderedChildren || presentKeys.includes(key);
    const onExit = () => {
      if (exitingComponents.current.has(key)) {
        return;
      }
      if (exitComplete.has(key)) {
        exitingComponents.current.add(key);
        exitComplete.set(key, true);
      } else {
        return;
      }
      let isEveryExitComplete = true;
      exitComplete.forEach((isExitComplete) => {
        if (!isExitComplete)
          isEveryExitComplete = false;
      });
      if (isEveryExitComplete) {
        forceRender?.();
        setRenderedChildren(pendingPresentChildren.current);
        propagate && safeToRemove?.();
        onExitComplete && onExitComplete();
      }
    };
    return jsxRuntimeExports.jsx(PresenceChild, { isPresent, initial: !isInitialRender.current || initial ? void 0 : false, custom, presenceAffectsLayout, mode, root, onExitComplete: isPresent ? void 0 : onExit, anchorX, anchorY, children: child }, key);
  }) });
};
const __iconNode$9 = [
  [
    "path",
    {
      d: "M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z",
      key: "1yo7s0"
    }
  ],
  ["path", { d: "m12 9 6 6", key: "anjzzh" }],
  ["path", { d: "m18 9-6 6", key: "1fp51s" }]
];
const Delete = createLucideIcon("delete", __iconNode$9);
const __iconNode$8 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$8);
const __iconNode$7 = [
  [
    "path",
    {
      d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
      key: "usdka0"
    }
  ]
];
const FolderOpen = createLucideIcon("folder-open", __iconNode$7);
const __iconNode$6 = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
const Lock = createLucideIcon("lock", __iconNode$6);
const __iconNode$5 = [
  ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
  ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }]
];
const Mail = createLucideIcon("mail", __iconNode$5);
const __iconNode$4 = [
  ["path", { d: "M9 18V5l12-2v13", key: "1jmyc2" }],
  ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }],
  ["circle", { cx: "18", cy: "16", r: "3", key: "1hluhg" }]
];
const Music = createLucideIcon("music", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
      key: "10ikf1"
    }
  ]
];
const Play = createLucideIcon("play", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "M12 8v4", key: "1got3b" }],
  ["path", { d: "M12 16h.01", key: "1drbdi" }]
];
const ShieldAlert = createLucideIcon("shield-alert", __iconNode$1);
const __iconNode = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
const X = createLucideIcon("x", __iconNode);
var module$1 = {};
(function main(global, module, isWorker, workerSize) {
  var canUseWorker = !!(global.Worker && global.Blob && global.Promise && global.OffscreenCanvas && global.OffscreenCanvasRenderingContext2D && global.HTMLCanvasElement && global.HTMLCanvasElement.prototype.transferControlToOffscreen && global.URL && global.URL.createObjectURL);
  var canUsePaths = typeof Path2D === "function" && typeof DOMMatrix === "function";
  var canDrawBitmap = (function() {
    if (!global.OffscreenCanvas) {
      return false;
    }
    try {
      var canvas = new OffscreenCanvas(1, 1);
      var ctx = canvas.getContext("2d");
      ctx.fillRect(0, 0, 1, 1);
      var bitmap = canvas.transferToImageBitmap();
      ctx.createPattern(bitmap, "no-repeat");
    } catch (e) {
      return false;
    }
    return true;
  })();
  function noop() {
  }
  function promise(func) {
    var ModulePromise = module.exports.Promise;
    var Prom = ModulePromise !== void 0 ? ModulePromise : global.Promise;
    if (typeof Prom === "function") {
      return new Prom(func);
    }
    func(noop, noop);
    return null;
  }
  var bitmapMapper = /* @__PURE__ */ (function(skipTransform, map) {
    return {
      transform: function(bitmap) {
        if (skipTransform) {
          return bitmap;
        }
        if (map.has(bitmap)) {
          return map.get(bitmap);
        }
        var canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0);
        map.set(bitmap, canvas);
        return canvas;
      },
      clear: function() {
        map.clear();
      }
    };
  })(canDrawBitmap, /* @__PURE__ */ new Map());
  var raf = (function() {
    var TIME = Math.floor(1e3 / 60);
    var frame, cancel;
    var frames = {};
    var lastFrameTime = 0;
    if (typeof requestAnimationFrame === "function" && typeof cancelAnimationFrame === "function") {
      frame = function(cb) {
        var id = Math.random();
        frames[id] = requestAnimationFrame(function onFrame(time) {
          if (lastFrameTime === time || lastFrameTime + TIME - 1 < time) {
            lastFrameTime = time;
            delete frames[id];
            cb();
          } else {
            frames[id] = requestAnimationFrame(onFrame);
          }
        });
        return id;
      };
      cancel = function(id) {
        if (frames[id]) {
          cancelAnimationFrame(frames[id]);
        }
      };
    } else {
      frame = function(cb) {
        return setTimeout(cb, TIME);
      };
      cancel = function(timer) {
        return clearTimeout(timer);
      };
    }
    return { frame, cancel };
  })();
  var getWorker = /* @__PURE__ */ (function() {
    var worker;
    var prom;
    var resolves = {};
    function decorate(worker2) {
      function execute(options, callback) {
        worker2.postMessage({ options: options || {}, callback });
      }
      worker2.init = function initWorker(canvas) {
        var offscreen = canvas.transferControlToOffscreen();
        worker2.postMessage({ canvas: offscreen }, [offscreen]);
      };
      worker2.fire = function fireWorker(options, size, done) {
        if (prom) {
          execute(options, null);
          return prom;
        }
        var id = Math.random().toString(36).slice(2);
        prom = promise(function(resolve) {
          function workerDone(msg) {
            if (msg.data.callback !== id) {
              return;
            }
            delete resolves[id];
            worker2.removeEventListener("message", workerDone);
            prom = null;
            bitmapMapper.clear();
            done();
            resolve();
          }
          worker2.addEventListener("message", workerDone);
          execute(options, id);
          resolves[id] = workerDone.bind(null, { data: { callback: id } });
        });
        return prom;
      };
      worker2.reset = function resetWorker() {
        worker2.postMessage({ reset: true });
        for (var id in resolves) {
          resolves[id]();
          delete resolves[id];
        }
      };
    }
    return function() {
      if (worker) {
        return worker;
      }
      if (!isWorker && canUseWorker) {
        var code = [
          "var CONFETTI, SIZE = {}, module = {};",
          "(" + main.toString() + ")(this, module, true, SIZE);",
          "onmessage = function(msg) {",
          "  if (msg.data.options) {",
          "    CONFETTI(msg.data.options).then(function () {",
          "      if (msg.data.callback) {",
          "        postMessage({ callback: msg.data.callback });",
          "      }",
          "    });",
          "  } else if (msg.data.reset) {",
          "    CONFETTI && CONFETTI.reset();",
          "  } else if (msg.data.resize) {",
          "    SIZE.width = msg.data.resize.width;",
          "    SIZE.height = msg.data.resize.height;",
          "  } else if (msg.data.canvas) {",
          "    SIZE.width = msg.data.canvas.width;",
          "    SIZE.height = msg.data.canvas.height;",
          "    CONFETTI = module.exports.create(msg.data.canvas);",
          "  }",
          "}"
        ].join("\n");
        try {
          worker = new Worker(URL.createObjectURL(new Blob([code])));
        } catch (e) {
          typeof console !== "undefined" && typeof console.warn === "function" ? console.warn("🎊 Could not load worker", e) : null;
          return null;
        }
        decorate(worker);
      }
      return worker;
    };
  })();
  var defaults = {
    particleCount: 50,
    angle: 90,
    spread: 45,
    startVelocity: 45,
    decay: 0.9,
    gravity: 1,
    drift: 0,
    ticks: 200,
    x: 0.5,
    y: 0.5,
    shapes: ["square", "circle"],
    zIndex: 100,
    colors: [
      "#26ccff",
      "#a25afd",
      "#ff5e7e",
      "#88ff5a",
      "#fcff42",
      "#ffa62d",
      "#ff36ff"
    ],
    // probably should be true, but back-compat
    disableForReducedMotion: false,
    scalar: 1
  };
  function convert(val, transform) {
    return transform ? transform(val) : val;
  }
  function isOk(val) {
    return !(val === null || val === void 0);
  }
  function prop(options, name, transform) {
    return convert(
      options && isOk(options[name]) ? options[name] : defaults[name],
      transform
    );
  }
  function onlyPositiveInt(number) {
    return number < 0 ? 0 : Math.floor(number);
  }
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  function toDecimal(str) {
    return parseInt(str, 16);
  }
  function colorsToRgb(colors) {
    return colors.map(hexToRgb);
  }
  function hexToRgb(str) {
    var val = String(str).replace(/[^0-9a-f]/gi, "");
    if (val.length < 6) {
      val = val[0] + val[0] + val[1] + val[1] + val[2] + val[2];
    }
    return {
      r: toDecimal(val.substring(0, 2)),
      g: toDecimal(val.substring(2, 4)),
      b: toDecimal(val.substring(4, 6))
    };
  }
  function getOrigin(options) {
    var origin = prop(options, "origin", Object);
    origin.x = prop(origin, "x", Number);
    origin.y = prop(origin, "y", Number);
    return origin;
  }
  function setCanvasWindowSize(canvas) {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  }
  function setCanvasRectSize(canvas) {
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  function getCanvas(zIndex) {
    var canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = zIndex;
    return canvas;
  }
  function ellipse(context, x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.scale(radiusX, radiusY);
    context.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
    context.restore();
  }
  function randomPhysics(opts) {
    var radAngle = opts.angle * (Math.PI / 180);
    var radSpread = opts.spread * (Math.PI / 180);
    return {
      x: opts.x,
      y: opts.y,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
      velocity: opts.startVelocity * 0.5 + Math.random() * opts.startVelocity,
      angle2D: -radAngle + (0.5 * radSpread - Math.random() * radSpread),
      tiltAngle: (Math.random() * (0.75 - 0.25) + 0.25) * Math.PI,
      color: opts.color,
      shape: opts.shape,
      tick: 0,
      totalTicks: opts.ticks,
      decay: opts.decay,
      drift: opts.drift,
      random: Math.random() + 2,
      tiltSin: 0,
      tiltCos: 0,
      wobbleX: 0,
      wobbleY: 0,
      gravity: opts.gravity * 3,
      ovalScalar: 0.6,
      scalar: opts.scalar,
      flat: opts.flat
    };
  }
  function updateFetti(context, fetti) {
    fetti.x += Math.cos(fetti.angle2D) * fetti.velocity + fetti.drift;
    fetti.y += Math.sin(fetti.angle2D) * fetti.velocity + fetti.gravity;
    fetti.velocity *= fetti.decay;
    if (fetti.flat) {
      fetti.wobble = 0;
      fetti.wobbleX = fetti.x + 10 * fetti.scalar;
      fetti.wobbleY = fetti.y + 10 * fetti.scalar;
      fetti.tiltSin = 0;
      fetti.tiltCos = 0;
      fetti.random = 1;
    } else {
      fetti.wobble += fetti.wobbleSpeed;
      fetti.wobbleX = fetti.x + 10 * fetti.scalar * Math.cos(fetti.wobble);
      fetti.wobbleY = fetti.y + 10 * fetti.scalar * Math.sin(fetti.wobble);
      fetti.tiltAngle += 0.1;
      fetti.tiltSin = Math.sin(fetti.tiltAngle);
      fetti.tiltCos = Math.cos(fetti.tiltAngle);
      fetti.random = Math.random() + 2;
    }
    var progress = fetti.tick++ / fetti.totalTicks;
    var x1 = fetti.x + fetti.random * fetti.tiltCos;
    var y1 = fetti.y + fetti.random * fetti.tiltSin;
    var x2 = fetti.wobbleX + fetti.random * fetti.tiltCos;
    var y2 = fetti.wobbleY + fetti.random * fetti.tiltSin;
    context.fillStyle = "rgba(" + fetti.color.r + ", " + fetti.color.g + ", " + fetti.color.b + ", " + (1 - progress) + ")";
    context.beginPath();
    if (canUsePaths && fetti.shape.type === "path" && typeof fetti.shape.path === "string" && Array.isArray(fetti.shape.matrix)) {
      context.fill(transformPath2D(
        fetti.shape.path,
        fetti.shape.matrix,
        fetti.x,
        fetti.y,
        Math.abs(x2 - x1) * 0.1,
        Math.abs(y2 - y1) * 0.1,
        Math.PI / 10 * fetti.wobble
      ));
    } else if (fetti.shape.type === "bitmap") {
      var rotation = Math.PI / 10 * fetti.wobble;
      var scaleX = Math.abs(x2 - x1) * 0.1;
      var scaleY = Math.abs(y2 - y1) * 0.1;
      var width = fetti.shape.bitmap.width * fetti.scalar;
      var height = fetti.shape.bitmap.height * fetti.scalar;
      var matrix = new DOMMatrix([
        Math.cos(rotation) * scaleX,
        Math.sin(rotation) * scaleX,
        -Math.sin(rotation) * scaleY,
        Math.cos(rotation) * scaleY,
        fetti.x,
        fetti.y
      ]);
      matrix.multiplySelf(new DOMMatrix(fetti.shape.matrix));
      var pattern = context.createPattern(bitmapMapper.transform(fetti.shape.bitmap), "no-repeat");
      pattern.setTransform(matrix);
      context.globalAlpha = 1 - progress;
      context.fillStyle = pattern;
      context.fillRect(
        fetti.x - width / 2,
        fetti.y - height / 2,
        width,
        height
      );
      context.globalAlpha = 1;
    } else if (fetti.shape === "circle") {
      context.ellipse ? context.ellipse(fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI) : ellipse(context, fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI);
    } else if (fetti.shape === "star") {
      var rot = Math.PI / 2 * 3;
      var innerRadius = 4 * fetti.scalar;
      var outerRadius = 8 * fetti.scalar;
      var x = fetti.x;
      var y = fetti.y;
      var spikes = 5;
      var step = Math.PI / spikes;
      while (spikes--) {
        x = fetti.x + Math.cos(rot) * outerRadius;
        y = fetti.y + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;
        x = fetti.x + Math.cos(rot) * innerRadius;
        y = fetti.y + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
    } else {
      context.moveTo(Math.floor(fetti.x), Math.floor(fetti.y));
      context.lineTo(Math.floor(fetti.wobbleX), Math.floor(y1));
      context.lineTo(Math.floor(x2), Math.floor(y2));
      context.lineTo(Math.floor(x1), Math.floor(fetti.wobbleY));
    }
    context.closePath();
    context.fill();
    return fetti.tick < fetti.totalTicks;
  }
  function animate(canvas, fettis, resizer, size, done) {
    var animatingFettis = fettis.slice();
    var context = canvas.getContext("2d");
    var animationFrame;
    var destroy;
    var prom = promise(function(resolve) {
      function onDone() {
        animationFrame = destroy = null;
        context.clearRect(0, 0, size.width, size.height);
        bitmapMapper.clear();
        done();
        resolve();
      }
      function update() {
        if (isWorker && !(size.width === workerSize.width && size.height === workerSize.height)) {
          size.width = canvas.width = workerSize.width;
          size.height = canvas.height = workerSize.height;
        }
        if (!size.width && !size.height) {
          resizer(canvas);
          size.width = canvas.width;
          size.height = canvas.height;
        }
        context.clearRect(0, 0, size.width, size.height);
        animatingFettis = animatingFettis.filter(function(fetti) {
          return updateFetti(context, fetti);
        });
        if (animatingFettis.length) {
          animationFrame = raf.frame(update);
        } else {
          onDone();
        }
      }
      animationFrame = raf.frame(update);
      destroy = onDone;
    });
    return {
      addFettis: function(fettis2) {
        animatingFettis = animatingFettis.concat(fettis2);
        return prom;
      },
      canvas,
      promise: prom,
      reset: function() {
        if (animationFrame) {
          raf.cancel(animationFrame);
        }
        if (destroy) {
          destroy();
        }
      }
    };
  }
  function confettiCannon(canvas, globalOpts) {
    var isLibCanvas = !canvas;
    var allowResize = !!prop(globalOpts || {}, "resize");
    var hasResizeEventRegistered = false;
    var globalDisableForReducedMotion = prop(globalOpts, "disableForReducedMotion", Boolean);
    var shouldUseWorker = canUseWorker && !!prop(globalOpts || {}, "useWorker");
    var worker = shouldUseWorker ? getWorker() : null;
    var resizer = isLibCanvas ? setCanvasWindowSize : setCanvasRectSize;
    var initialized = canvas && worker ? !!canvas.__confetti_initialized : false;
    var preferLessMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion)").matches;
    var animationObj;
    function fireLocal(options, size, done) {
      var particleCount = prop(options, "particleCount", onlyPositiveInt);
      var angle = prop(options, "angle", Number);
      var spread = prop(options, "spread", Number);
      var startVelocity = prop(options, "startVelocity", Number);
      var decay = prop(options, "decay", Number);
      var gravity = prop(options, "gravity", Number);
      var drift = prop(options, "drift", Number);
      var colors = prop(options, "colors", colorsToRgb);
      var ticks = prop(options, "ticks", Number);
      var shapes = prop(options, "shapes");
      var scalar = prop(options, "scalar");
      var flat = !!prop(options, "flat");
      var origin = getOrigin(options);
      var temp = particleCount;
      var fettis = [];
      var startX = canvas.width * origin.x;
      var startY = canvas.height * origin.y;
      while (temp--) {
        fettis.push(
          randomPhysics({
            x: startX,
            y: startY,
            angle,
            spread,
            startVelocity,
            color: colors[temp % colors.length],
            shape: shapes[randomInt(0, shapes.length)],
            ticks,
            decay,
            gravity,
            drift,
            scalar,
            flat
          })
        );
      }
      if (animationObj) {
        return animationObj.addFettis(fettis);
      }
      animationObj = animate(canvas, fettis, resizer, size, done);
      return animationObj.promise;
    }
    function fire(options) {
      var disableForReducedMotion = globalDisableForReducedMotion || prop(options, "disableForReducedMotion", Boolean);
      var zIndex = prop(options, "zIndex", Number);
      if (disableForReducedMotion && preferLessMotion) {
        return promise(function(resolve) {
          resolve();
        });
      }
      if (isLibCanvas && animationObj) {
        canvas = animationObj.canvas;
      } else if (isLibCanvas && !canvas) {
        canvas = getCanvas(zIndex);
        document.body.appendChild(canvas);
      }
      if (allowResize && !initialized) {
        resizer(canvas);
      }
      var size = {
        width: canvas.width,
        height: canvas.height
      };
      if (worker && !initialized) {
        worker.init(canvas);
      }
      initialized = true;
      if (worker) {
        canvas.__confetti_initialized = true;
      }
      function onResize() {
        if (worker) {
          var obj = {
            getBoundingClientRect: function() {
              if (!isLibCanvas) {
                return canvas.getBoundingClientRect();
              }
            }
          };
          resizer(obj);
          worker.postMessage({
            resize: {
              width: obj.width,
              height: obj.height
            }
          });
          return;
        }
        size.width = size.height = null;
      }
      function done() {
        animationObj = null;
        if (allowResize) {
          hasResizeEventRegistered = false;
          global.removeEventListener("resize", onResize);
        }
        if (isLibCanvas && canvas) {
          if (document.body.contains(canvas)) {
            document.body.removeChild(canvas);
          }
          canvas = null;
          initialized = false;
        }
      }
      if (allowResize && !hasResizeEventRegistered) {
        hasResizeEventRegistered = true;
        global.addEventListener("resize", onResize, false);
      }
      if (worker) {
        return worker.fire(options, size, done);
      }
      return fireLocal(options, size, done);
    }
    fire.reset = function() {
      if (worker) {
        worker.reset();
      }
      if (animationObj) {
        animationObj.reset();
      }
    };
    return fire;
  }
  var defaultFire;
  function getDefaultFire() {
    if (!defaultFire) {
      defaultFire = confettiCannon(null, { useWorker: true, resize: true });
    }
    return defaultFire;
  }
  function transformPath2D(pathString, pathMatrix, x, y, scaleX, scaleY, rotation) {
    var path2d = new Path2D(pathString);
    var t1 = new Path2D();
    t1.addPath(path2d, new DOMMatrix(pathMatrix));
    var t2 = new Path2D();
    t2.addPath(t1, new DOMMatrix([
      Math.cos(rotation) * scaleX,
      Math.sin(rotation) * scaleX,
      -Math.sin(rotation) * scaleY,
      Math.cos(rotation) * scaleY,
      x,
      y
    ]));
    return t2;
  }
  function shapeFromPath(pathData) {
    if (!canUsePaths) {
      throw new Error("path confetti are not supported in this browser");
    }
    var path, matrix;
    if (typeof pathData === "string") {
      path = pathData;
    } else {
      path = pathData.path;
      matrix = pathData.matrix;
    }
    var path2d = new Path2D(path);
    var tempCanvas = document.createElement("canvas");
    var tempCtx = tempCanvas.getContext("2d");
    if (!matrix) {
      var maxSize = 1e3;
      var minX = maxSize;
      var minY = maxSize;
      var maxX = 0;
      var maxY = 0;
      var width, height;
      for (var x = 0; x < maxSize; x += 2) {
        for (var y = 0; y < maxSize; y += 2) {
          if (tempCtx.isPointInPath(path2d, x, y, "nonzero")) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }
      width = maxX - minX;
      height = maxY - minY;
      var maxDesiredSize = 10;
      var scale = Math.min(maxDesiredSize / width, maxDesiredSize / height);
      matrix = [
        scale,
        0,
        0,
        scale,
        -Math.round(width / 2 + minX) * scale,
        -Math.round(height / 2 + minY) * scale
      ];
    }
    return {
      type: "path",
      path,
      matrix
    };
  }
  function shapeFromText(textData) {
    var text, scalar = 1, color = "#000000", fontFamily = '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';
    if (typeof textData === "string") {
      text = textData;
    } else {
      text = textData.text;
      scalar = "scalar" in textData ? textData.scalar : scalar;
      fontFamily = "fontFamily" in textData ? textData.fontFamily : fontFamily;
      color = "color" in textData ? textData.color : color;
    }
    var fontSize = 10 * scalar;
    var font = "" + fontSize + "px " + fontFamily;
    var canvas = new OffscreenCanvas(fontSize, fontSize);
    var ctx = canvas.getContext("2d");
    ctx.font = font;
    var size = ctx.measureText(text);
    var width = Math.ceil(size.actualBoundingBoxRight + size.actualBoundingBoxLeft);
    var height = Math.ceil(size.actualBoundingBoxAscent + size.actualBoundingBoxDescent);
    var padding = 2;
    var x = size.actualBoundingBoxLeft + padding;
    var y = size.actualBoundingBoxAscent + padding;
    width += padding + padding;
    height += padding + padding;
    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext("2d");
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    var scale = 1 / scalar;
    return {
      type: "bitmap",
      // TODO these probably need to be transfered for workers
      bitmap: canvas.transferToImageBitmap(),
      matrix: [scale, 0, 0, scale, -width * scale / 2, -height * scale / 2]
    };
  }
  module.exports = function() {
    return getDefaultFire().apply(this, arguments);
  };
  module.exports.reset = function() {
    getDefaultFire().reset();
  };
  module.exports.create = confettiCannon;
  module.exports.shapeFromPath = shapeFromPath;
  module.exports.shapeFromText = shapeFromText;
})((function() {
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  return this || {};
})(), module$1, false);
const confetti = module$1.exports;
module$1.exports.create;
function GlassKeypad({ value, onChange, maxLength = 4 }) {
  const press = (k) => {
    if (k === "del") return onChange(value.slice(0, -1));
    if (value.length < maxLength) onChange(value + k);
  };
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xs mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-3 mb-8", children: Array.from({ length: maxLength }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        animate: {
          scale: i < value.length ? 1.15 : 1,
          backgroundColor: i < value.length ? "oklch(0.85 0.2 200)" : "oklch(1 0 0 / 0.18)",
          boxShadow: i < value.length ? "0 0 16px oklch(0.85 0.2 200 / 0.8)" : "none"
        },
        transition: { type: "spring", stiffness: 400, damping: 18 },
        className: "h-3.5 w-3.5 rounded-full"
      },
      i
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: keys.map((k, i) => {
      if (k === "")
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "" }, i);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.button,
        {
          type: "button",
          onClick: () => press(k),
          whileTap: { scale: 0.9 },
          whileHover: { scale: 1.05 },
          transition: { type: "spring", stiffness: 400, damping: 16 },
          className: "glass focus-ring-tv aspect-square rounded-2xl font-display font-medium text-2xl sm:text-3xl text-foreground/95 hover:bg-white/15 transition-colors flex items-center justify-center",
          style: {
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)"
          },
          children: k === "del" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Delete, { className: "w-6 h-6" }) : k
        },
        i
      );
    }) })
  ] });
}
function Dashboard({ card, onLogout, token, cardId }) {
  const [openSection, setOpenSection] = reactExports.useState(
    null
  );
  const [showSettings, setShowSettings] = reactExports.useState(false);
  const [changePinMode, setChangePinMode] = reactExports.useState(null);
  const [currentPin, setCurrentPin] = reactExports.useState("");
  const [newPin, setNewPin] = reactExports.useState("");
  const [confirmPin, setConfirmPin] = reactExports.useState("");
  const [pinError, setPinError] = reactExports.useState(null);
  const [pinBusy, setPinBusy] = reactExports.useState(false);
  const [showVideoMessage, setShowVideoMessage] = reactExports.useState(false);
  const [showEmailEditor, setShowEmailEditor] = reactExports.useState(false);
  const [recoveryEmail, setRecoveryEmail] = reactExports.useState(card.recoveryEmail || "");
  const [recoveryMsg, setRecoveryMsg] = reactExports.useState(null);
  const [recoveryBusy, setRecoveryBusy] = reactExports.useState(false);
  const changePinFn = useServerFn(changeCardPin);
  const storeEmailFn = useServerFn(storeCardRecoveryEmail);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.6 },
      className: "relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowSettings(!showSettings),
            className: "p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-5 h-5" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.3, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            transition: { type: "spring", stiffness: 90, damping: 12 },
            className: "flex flex-col items-center text-center",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative pulse-ring rounded-full glow-cyan", children: card.photoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: card.photoUrl,
                  alt: card.studentName,
                  className: "h-28 w-28 sm:h-36 sm:w-36 rounded-full object-cover ring-4 ring-[color:var(--neon-cyan)]/60"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-28 w-28 sm:h-36 sm:w-36 rounded-full glass-strong flex items-center justify-center text-4xl font-display", children: card.studentName.charAt(0) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "h1",
                {
                  className: "mt-6 font-display font-semibold tracking-tight text-foreground",
                  style: { fontSize: "clamp(1.75rem, 5vw, 3.25rem)" },
                  children: [
                    "Welcome back,",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-text", children: card.studentName.split(" ")[0] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-fluid-body text-muted-foreground", children: "Your memory portal is unlocked." })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TrioCard,
            {
              title: "Memory Vault",
              subtitle: "Photos & documents",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  animate: { rotateY: [0, 12, 0, -12, 0] },
                  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "w-12 h-12" })
                }
              ),
              glow: "glow-cyan",
              accent: "oklch(0.85 0.2 200)",
              url: card.driveUrl,
              delay: 0.1
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TrioCard,
            {
              title: "Vibe Sync",
              subtitle: "Their favorite tracks",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-end gap-1 h-12", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "w-12 h-12 absolute opacity-30" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end gap-1 ml-14 h-10", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.span,
                  {
                    animate: { scaleY: [0.3, 1, 0.5, 0.9, 0.3] },
                    transition: {
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut"
                    },
                    className: "w-1.5 h-full bg-[color:var(--neon-violet)] rounded-full origin-bottom"
                  },
                  i
                )) })
              ] }),
              glow: "glow-violet",
              accent: "oklch(0.7 0.22 295)",
              url: card.spotifyUrl,
              delay: 0.2,
              onOpen: () => setOpenSection("spotify"),
              isOpen: openSection === "spotify",
              onClose: () => setOpenSection(null),
              embed: card.spotifyUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(SpotifyEmbed, { url: card.spotifyUrl }) : void 0
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TrioCard,
            {
              title: "The Cinema",
              subtitle: "A moment captured",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-12 h-12 fill-current" }),
              glow: "glow-pink",
              accent: "oklch(0.75 0.22 350)",
              url: card.videoUrl,
              delay: 0.3,
              customAction: () => setShowVideoMessage(true)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onLogout,
            className: "text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline",
            children: "Lock portal"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showVideoMessage && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6 z-50",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { scale: 0.9, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0.9, opacity: 0 },
                className: "glass rounded-3xl p-8 max-w-md w-full text-center",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl", children: "🎬" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-lg mb-2", children: "Video Under Editing" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Your video is currently being edited. We'll notify you as soon as it's ready!" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setShowVideoMessage(false),
                      className: "w-full px-4 py-3 bg-[color:var(--neon-cyan)] rounded-xl text-sm font-medium text-black hover:brightness-110 transition-all",
                      children: "Got it"
                    }
                  )
                ]
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showSettings && token && cardId && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6 z-50",
            onClick: () => setShowSettings(false),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { scale: 0.9, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0.9, opacity: 0 },
                className: "glass rounded-3xl p-8 max-w-md w-full",
                onClick: (e) => e.stopPropagation(),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold", children: "Account Settings" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => setShowSettings(false),
                        className: "text-muted-foreground hover:text-foreground",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        onClick: () => {
                          setChangePinMode("verify");
                          setPinError(null);
                        },
                        className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors border border-white/10 hover:border-white/20 text-left",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-4 h-4 text-[color:var(--neon-cyan)]" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Change PIN" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Update your security code" })
                          ] })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        onClick: () => {
                          setShowEmailEditor((value) => !value);
                          setRecoveryMsg(null);
                        },
                        className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors border border-white/10 hover:border-white/20 text-left",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-4 h-4 text-[color:var(--neon-violet)]" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Recovery Email" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: card.recoveryEmail || "Set email for PIN recovery" })
                          ] })
                        ]
                      }
                    ),
                    showEmailEditor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "email",
                          value: recoveryEmail,
                          onChange: (e) => setRecoveryEmail(e.target.value),
                          placeholder: "name@email.com",
                          className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--neon-cyan)]"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: async () => {
                              if (!token || !cardId) return;
                              if (!recoveryEmail.trim()) {
                                setRecoveryMsg("Email is required");
                                return;
                              }
                              setRecoveryBusy(true);
                              setRecoveryMsg(null);
                              const r = await storeEmailFn({
                                data: { uniqueId: cardId, token, email: recoveryEmail.trim() }
                              });
                              setRecoveryBusy(false);
                              if (r.ok) {
                                setRecoveryMsg("Recovery email updated.");
                              } else {
                                setRecoveryMsg(r.error || "Failed to update recovery email");
                              }
                            },
                            disabled: recoveryBusy,
                            className: "flex-1 px-4 py-2.5 rounded-xl bg-[color:var(--neon-cyan)] text-black text-sm font-medium disabled:opacity-50",
                            children: recoveryBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mx-auto" }) : "Save email"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: () => {
                              setShowEmailEditor(false);
                              setRecoveryEmail(card.recoveryEmail || "");
                              setRecoveryMsg(null);
                            },
                            className: "px-4 py-2.5 rounded-xl border border-white/10 text-sm",
                            children: "Cancel"
                          }
                        )
                      ] }),
                      recoveryMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[color:var(--neon-cyan)]", children: recoveryMsg })
                    ] })
                  ] })
                ]
              }
            )
          }
        ) }),
        changePinMode && token && cardId && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6 z-50",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { scale: 0.9, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0.9, opacity: 0 },
                className: "glass rounded-3xl p-8 max-w-md w-full",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-lg", children: "Change PIN" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => {
                          setChangePinMode(null);
                          setCurrentPin("");
                          setNewPin("");
                          setConfirmPin("");
                          setPinError(null);
                        },
                        className: "text-muted-foreground hover:text-foreground",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
                      }
                    )
                  ] }),
                  changePinMode === "verify" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Enter your current PIN" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "password",
                        placeholder: "••••",
                        value: currentPin,
                        onChange: (e) => {
                          setPinError(null);
                          setCurrentPin(e.target.value.slice(0, 6));
                        },
                        maxLength: 6,
                        className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--neon-cyan)]"
                      }
                    ),
                    pinError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[color:var(--neon-pink)]", children: pinError }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => {
                          if (currentPin.length < 4) {
                            setPinError("PIN must be at least 4 digits");
                            return;
                          }
                          setChangePinMode("new");
                        },
                        className: "w-full px-4 py-3 bg-[color:var(--neon-cyan)] rounded-xl text-sm font-medium text-black hover:brightness-110 transition-all",
                        children: "Continue"
                      }
                    )
                  ] }),
                  changePinMode === "new" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Enter your new PIN (4-6 digits)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "password",
                        placeholder: "••••",
                        value: newPin,
                        onChange: (e) => {
                          setPinError(null);
                          setNewPin(e.target.value.slice(0, 6));
                        },
                        maxLength: 6,
                        className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--neon-cyan)]"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => setChangePinMode("confirm"),
                        className: "w-full px-4 py-3 bg-[color:var(--neon-cyan)] rounded-xl text-sm font-medium text-black hover:brightness-110 transition-all",
                        children: "Continue"
                      }
                    )
                  ] }),
                  changePinMode === "confirm" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Confirm your new PIN" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "password",
                        placeholder: "••••",
                        value: confirmPin,
                        onChange: (e) => {
                          setPinError(null);
                          setConfirmPin(e.target.value.slice(0, 6));
                        },
                        maxLength: 6,
                        className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--neon-cyan)]"
                      }
                    ),
                    pinError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[color:var(--neon-pink)]", children: pinError }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: async () => {
                          if (newPin !== confirmPin) {
                            setPinError("PINs don't match");
                            return;
                          }
                          if (newPin.length < 4) {
                            setPinError("PIN must be at least 4 digits");
                            return;
                          }
                          setPinBusy(true);
                          const result = await changePinFn({
                            data: {
                              uniqueId: cardId,
                              token,
                              currentPin,
                              newPin
                            }
                          });
                          setPinBusy(false);
                          if (result.ok) {
                            setChangePinMode(null);
                            setCurrentPin("");
                            setNewPin("");
                            setConfirmPin("");
                            setShowSettings(false);
                            alert("PIN changed successfully!");
                          } else {
                            setPinError(result.error || "Failed to change PIN");
                          }
                        },
                        disabled: pinBusy,
                        className: "w-full px-4 py-3 bg-[color:var(--neon-cyan)] rounded-xl text-sm font-medium text-black hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2",
                        children: pinBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Update PIN"
                      }
                    )
                  ] })
                ]
              }
            )
          }
        )
      ]
    }
  );
}
function TrioCard({
  title,
  subtitle,
  icon,
  glow,
  accent,
  url,
  delay,
  embed,
  isOpen,
  onOpen,
  onClose,
  customAction
}) {
  const disabled = !url;
  const handleClick = () => {
    if (disabled) return;
    if (customAction) return customAction();
    if (embed && onOpen && !isOpen) return onOpen();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { type: "spring", stiffness: 90, damping: 14, delay },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.button,
          {
            type: "button",
            onClick: handleClick,
            disabled,
            whileHover: disabled ? void 0 : { scale: 1.04, y: -4 },
            whileTap: disabled ? void 0 : { scale: 0.97 },
            transition: { type: "spring", stiffness: 300, damping: 18 },
            className: `group glass focus-ring-tv relative w-full text-left p-6 sm:p-8 rounded-3xl overflow-hidden ${disabled ? "opacity-50 cursor-not-allowed" : `hover:${glow}`}`,
            style: {
              minHeight: "clamp(180px, 22vh, 260px)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                  style: {
                    background: `radial-gradient(circle at 50% 0%, ${accent}30, transparent 70%)`
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col h-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: accent }, className: "mb-4", children: icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h3",
                  {
                    className: "font-display font-semibold text-foreground",
                    style: { fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" },
                    children: title
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground text-sm sm:text-base", children: subtitle }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto pt-4 flex items-center gap-2 text-sm font-medium opacity-80 group-hover:opacity-100", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: disabled ? "Not set" : "Open" }),
                  !disabled && /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-4 h-4" })
                ] })
              ] })
            ]
          }
        ),
        embed && isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { height: 0, opacity: 0 },
            animate: { height: "auto", opacity: 1 },
            className: "mt-3 overflow-hidden rounded-2xl glass",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3", children: embed }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "w-full py-2 text-xs text-muted-foreground hover:text-foreground",
                  children: "Close"
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function SpotifyEmbed({ url }) {
  const embed = url.replace("open.spotify.com/", "open.spotify.com/embed/");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "iframe",
    {
      src: embed,
      width: "100%",
      height: "152",
      frameBorder: 0,
      allow: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
      loading: "lazy",
      className: "rounded-xl",
      title: "Spotify player"
    }
  );
}
const tokenKey = (id) => `signatureday.tok.${id}`;
function CardPage() {
  const {
    id
  } = useParams({
    from: "/card/$id"
  });
  const getPublic = useServerFn(getCardPublic);
  const getWithToken = useServerFn(getCardWithToken);
  const initFn = useServerFn(initializePin);
  const unlockFn = useServerFn(unlockCard);
  const storeEmailFn = useServerFn(storeCardRecoveryEmail);
  const [publicCard, setPublicCard] = reactExports.useState(void 0);
  const [unlocked, setUnlocked] = reactExports.useState(null);
  const [pin, setPin] = reactExports.useState("");
  const [confirmPin, setConfirmPin] = reactExports.useState("");
  const [phase, setPhase] = reactExports.useState("enter");
  const [error, setError] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [typed, setTyped] = reactExports.useState("");
  const [token, setToken] = reactExports.useState(null);
  const [showEmailRecovery, setShowEmailRecovery] = reactExports.useState(false);
  const [emailRecoveryMode, setEmailRecoveryMode] = reactExports.useState(null);
  const [recoveryEmail, setRecoveryEmail] = reactExports.useState("");
  const requestResetFn = useServerFn(requestCardPinReset);
  const [recoveryBusy, setRecoveryBusy] = reactExports.useState(false);
  const [recoveryError, setRecoveryError] = reactExports.useState(null);
  const fired = reactExports.useRef(false);
  reactExports.useEffect(() => {
    (async () => {
      const {
        card
      } = await getPublic({
        data: {
          uniqueId: id
        }
      });
      setPublicCard(card);
      if (!card) return;
      const tok = localStorage.getItem(tokenKey(id));
      if (tok) {
        setToken(tok);
        const r = await getWithToken({
          data: {
            uniqueId: id,
            token: tok
          }
        });
        if (r.card) setUnlocked(r.card);
        else localStorage.removeItem(tokenKey(id));
      }
    })();
  }, [id, getPublic, getWithToken]);
  reactExports.useEffect(() => {
    const expireToken = () => {
      localStorage.removeItem(tokenKey(id));
      setToken(null);
      setUnlocked(null);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") expireToken();
    };
    window.addEventListener("pagehide", expireToken);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", expireToken);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [id]);
  reactExports.useEffect(() => {
    if (!publicCard) return;
    const name = publicCard.studentName;
    const greet = publicCard.isFirstTime ? `Hello, ${name}` : `Welcome, ${name}`;
    let i = 0;
    setTyped("");
    const t = setInterval(() => {
      i++;
      setTyped(greet.slice(0, i));
      if (i >= greet.length) clearInterval(t);
    }, 55);
    return () => clearInterval(t);
  }, [publicCard]);
  const handlePinComplete = async (value) => {
    if (!publicCard) return;
    setError(null);
    if (publicCard.isFirstTime) {
      if (phase === "enter") {
        setPin(value);
        setPhase("confirm");
        setConfirmPin("");
        return;
      }
      if (value !== pin) {
        setError("PINs don't match. Try again.");
        setPhase("enter");
        setPin("");
        setConfirmPin("");
        return;
      }
      setBusy(true);
      const r = await initFn({
        data: {
          uniqueId: id,
          pin: value
        }
      });
      setBusy(false);
      if (!r.ok) {
        setError(r.error);
        setPhase("enter");
        setPin("");
        setConfirmPin("");
        return;
      }
      localStorage.setItem(tokenKey(id), r.token);
      if (!fired.current) {
        fired.current = true;
        confetti({
          particleCount: 120,
          spread: 90,
          origin: {
            y: 0.6
          },
          colors: ["#5ce1ff", "#b682ff", "#ff6fb5", "#ffffff"]
        });
      }
      setToken(r.token);
      setEmailRecoveryMode("setup");
      setShowEmailRecovery(true);
    } else {
      setBusy(true);
      const r = await unlockFn({
        data: {
          uniqueId: id,
          pin: value
        }
      });
      setBusy(false);
      if (!r.ok) {
        setError(r.error);
        setPin("");
        return;
      }
      localStorage.setItem(tokenKey(id), r.token);
      setToken(r.token);
      const got = await getWithToken({
        data: {
          uniqueId: id,
          token: r.token
        }
      });
      if (got.card) setUnlocked(got.card);
    }
  };
  const maxLength = 4;
  const current = publicCard?.isFirstTime ? phase === "enter" ? pin : confirmPin : pin;
  const setCurrent = (v) => {
    setError(null);
    if (publicCard?.isFirstTime && phase === "confirm") setConfirmPin(v);
    else setPin(v);
    if (v.length === maxLength) handlePinComplete(v);
  };
  if (publicCard === void 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 animate-spin text-[color:var(--neon-cyan)]" }) });
  }
  if (publicCard === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen flex items-center justify-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-3xl p-8 sm:p-10 max-w-md text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-10 h-10 mx-auto text-[color:var(--neon-pink)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 font-display text-2xl", children: "Card not recognized" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-muted-foreground text-sm", children: [
        "The NFC card with ID ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: id }),
        " hasn't been registered. Ask your admin to add it."
      ] })
    ] }) });
  }
  if (unlocked) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Dashboard, { card: unlocked, token, cardId: id, onLogout: () => {
      localStorage.removeItem(tokenKey(id));
      setUnlocked(null);
      setPin("");
      setConfirmPin("");
      setPhase("enter");
      setToken(null);
      setShowEmailRecovery(false);
      setRecoveryEmail("");
      setEmailRecoveryMode(null);
    } });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen flex flex-col items-center justify-center px-6 py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 16
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      type: "spring",
      stiffness: 80,
      damping: 14
    }, className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "shimmer-text font-display font-semibold", style: {
          fontSize: "clamp(1.75rem, 6vw, 3.25rem)"
        }, children: [
          typed,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-70 animate-pulse", children: "|" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground text-fluid-body", children: publicCard.isFirstTime ? phase === "enter" ? "Initialize Your Secure Key" : "Confirm your PIN" : "Identity Verification Required" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
        opacity: 0,
        x: 20
      }, animate: {
        opacity: 1,
        x: 0
      }, exit: {
        opacity: 0,
        x: -20
      }, transition: {
        type: "spring",
        stiffness: 200,
        damping: 22
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(GlassKeypad, { value: current, onChange: setCurrent, maxLength }) }, phase + (publicCard.isFirstTime ? "f" : "r")) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.p, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, className: "mt-6 text-center text-sm text-[color:var(--neon-pink)]", children: error }),
      busy && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin text-[color:var(--neon-cyan)]" }) }),
      !publicCard?.isFirstTime && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        setEmailRecoveryMode("reset");
        setShowEmailRecovery(true);
      }, className: "mt-6 text-sm text-[color:var(--neon-cyan)] hover:text-[color:var(--neon-pink)] transition-colors underline-offset-2 hover:underline", children: "Forgot PIN? Reset it" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showEmailRecovery && publicCard && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, exit: {
      opacity: 0
    }, className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      scale: 0.9,
      opacity: 0
    }, animate: {
      scale: 1,
      opacity: 1
    }, exit: {
      scale: 0.9,
      opacity: 0
    }, className: "glass rounded-3xl p-8 max-w-md w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-6 h-6 text-[color:var(--neon-cyan)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-lg", children: emailRecoveryMode === "setup" ? "Secure Your Access" : "Reset PIN" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setShowEmailRecovery(false);
          setEmailRecoveryMode(null);
          setRecoveryEmail("");
          setRecoveryError(null);
        }, className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" }) })
      ] }),
      publicCard.recoveryEmail ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "We will send the reset link to:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground mb-4", children: publicCard.recoveryEmail }),
        emailRecoveryMode === "reset" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "If this email is outdated, unlock the card and change it from Settings." })
      ] }) : emailRecoveryMode === "reset" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground", children: "No recovery email is saved for this card. Please contact the admin team for help." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Add an email to recover your PIN if you forget it. You can skip this for now." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", placeholder: "your@email.com", value: recoveryEmail, onChange: (e) => {
          setRecoveryError(null);
          setRecoveryEmail(e.target.value);
        }, className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--neon-cyan)] mb-4" })
      ] }),
      recoveryError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[color:var(--neon-pink)] mb-4", children: recoveryError }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
          setShowEmailRecovery(false);
          setEmailRecoveryMode(null);
          setRecoveryEmail("");
          setRecoveryError(null);
          if (token) {
            const got = await getWithToken({
              data: {
                uniqueId: id,
                token
              }
            });
            if (got.card) setUnlocked(got.card);
          }
        }, className: "flex-1 px-4 py-3 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors", children: publicCard.isFirstTime ? "Skip for Now" : "Cancel" }),
        publicCard.recoveryEmail ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
          setRecoveryBusy(true);
          const r = await requestResetFn({
            data: {
              uniqueId: id
            }
          });
          setRecoveryBusy(false);
          if (r.ok) {
            setShowEmailRecovery(false);
            setEmailRecoveryMode(null);
            alert("Reset link sent (or returned) — check your email.\nIf running locally without SMTP, the reset URL is copied to clipboard.");
            if (r.resetUrl) {
              try {
                await navigator.clipboard.writeText(r.resetUrl);
              } catch {
              }
            }
          } else {
            setRecoveryError(r.error || "Failed to send reset link");
          }
        }, disabled: recoveryBusy, className: "flex-1 px-4 py-3 bg-[color:var(--neon-cyan)] rounded-xl text-sm font-medium text-black hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2", children: recoveryBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Send Reset Link" }) : emailRecoveryMode === "reset" ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setShowEmailRecovery(false);
          setEmailRecoveryMode(null);
          setRecoveryEmail("");
          setRecoveryError(null);
        }, className: "flex-1 px-4 py-3 bg-[color:var(--neon-cyan)] rounded-xl text-sm font-medium text-black hover:brightness-110 transition-all", children: "Contact Admin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
          if (!recoveryEmail.trim()) {
            setRecoveryError("Email is required");
            return;
          }
          setRecoveryBusy(true);
          const result = await storeEmailFn({
            data: {
              uniqueId: id,
              token: token || "",
              email: recoveryEmail
            }
          });
          setRecoveryBusy(false);
          if (result.ok) {
            setShowEmailRecovery(false);
            setEmailRecoveryMode(null);
            setRecoveryEmail("");
            if (token) {
              const got = await getWithToken({
                data: {
                  uniqueId: id,
                  token
                }
              });
              if (got.card) setUnlocked(got.card);
            }
            alert("Recovery email saved.");
          } else {
            setRecoveryError(result.error || "Failed to save email");
          }
        }, disabled: recoveryBusy, className: "flex-1 px-4 py-3 bg-[color:var(--neon-cyan)] rounded-xl text-sm font-medium text-black hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2", children: recoveryBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Save Email" })
      ] })
    ] }) }) })
  ] });
}
export {
  CardPage as component
};
