// Reusable custom dropdown — GUARANTEED base-theme blue hover in ALL browsers.
// Why this exists: Chrome / Edge on Windows draw native <select><option> lists
// with the OS popup, so `option:hover { background: blue }` CSS is IGNORED and
// users see the default OS highlight color (grey / system blue) instead of our
// theme blue (#1e6fe0 → #3d8bf3). This div-based dropdown is fully styled by us,
// so hover is ALWAYS the navbar blue.
// B) native-children drop-in (codemod friendly):
//      <BlueSelect value={x} onChange={(e) => setX(e.target.value)}>
//        <option value="">-- All --</option>{list.map(...)}</BlueSelect>
import { Children, isValidElement, useEffect, useMemo, useRef, useState } from 'react';

function textOf(node) {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) return textOf(node.props && node.props.children);
  return '';
}

function optionsFromChildren(children) {
  const out = [];
  const walk = (nodes) => {
    Children.forEach(nodes, (child) => {
      if (child == null || typeof child === 'boolean') return;
      if (Array.isArray(child)) { walk(child); return; }
      if (isValidElement(child)) {
        const tag = typeof child.type === 'string' ? child.type.toLowerCase() : '';
        if (tag === 'option') {
          const label = textOf(child.props.children);
          const v = child.props.value !== undefined && child.props.value !== null
            ? String(child.props.value) : label;
          out.push({ value: v, label });
          return;
        }
        if (child.props && child.props.children) walk(child.props.children);
        return;
      }
      if (typeof child === 'string' || typeof child === 'number') {
        const t = String(child).trim();
        if (t) out.push({ value: t, label: t });
      }
    });
  };
  walk(children);
  return out;
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) return [];
  return options.map((o) => {
    if (o && typeof o === 'object' && 'value' in o) {
      return { value: String(o.value), label: o.label ?? String(o.value) };
    }
    return { value: String(o), label: String(o) };
  });
}

export default function BlueSelect({
  value,
  onChange,
  options = null,
  children = null,
  placeholder = '-- Select --',
  className = '',
  style = null,
  disabled = false,
  name = '',
  id = '',
  title = '',
  searchableThreshold = 7,
}) {
  const fromOptions = useMemo(
    () => (options ? normalizeOptions(options) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(options ?? null)],
  );
  const fromChildren = useMemo(
    () => (options ? [] : optionsFromChildren(children)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options ? null : children],
  );
  const list = fromOptions || fromChildren;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(-1);
  const boxRef = useRef(null);
  const searchRef = useRef(null);

  const valStr = value == null ? '' : String(value);
  const selected = list.find((o) => o.value === valStr) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [list, query]);

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
        setHighlight(-1);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (open && list.length >= searchableThreshold) {
      setTimeout(() => searchRef.current && searchRef.current.focus(), 30);
    }
  }, [open, list.length, searchableThreshold]);

  const emit = (v) => {
    if (!onChange) return;
    try {
      const src = Function.prototype.toString.call(onChange);
      if (src.includes('.target')) {
        onChange({ target: { value: v, name } });
        return;
      }
    } catch { /* fall through to plain value */ }
    try {
      onChange(v);
    } catch {
      onChange({ target: { value: v, name } });
    }
  };

  const pick = (v) => {
    setOpen(false);
    setQuery('');
    setHighlight(-1);
    emit(v);
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
      return;
    }
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (open) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[highlight] || filtered[0];
        if (item) pick(item.value);
      }
    }
  };

  const variant = /inline-select|inline/.test(className)
    ? ' inline'
    : /inp|dsel|status|compact/.test(className)
      ? ' compact'
      : '';

  return (
    <div
      ref={boxRef}
      className={'bsel' + variant + (className ? ' ' + className : '')}
      style={style}
      data-name={name}
      id={id ? id + '-blue' : undefined}
      title={title}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        className={'bsel-btn' + (open ? ' open' : '') + (!selected ? ' is-placeholder' : '')}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        title={title}
      >
        <span className="bsel-label">{selected ? selected.label : placeholder}</span>
        <span className="bsel-caret">▾</span>
      </button>
      {open && (
        <div className="bsel-list" role="listbox">
          {list.length >= searchableThreshold && (
            <div className="bsel-searchwrap">
              <input
                ref={searchRef}
                className="bsel-search"
                placeholder="Search…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setHighlight(-1); }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="bsel-items">
            {filtered.length === 0 && <div className="bsel-empty">No matches</div>}
            {filtered.map((o, idx) => {
              const isSel = o.value === valStr;
              const isHi = idx === highlight;
              return (
                <div
                  key={o.value + '-' + idx}
                  role="option"
                  aria-selected={isSel}
                  className={'bsel-item' + (isSel ? ' sel' : '') + (isHi ? ' hi' : '')}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => pick(o.value)}
                >
                  <span className="bsel-item-label">{o.label}</span>
                  {isSel && <span className="bsel-tick">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
