// Global loading-indicator store.
//
// The loading animation is shown ONLY when moving to another screen:
//   • a link to a different route  → startNavigation() keeps the animation up
//     until the destination screen has rendered (so a slow network really shows)
//   • explicit work                → showLoading() / hideLoading() / withLoading()
//
// Ordinary clicks (buttons, radios, checkboxes, dropdowns, menus) never trigger
// it — only real screen loads and any work you explicitly wrap.

const MIN_VISIBLE_MS = 420; // keep the animation on screen long enough to be seen

const listeners = new Set();

let visible = false;   // what the overlay is currently rendering
let shownAt = 0;       // timestamp of the last time it became visible
let pending = 0;       // number of explicit showLoading() calls not yet hidden
let pulsing = false;   // a click pulse is running
let hideTimer = null;  // pending "minimum visible time" timer
let pulseTimer = null; // pending click-pulse timer

function paint() {
  listeners.forEach((fn) => {
    try { fn(visible); } catch { /* never let a listener break the app */ }
  });
}

/** Recompute whether the overlay should be visible. */
function refresh() {
  const shouldShow = pending > 0 || pulsing;

  if (shouldShow) {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (!visible) { visible = true; shownAt = Date.now(); paint(); }
    return;
  }

  const left = MIN_VISIBLE_MS - (Date.now() - shownAt);
  if (left > 0) {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { hideTimer = null; visible = false; paint(); }, left);
    return;
  }

  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  if (visible) { visible = false; paint(); }
}

/** Subscribe to loading state changes. @returns unsubscribe function */
export function subscribeLoading(fn) {
  listeners.add(fn);
  fn(visible);
  return () => listeners.delete(fn);
}

export function isLoading() { return pending > 0 || pulsing; }

/** Start a loading task (supports overlapping tasks). */
export function showLoading() {
  pending += 1;
  refresh();
}

/** Finish a loading task. Pass `force` to clear every pending task at once. */
export function hideLoading(force = false) {
  pending = force ? 0 : Math.max(0, pending - 1);
  refresh();
}

/** Opt-in: play the animation for `ms` milliseconds. Not used on ordinary clicks. */
export function pulseLoading(ms = 550) {
  pulsing = true;
  refresh();
  if (pulseTimer) clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => {
    pulseTimer = null;
    pulsing = false;
    refresh();
  }, ms);
}

// ── Screen-to-screen navigation loading ────────────────────────────────────
// A link click holds the animation open (indefinitely) until the next screen
// has actually rendered — so a slow network / slow chunk keeps it spinning.
let navTimer = null;

export function startNavigation(timeoutMs = 10000) {
  pending += 1;
  refresh();
  if (navTimer) clearTimeout(navTimer);
  // Safety net: never trap the user behind the spinner if a screen never reports.
  navTimer = setTimeout(() => { navTimer = null; hideLoading(true); }, timeoutMs);
}

/** Called right after the destination screen has rendered. */
export function markNavigationDone() {
  if (navTimer) { clearTimeout(navTimer); navTimer = null; }
  if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
  pulsing = false;
  hideLoading(true);
}

/** Wrap a click handler so the animation plays while it runs (sync or async). */
export function withLoading(handler, minMs = 420) {
  return function wrapped(...args) {
    const started = Date.now();
    showLoading();
    const done = () => {
      const left = minMs - (Date.now() - started);
      if (left > 0) setTimeout(() => hideLoading(), left);
      else hideLoading();
    };
    try {
      const out = handler ? handler.apply(this, args) : undefined;
      if (out && typeof out.then === 'function') { out.then(done, done); return out; }
      done();
      return undefined;
    } catch (err) {
      done();
      throw err;
    }
  };
}