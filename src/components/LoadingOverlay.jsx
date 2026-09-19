import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { subscribeLoading, startNavigation, markNavigationDone } from '../loading';
import FrontierLogo from './FrontierLogo';

/** Shared branded spinner mark (rings + logo). The logo sits well clear of the
 *  rings — see .fk-loader-mark / .fk-loader-ring sizes in index.css. */
function LoaderMark() {
  return (
    <div className="fk-loader-mark">
      <div className="fk-loader-ring"><span /><span /><span /></div>
      <FrontierLogo height={18} className="fk-loader-logo" />
    </div>
  );
}

/**
 * Full-screen splash used as the <Suspense> fallback while a screen's code
 * chunk is still downloading (lazy routes) — so a slow network keeps showing
 * the loading animation until the next screen is ready.
 */
export function LoadingFallback() {
  return (
    <div className="fk-loadpage" role="status" aria-live="polite" aria-label="Loading screen">
      <div className="fk-loader-card">
        <LoaderMark />
        <p className="fk-loader-text">Loading…</p>
      </div>
    </div>
  );
}

/**
 * Global loading animation — ONLY for screen-to-screen navigation.
 *
 * - Nothing happens on ordinary clicks (buttons, radios, checkboxes, dropdowns,
 *   menus, tabs…) — the app answers instantly, so no spinner.
 * - Clicking a link to ANOTHER screen starts the animation and it stays up until
 *   the destination screen has actually rendered — so a slow network / slow
 *   chunk keeps it spinning for as long as the load really takes.
 * - Also reacts to explicit showLoading() / hideLoading() / withLoading().
 * - Never blocks interaction: the overlay ignores pointer events.
 */
export default function LoadingOverlay({ enabled = true }) {
  const [active, setActive] = useState(false);
  const { pathname } = useLocation();
  const pathRef = useRef(pathname);
  pathRef.current = pathname; // keep the click handler aware of the current route

  // Listen to the global loading store
  useEffect(() => subscribeLoading(setActive), []);

  // Only a link click that goes to a DIFFERENT screen starts the animation.
  useEffect(() => {
    if (!enabled) return undefined;
    const onClick = (e) => {
      if (e.defaultPrevented) return;
      const link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!link) return; // ordinary click (button / input / menu) → no loading
      const target = (link.getAttribute('href') || '').split('#')[0].split('?')[0];
      if (!target || !target.startsWith('/')) return;
      if (target === pathRef.current) return; // same screen → no loading
      startNavigation(); // stays open until markNavigationDone()
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [enabled]);

  // The new screen has rendered → let the animation settle and fade out
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => markNavigationDone());
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [pathname]);

  if (!active) return null;

  return (
    <div className="fk-loader" role="status" aria-live="polite" aria-label="Loading">
      <div className="fk-loader-bar"><span /></div>

      <div className="fk-loader-center">
        <div className="fk-loader-card">
          <LoaderMark />
          <p className="fk-loader-text">Loading…</p>
        </div>
      </div>
    </div>
  );
}