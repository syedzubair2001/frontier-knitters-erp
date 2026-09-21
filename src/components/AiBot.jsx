import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSession } from '../auth';
import {
  loadChats, createChat, appendMessage, deleteChat, clearAllChats,
  getActiveId, setActiveId, recentQuestions, answerQuestion, QUICK_ASKS,
} from '../aiBotService';

/* ── tiny markdown renderer: **bold**, *italic*, _note_, bullets ── */
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

function MessageBody({ text }) {
  const lines = String(text || '').split('\n');
  return (
    <div className="bot-msg-body">
      {lines.map((ln, i) => {
        if (!ln.trim()) return <div key={i} style={{ height: 6 }} />;
        const bullet = /^\s*[•\-]\s+/.test(ln);
        const numbered = /^\s*\d+[.)]\s+/.test(ln);
        const clean = ln.replace(/^\s*[•\-]\s+/, '').replace(/^\s*\d+[.)]\s+/, '');
        return (
          <div key={i} className={'bot-line' + (bullet ? ' bullet' : '') + (numbered ? ' numbered' : '')}>
            {bullet && <span className="bot-dot">•</span>}
            {numbered && <span className="bot-num">{ln.trim().match(/^\d+/)[0]}.</span>}
            <span>{inline(clean, `l${i}`)}</span>
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
  const [session] = useState(() => getSession());
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState(() => loadChats());
  const [activeId, setActive] = useState(() => getActiveId());
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  const active = useMemo(
    () => chats.find((c) => c.id === activeId) || chats[0] || null,
    [chats, activeId],
  );

  const refresh = useCallback(() => setChats(loadChats()), []);
  const history = useMemo(() => recentQuestions(6), [chats]);

  /* First open → make sure a conversation exists and greet the user */
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
FIX
        '',
BLANK
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
    // short delay so the "thinking" dots are visible, then answer from live data
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
    setShowHistory(false);
    setOpen(true);
  };

  const removeChat = (id) => {
    const next = deleteChat(id);
    setChats(next);
    const first = next[0] ? next[0].id : '';
    if (first) { setActive(first); setActiveId(first); } else { newChat(); }

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
              <button type="button" className="bot-hbtn" onClick={() => setShowHistory((s) => !s)}>
                {showHistory ? '💬 Chat' : `🗂 History (${chats.length})`}
              </button>
              <button type="button" className="bot-hbtn" onClick={newChat}>＋ New chat</button>
              <button type="button" className="bot-hbtn" onClick={wipe} title="Delete all saved conversations">🗑 Clear all</button>
              <button type="button" className="bot-hbtn close" onClick={() => setOpen(false)}>✕ Close</button>
            </div>
          </div>

          <div className="bot-main">
            {/* Saved conversations */}
            <aside className={'bot-side' + (showHistory ? ' show' : '')}>
              <div className="bot-side-cap">Saved conversations</div>
              {!chats.length && <div className="bot-side-empty">No conversations yet.</div>}
              {chats.map((c) => (
                <div
                  key={c.id}
                  className={'bot-side-item' + (active && c.id === active.id ? ' active' : '')}
                  onClick={() => { setActive(c.id); setActiveId(c.id); setShowHistory(false); }}
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
                    <div className="bot-bubble">
                      <MessageBody text={m.text} />
                      <span className="bot-time">{fmtTime(m.at)}</span>
                    </div>
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

  const wipe = () => {
    clearAllChats();
    setChats([]);
    const c = createChat(session?.username);
    setActive(c.id);
    setActiveId(c.id);
    refresh();
  };
}
