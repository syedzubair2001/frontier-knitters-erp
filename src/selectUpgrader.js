// RETIRED: the project codemod replaced every native <select> with the
// div-based <BlueSelect> component, so no runtime DOM upgrade is needed.
// Kept as a no-op so the old `startSelectUpgrader()` import keeps working.
export function startSelectUpgrader() { /* no-op — BlueSelect used directly */ }
export default startSelectUpgrader;

function readOptions(sel) {
  const out = [];
  sel.querySelectorAll('option').forEach((o) => {
    out.push({ value: o.value, label: (o.textContent || '').trim() || o.value });
  });
  return out.length ? out : [{ value: '', label: '-- Select --' }];
}
function currentLabel(sel, opts) {
  const v = sel.value;
  const hit = opts.find((o) => o.value === v);
  if (hit) return { label: hit.label, isPh: v === '' };
  if (sel.selectedIndex >= 0 && sel.options[sel.selectedIndex]) {
    return { label: sel.options[sel.selectedIndex].textContent.trim(), isPh: v === '' };
  }
  return { label: '-- Select --', isPh: true };
}
function variantClass(sel) {
  const c = ' ' + (sel.className || '') + ' ';
  if (sel.closest && sel.closest('table')) return ' compact';
  if (/inline-select|inline/.test(c)) return ' inline';
  if (/inp|dsel|status|compact/.test(c)) return ' compact';
  return '';
}
function buildTwin(sel) {
  if (sel.dataset.bselDone) return;
  if (sel.closest && sel.closest('.bsel')) return;
  if (sel.multiple || sel.size > 1) return;
  sel.dataset.bselDone = '1';
  const wrap = document.createElement('div');
  wrap.className = 'native-bsel' + variantClass(sel);
  if (sel.style && sel.style.width) wrap.style.width = sel.style.width;
  if (sel.className && sel.className.indexOf('inline-select') >= 0) {
    wrap.style.display = 'inline-block'; wrap.style.width = 'auto';
  }
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'native-bsel-btn';
  const lab = document.createElement('span');
  lab.className = 'native-bsel-label';
  const caret = document.createElement('span');
  caret.className = 'native-bsel-caret'; caret.textContent = '▾';
  btn.appendChild(lab); btn.appendChild(caret);
  const list = document.createElement('div');
  list.className = 'native-bsel-list'; list.style.display = 'none';
  wrap.appendChild(btn); wrap.appendChild(list);
  sel.classList.add('bsel-hidden');
  sel.insertAdjacentElement('afterend', wrap);
  let opts = readOptions(sel);
  const paint = () => {
    opts = readOptions(sel);
    const cur = currentLabel(sel, opts);
    lab.textContent = cur.label;
    btn.classList.toggle('is-placeholder', !!cur.isPh);
  };
  const renderItems = (filter) => {
    list.innerHTML = '';
    const q = (filter || '').trim().toLowerCase();
    if (opts.length >= 7) {
      const sw = document.createElement('div');
      sw.className = 'native-bsel-searchwrap';
      const inp = document.createElement('input');
      inp.className = 'native-bsel-search'; inp.placeholder = 'Search…';
      inp.addEventListener('click', (e) => e.stopPropagation());
      inp.addEventListener('input', () => renderItems(inp.value));
      sw.appendChild(inp); list.appendChild(sw);
      setTimeout(() => inp.focus(), 20);
    }
    const box = document.createElement('div');
    box.className = 'native-bsel-items';
    const shown = q ? opts.filter((o) =>
      o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)) : opts;
    if (!shown.length) {
      const em = document.createElement('div');
      em.className = 'native-bsel-empty'; em.textContent = 'No matches';
      box.appendChild(em);
    }
    shown.forEach((o) => {
      const it = document.createElement('div');
      it.className = 'native-bsel-item' + (o.value === sel.value ? ' sel' : '');
      const s = document.createElement('span'); s.textContent = o.label;
      it.appendChild(s);
      if (o.value === sel.value) {
        const t = document.createElement('span');
        t.className = 'native-bsel-tick'; t.textContent = '✓';
        it.appendChild(t);
      }
      it.addEventListener('mouseenter', () => {
        box.querySelectorAll('.hi').forEach((x) => x.classList.remove('hi'));
        it.classList.add('hi');
      });
      it.addEventListener('click', () => {
        close();
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLSelectElement.prototype, 'value').set;
        const tracker = sel._valueTracker;
        try {
          if (tracker) tracker.stopTracking();
          if (setter) setter.call(sel, o.value);
          else sel.value = o.value;
        } catch (e) { sel.value = o.value; }
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        paint();
      });
      box.appendChild(it);
    });
    list.appendChild(box);
  };
  const open = () => {
    document.querySelectorAll('.native-bsel-list').forEach((l) => {
      l.style.display = 'none';
    });
    document.querySelectorAll('.native-bsel-btn.open').forEach((b) => {
      b.classList.remove('open');
    });
    paint(); renderItems(''); list.style.display = 'block';
    btn.classList.add('open');
  };
  const close = () => { list.style.display = 'none'; btn.classList.remove('open'); };
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sel.disabled) return;
    if (list.style.display === 'block') close(); else open();
  });
  document.addEventListener('mousedown', (e) => {
    if (!wrap.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  const refresh = () => {
    try {
      // Select removed by React (page change / re-render)? Remove our orphan twin.
      if (!sel.isConnected) {
        try { wrap.remove(); } catch (e) { /* ignore */ }
        const i = twins.indexOf(t);
        if (i >= 0) twins.splice(i, 1);
        try { obs.disconnect(); } catch (e) { /* ignore */ }
        return;
      }
      paint();
    } catch (e) { /* never break app */ }
  };
  const t = { sel, wrap, refresh, lastVal: sel.value, lastSig: '' };
  twins.push(t);
  const obs = new MutationObserver(() => setTimeout(refresh, 0));
  obs.observe(sel, {
    attributes: true, childList: true, subtree: true, characterData: true,
  });
  sel.addEventListener('change', () => setTimeout(paint, 0));
  paint();
  // Re-paint shortly after mount — React fills <option>s async on some pages.
  setTimeout(paint, 100); setTimeout(paint, 500);
}

function scan(root) {
  const nodes = root.querySelectorAll ? root.querySelectorAll('select') : [];
  nodes.forEach((s) => { try { buildTwin(s); } catch (e) { /* never break app */ } });
}
export function startSelectUpgrader() {
  // One global 500ms ticker syncs ALL twins (cheap: only repaints on change).
  // This catches React prop-driven value/option changes that fire no DOM event.
  setInterval(() => {
    for (let i = twins.length - 1; i >= 0; i--) {
      const t = twins[i];
      try {
        if (!t.sel.isConnected) {
          try { t.wrap.remove(); } catch (e) { /* ignore */ }
          twins.splice(i, 1);
          continue;
        }
        const sig = t.sel.value + '|' + t.sel.options.length + '|' +
          Array.from(t.sel.options).map((o) => o.value + '~' + (o.textContent || '').trim()).join(',');
        if (sig !== t.lastSig) { t.lastSig = sig; t.refresh(); }
      } catch (e) { /* never break app */ }
    }
  }, 500);
  const boot = () => {
    scan(document);
    new MutationObserver((muts) => {
      muts.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.tagName === 'SELECT') {
            try { buildTwin(n); } catch (e) { /* ignore */ }
          } else if (n.querySelectorAll) {
            n.querySelectorAll('select').forEach((s) => {
              try { buildTwin(s); } catch (e) { /* ignore */ }
            });
          }
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
}
