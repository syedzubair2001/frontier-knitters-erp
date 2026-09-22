import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getSession } from '../auth';
import {
  loadChats, createChat, appendMessage, deleteChat, clearAllChats,
  getActiveId, setActiveId, recentQuestions, answerQuestion, QUICK_ASKS,
  answerToCsv, answerToText, answerToHtml,
} from '../aiBotService';

/* ── tiny markdown renderer: **bold**, *italic*, _note_ ── */
function inline(text, keyBase) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) parts.push(<b key={`${keyBase}-b${i}`}>{tok.slice(2, -2)}</b>);
    else if (tok.startsWith('_')) parts.push(<i key={`${keyBase}-n${i}`} style={{ color: '#64748b' }}>{tok.slice(1, -1)}</i>);
    else parts.push(<i key={`${keyBase}-e${i}`}>{tok.slice(1, -1)}</i>);
    last = m.index + tok.length;
    i += 1;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/* ── table detection: consecutive | ... | lines form one table ── */
const isTableRow = (ln) => /^\|.*\|\s*$/.test(ln.trim());
const isSepRow = (ln) => {
  const t = ln.trim();
  return isTableRow(t) && !/[a-zA-Z0-9]/.test(t.replace(/[-|: ]/g, ''));
};

function BotTable({ rows }) {
  const head = rows[0] || [];
  const body = rows.slice(1);
  return (
    <div className="bot-table-wrap">
      <table className="bot-table">
        <thead>
          <tr>{head.map((c, i) => <th key={i}>{inline(c, `h${i}`)}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j}>{inline(c, `c${i}-${j}`)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── bot bubble + ⬇ CSV / 🖨 Print / 📋 Copy report buttons ──
   Buttons appear under every answer that contains a table. */
function BotMessage({ m }) {
  const hasTable = /^\|.*\|\s*$/m.test(m.text || '');
  const stamp = new Date().toISOString().slice(0, 10);

  const doCsv = () => {
    const csv = answerToCsv(m.text);
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ERP-report-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  const doCopy = async () => {
    const t = answerToText(m.text);
    try {
      await navigator.clipboard.writeText(t);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = t;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* clipboard blocked */ }
      ta.remove();
    }
  };

  const doPrint = () => {
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(answerToHtml(m.text, 'Frontier Knitters ERP — Report'));
    w.document.close();
    w.focus();
    setTimeout(() => { try { w.print(); } catch { /* print blocked */ } }, 350);
  };

  return (
    <div className="bot-bubble">
      <MessageBody text={m.text} />
      {hasTable && (
        <div className="bot-report-btns">
          <button type="button" className="bot-rbtn" onClick={doCsv} title="Download this table as a CSV report">⬇ CSV</button>
          <button type="button" className="bot-rbtn" onClick={doPrint} title="Print this answer as a report">🖨 Print</button>
          <button type="button" className="bot-rbtn" onClick={doCopy} title="Copy this answer as text">📋 Copy</button>
        </div>
      )}
      <span className="bot-time">{fmtTime(m.at)}</span>
    </div>
  );
}


function MessageBody({ text }) {
  const lines = String(text || '').split('\n');
  /* group lines into blocks: tables, headings, normal lines */
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    if (!ln.trim()) { blocks.push({ t: 'blank', k: i }); i += 1; continue; }
    if (/^##\s+/.test(ln.trim())) { blocks.push({ t: 'head', k: i, text: ln.trim().replace(/^##\s+/, '') }); i += 1; continue; }
    if (isTableRow(ln)) {
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) {
        if (!isSepRow(lines[i])) {
          rows.push(lines[i].trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
        }
        i += 1;
      }
      if (rows.length) blocks.push({ t: 'table', k: i, rows });
      continue;
    }
    blocks.push({ t: 'line', k: i, text: ln });
    i += 1;
  }
  return (
    <div className="bot-msg-body">
      {blocks.map((b) => {
        if (b.t === 'blank') return <div key={b.k} className="bot-line blank" />;
        if (b.t === 'head') return <div key={b.k} className="bot-line head">{inline(b.text, `h${b.k}`)}</div>;
        if (b.t === 'table') return <BotTable key={b.k} rows={b.rows} />;
        const ln = b.text;
        const bullet = /^\s*[•\-]\s+/.test(ln);
        const numbered = /^\s*\d+[.)]\s+/.test(ln);
        const clean = ln.replace(/^\s*[•\-]\s+/, '').replace(/^\s*\d+[.)]\s+/, '');
        return (
          <div key={b.k} className={'bot-line' + (bullet ? ' bullet' : '') + (numbered ? ' numbered' : '')}>
            {bullet && <span className="bot-dot">•</span>}
            {numbered && <span className="bot-num">{ln.trim().match(/^\d+/)[0]}.</span>}
            <span>{inline(clean, `l${b.k}`)}</span>
          </div>
        );
      })}
    </div>
  );
}

const fmtTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function AiBot() {
  const { pathname } = useLocation();
  const session = getSession();
  const [, force] = useState(0);

  /* Re-check login state whenever the user navigates (login / logout) and
     whenever another tab changes the session storage. */
  useEffect(() => { force((n) => n + 1); }, [pathname]);
  useEffect(() => {
    const onStorage = (e) => { if (!e.key || e.key.includes('session')) force((n) => n + 1); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState(() => loadChats());
  const [showHistory, setShowHistory] = useState(false);
  const [activeId, setActive] = useState(() => getActiveId());
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  const active = useMemo(
    () => chats.find((c) => c.id === activeId) || chats[0] || null,
    [chats, activeId],
  );

  const refresh = useCallback(() => setChats(loadChats()), []);
  const history = useMemo(() => recentQuestions(6), [chats]);

  /* First open → make sure a conversation exists and greet the user. */
  useEffect(() => {
    if (!open) return;
    let id = activeId;
    if (!id) {
      const c = createChat(session?.username);
      id = c.id;
      setActive(id);
      setActiveId(id);
      refresh();
    }
    const chat = loadChats().find((c) => c.id === id);
    if (chat && (!chat.messages || chat.messages.length === 0)) {
      const hello = [
        `Hello${session?.username ? ` ${session.username}` : ''} 👋 I am your ERP assistant.`,
        '',
        `You are signed in as **${session?.role || 'user'}**. Ask me about **Stock, Indent, Invoices, Despatch** or your **role documents** — or tap a suggestion below.`,
      ];
      appendMessage(id, { role: 'bot', text: hello });
      refresh();
    }
  }, [open, activeId, session, refresh]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [active, thinking, open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  /* Esc closes the full-screen popup. */
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open]);

  const send = (text) => {
    const q = String(text || '').trim();
    if (!q || thinking) return;
    let id = active?.id;
    if (!id) {
      const c = createChat(session?.username);
      id = c.id;
      setActive(id);
      setActiveId(id);
    }
    appendMessage(id, { role: 'user', text: q });
    refresh();
    setInput('');
    setThinking(true);
    /* short delay so the "thinking" dots are visible, then answer from live data */
    setTimeout(() => {
      let ans;
      try {
        ans = answerQuestion(q, session);
      } catch (e) {
        console.error(e);
        ans = '⚠️ Sorry, I could not read the ERP data for that question. Please try again.';
      }
      appendMessage(id, { role: 'bot', text: ans });
      refresh();
      setShowHistory(true);
      setThinking(false);
    }, 420);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const newChat = () => {
    const c = createChat(session?.username);
    setActive(c.id);
    setActiveId(c.id);
    refresh();
    setShowHistory(true);
    setOpen(true);
  };

  const removeChat = (id) => {
    const next = deleteChat(id);
    setChats(next);
    const first = next[0] ? next[0].id : '';
    if (first) { setActive(first); setActiveId(first); } else { newChat(); }
  };

  const wipe = () => {
    clearAllChats();
    setChats([]);
    const c = createChat(session?.username);
    setActive(c.id);
    setActiveId(c.id);
    refresh();
  };

  /* Only for signed-in users — the assistant never appears on Login / Signup.
     (All hooks above run first, so the hook order stays stable.) */
  if (!session || !session.username) return null;

  return (
    <>
      {/* Floating bubble — bottom-right on every screen */}
      <button
        type="button"
        className={'bot-fab' + (open ? ' hide' : '')}
        onClick={() => setOpen(true)}
        title="Ask the ERP AI assistant"
        aria-label="Open AI assistant"
      >
        <span className="bot-fab-ic">🤖</span>
        <span className="bot-fab-pulse" />
        <span className="bot-fab-lbl">Ask AI</span>
      </button>

      {open && (
        <div className="bot-screen" role="dialog" aria-modal="true" aria-label="AI assistant">
          {/* Header */}
          <div className="bot-head">
            <div className="bot-head-left">
              <span className="bot-head-ic">🤖</span>
              <div className="bot-head-txt">
                <b>ERP AI Assistant</b>
                <span className="bot-head-sub">
                  {session ? `${session.username} · ${session.role}` : 'live ERP data'}
                  {active ? ` · ${active.messages.length} message(s)` : ''}
                </span>
              </div>
            </div>
            <div className="bot-head-btns">
              <button
                type="button"
                className="bot-hbtn"
                onClick={() => setShowHistory((v) => !v)}
                title="Show / hide saved conversations"
              >
                {showHistory ? '💬 Chat' : `🗂 History · ${chats.length}`}
              </button>
              <button type="button" className="bot-hbtn" onClick={newChat}>+ New</button>
              <button
                type="button"
                className="bot-hbtn"
                onClick={wipe}
                title="Delete all saved conversations"
              >Clear all</button>
              <button type="button" className="bot-hbtn close" onClick={() => setOpen(false)}>✕ Close</button>
            </div>
          </div>

          {/* Body */}
          <div className="bot-main">
            {/* Saved conversations sidebar */}
            <aside className={'bot-side' + (showHistory ? ' show' : '')}>
              <div className="bot-side-cap">Saved conversations</div>
              {!chats.length && (
                <div className="bot-side-empty">
                  No saved conversations yet.
                  <span className="bot-side-hint">Send a message and it is saved here automatically.</span>
                </div>
              )}
              {chats.map((c) => (
                <div
                  key={c.id}
                  className={'bot-side-item' + (active && c.id === active.id ? ' active' : '')}
                  onClick={() => { setActive(c.id); setActiveId(c.id); setShowHistory(true); }}
                >
                  <div className="bot-side-txt">
                    <b>{c.title}</b>
                    <span>{fmtTime(c.updatedAt)} · {c.messages.length} msg</span>
                  </div>
                  <button
                    type="button"
                    className="bot-side-del"
                    title="Delete this conversation"
                    onClick={(e) => { e.stopPropagation(); removeChat(c.id); }}
                  >🗑</button>
                </div>
              ))}
            </aside>

            {/* Chat pane */}
            <section className="bot-chat">
              <div className="bot-body" ref={bodyRef}>
                {(active ? active.messages : []).map((m, i) => (
                  <div key={`${i}-${m.at || ''}`} className={'bot-msg ' + (m.role === 'user' ? 'me' : 'bot')}>
                    {m.role === 'bot' && <span className="bot-avatar">🤖</span>}
                    {m.role === 'bot' ? <BotMessage m={m} /> : (
                      <div className="bot-bubble">
                        <MessageBody text={m.text} />
                        <span className="bot-time">{fmtTime(m.at)}</span>
                      </div>
                    )}
                  </div>
                ))}
                {thinking && (
                  <div className="bot-msg bot">
                    <span className="bot-avatar">🤖</span>
                    <div className="bot-bubble bot-typing"><span /><span /><span /></div>
                  </div>
                )}
              </div>

              {/* Suggestions — recent questions once the user has asked some */}
              <div className="bot-chips">
                {((active && active.messages.some((m) => m.role === 'user') && history.length)
                  ? history
                  : QUICK_ASKS
                ).slice(0, 6).map((s) => (
                  <button key={s} type="button" className="bot-chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>

              {/* Composer */}
              <div className="bot-input">
                <textarea
                  ref={inputRef}
                  rows={1}
                  placeholder="Ask about stock, indent, invoices, roles… (Enter = send, Shift+Enter = new line)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                />
                <button type="button" className="bot-send" onClick={() => send(input)} disabled={!input.trim() || thinking}>
                  ➤ Send
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
