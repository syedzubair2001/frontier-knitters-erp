// GLOBAL dropdown upgrade — fixes hover color on EVERY native <select>
// across the whole project (Login role, all pages, all filter bars).
// Chrome/Edge on Windows draw native option popups with the OS, so
// `option:hover` CSS is ignored (grey highlight). THIS FILE IS NOW RETIRED:
// the project codemod replaced every <select> with <BlueSelect>,
// so this module stays only to avoid breaking old imports.
export function upgradeSelects() { /* retired — BlueSelect is used directly */ }
export default upgradeSelects;
const UPGRADED = new WeakSet();
let openTwin = null;

function closeOpenTwin() {
  if (openTwin) {
    openTwin.listEl.style.display = 'none';
    openTwin.btnEl.classList.remove('open');
    openTwin.btnEl.setAttribute('aria-expanded', 'false');
    openTwin = null;
  }
}

function optionsOf(select) {
  return Array.from(select.options).map((o) => ({
    value: o.value,
    label: (o.textContent || o.value || '').trim() || o.value,
  }));
}

function fireReactChange(select, value) {
  try {
    const proto = Object.getPrototypeOf(document.createElement('select'));
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(select, value);
    else select.value = value;
  } catch { try { select.value = value; } catch { /* noop */ } }
  try { select.dispatchEvent(new Event('change', { bubbles: true })); } catch { /* noop */ }
  try { select.dispatchEvent(new Event('input', { bubbles: true })); } catch { /* noop */ }
}
