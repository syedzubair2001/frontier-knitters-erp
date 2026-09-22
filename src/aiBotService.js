/**
 * AI Bot service — the "brain" behind the 🤖 assistant shown at the bottom-right
 * of every screen (see components/AiBot.jsx).
 *
 * Two responsibilities:
 *   1. CHAT STORAGE  — conversations are saved in localStorage so the whole
 *      history is still there after a refresh / new login.
 *   2. ANSWERS       — every answer is built from the REAL data of this ERP
 *      (Stock, Indent, Bill Inward, General/Export Invoice, Despatch,
 *      Requisition) plus the ROLE DOCUMENTS + RIGHTS configuration, so the bot
 *      replies about what your role can actually see and do.
 *
 * When the SQL backend arrives, only buildContext() needs to switch to API
 * calls — the chat UI and the intent matching stay untouched.
 */
/* Imports + storage keys live in the single block below (kept once to avoid duplicate declarations). */

/* ── storage keys ── */

import { listStockRows, listStores, stockSummary } from './stockService';
import { listIndents } from './indentService';
import { listBillInwards } from './billInwardService';
import { listGeneralInvoices } from './generalInvoiceService';
import { listExportInvoices } from './exportInvoiceService';
import { listDespatches } from './salesService';
import { listRequisitions } from './requisitionService';
import { PRODUCT_CATALOG } from './indentConfig';
import {
  ROLE_DOCUMENTS, loadRoleDocs, loadRights, rightsFor, canUseRole,
} from './roleDocsService';

const CHAT_KEY = 'fk_aibot_chats';
const ACTIVE_KEY = 'fk_aibot_active';

/* ────────────────────────── chat storage ────────────────────────── */

const uid = () => `C${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ── markdown table + report builders ──
   Every data answer is returned as a pipe table so the chat renders a REAL
   table and the CSV / Print / Copy report buttons appear. */
const cell = (v) => String(v ?? '—').replace(/\|/g, '/').replace(/\n/g, ' ').trim() || '—';
function mdTable(headers, rows) {
  const h = (headers || []).map(cell);
  const lines = [`| ${h.join(' | ')} |`, `| ${h.map(() => '---').join(' | ')} |`];
  (rows || []).forEach((r) => {
    lines.push(`| ${(r || []).map(cell).join(' | ')} |`);
  });
  return lines.join('\n');
}
function reportBlock(title, sublines, headers, rows, footlines) {
  const parts = [`**${title}**`];
  (sublines || []).forEach((s) => { if (s) parts.push(s); });
  parts.push('', mdTable(headers, rows));
  (footlines || []).forEach((s) => { if (s) parts.push(s); });
  return parts.join('\n');
}

/** All saved conversations, newest first. */
export function loadChats() {
  try {
    const arr = JSON.parse(localStorage.getItem(CHAT_KEY));
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function persist(chats) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(chats));
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, msg: 'Could not save chat history.' };
  }
}

function titleFrom(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length > 42 ? `${t.slice(0, 42)}…` : (t || 'New conversation');
}

/** Start a new conversation and return it. */
export function createChat(username) {
  const chat = {
    id: uid(),
    title: 'New conversation',
    user: username || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
  const chats = [chat, ...loadChats()];
  persist(chats);
  try { localStorage.setItem(ACTIVE_KEY, chat.id); } catch { /* ignore */ }
  return chat;
}

export function getActiveId() {
  try { return localStorage.getItem(ACTIVE_KEY) || ''; } catch { return ''; }
}

export function setActiveId(id) {
  try { localStorage.setItem(ACTIVE_KEY, id); } catch { /* ignore */ }
}

/** Add one message ({ role:'user'|'bot', text }) to a conversation. */
export function appendMessage(chatId, message) {
  const chats = loadChats();
  const idx = chats.findIndex((c) => c.id === chatId);
  if (idx < 0) return { ok: false, msg: 'Conversation not found.' };
  chats[idx].messages = [...(chats[idx].messages || []), { ...message, at: new Date().toISOString() }];
  chats[idx].updatedAt = new Date().toISOString();
  if (message.role === 'user' && chats[idx].messages.filter((m) => m.role === 'user').length === 1) {
    chats[idx].title = titleFrom(message.text);
  }
  const w = persist(chats);
  if (!w.ok) return w;
  return { ok: true, chat: chats[idx] };
}

export function deleteChat(chatId) {
  const chats = loadChats().filter((c) => c.id !== chatId);
  persist(chats);
  if (getActiveId() === chatId) setActiveId(chats[0] ? chats[0].id : '');
  return chats;
}

export function clearAllChats() {
  persist([]);
  setActiveId('');
}

/** Every question ever asked (for the "recent questions" chips). */
export function recentQuestions(limit = 6) {
  const out = [];
  loadChats().forEach((c) => {
    (c.messages || []).forEach((m) => { if (m.role === 'user' && !out.includes(m.text)) out.push(m.text); });
  });
  return out.slice(0, limit);
}

/* ────────────────────────── data context ────────────────────────── */

/** Snapshot of the real ERP data the bot answers from. */
export function buildContext(session) {
  const role = session?.role || '';
  const isSuper = role === 'Super Admin' || role === 'Admin';
  const docs = loadRoleDocs();
  const rightsData = loadRights();

  let stock = []; let stores = []; let indents = []; let bills = [];
  let genInvoices = []; let expInvoices = []; let despatches = []; let requisitions = [];
  try { stock = listStockRows(); } catch { /* module unavailable */ }
  try { stores = listStores(); } catch { /* module unavailable */ }
  try { indents = listIndents(); } catch { /* module unavailable */ }
  try { bills = listBillInwards(); } catch { /* module unavailable */ }
  try { genInvoices = listGeneralInvoices(); } catch { /* module unavailable */ }
  try { expInvoices = listExportInvoices(); } catch { /* module unavailable */ }
  try { despatches = listDespatches(); } catch { /* module unavailable */ }
  try { requisitions = listRequisitions(); } catch { /* module unavailable */ }

  const flatDocs = ROLE_DOCUMENTS.filter((d) => !d.group);
  const granted = flatDocs.filter((d) => canUseRole(role, d.key));
  const denied = flatDocs.filter((d) => !canUseRole(role, d.key));

  return {
    session, role, isSuper, docs, rightsData, granted, denied,
    stock, stores, indents, bills, genInvoices, expInvoices, despatches, requisitions,
    products: PRODUCT_CATALOG,
  };
}

const num = (n) => Number(n || 0).toLocaleString('en-US');
const money = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\s.-]/g, ' ').replace(/\s+/g, ' ').trim();

/* ───────────────────────── answer tables ─────────────────────────
   Every data answer is emitted as a markdown pipe-table:

     | Store | Qty |
     |---|---|
     | Yarn Store | 1,250 |

   AiBot.jsx renders those lines as a REAL HTML table and puts
   ⬇ CSV / 🖨 Print / 📋 Copy report buttons under the bubble, so any
   answer can be turned into a downloadable report.
   ───────────────────────────────────────────────────────────────── */

/** Build a markdown pipe-table block (cells are sanitised so | / newlines in
    data can never break the table parse in the chat UI). */
export function tbl(headers, rows) {
  const clean = (v) => (v === null || v === undefined || v === '' ? '—' : String(v).replace(/\|/g, '/').replace(/\n/g, ' '));
  const head = `| ${headers.map(clean).join(' | ')} |`;
  const sep = `|${headers.map(() => '---').join('|')}|`;
  const body = (rows || []).map((r) => `| ${headers
    .map((_, i) => clean(r[i]))
    .join(' | ')} |`);
  return [head, sep, ...body].join('\n');
}

/** Section heading used above a table (`## Text`). */
const cap = (text) => `## ${text}`;

/** Every question the user can ask — grouped, so "what can I ask" is a table. */
export const QUESTION_GROUPS = [
  { group: '📦 Stock', ask: ['Where is A4 Sheet kept?', 'Show stock by store', 'Damage stock lines', 'Scrap stock lines'] },
  { group: '🏪 Stores', ask: ['List all stores', 'Which stores have stock?'] },
  { group: '📋 Indent', ask: ['How many indents are pending?', 'Indent summary', 'Qty requested per store'] },
  { group: '🧾 Purchase / Sales', ask: ['Bill inward total', 'General invoice summary', 'Export invoice summary', 'Despatch records', 'Requisition status'] },
  { group: '🔐 Roles', ask: ['What documents can my role see?', 'Which documents are blocked for me?', 'Does Accounts have access to Collection?'] },
  { group: '📊 Reports', ask: ['Generate stock report', 'Generate indent report', 'Today summary', 'Generate full ERP report'] },
  { group: '❓ Guides', ask: ['How do I create an indent?', 'How do I check stock?', 'How do I grant rights to a role?'] },
];

/** Turn pipe-table + text into CSV (used by the ⬇ CSV button). */
export function answerToCsv(answer) {
  const lines = String(answer || '').split('\n');
  const csv = [];
  lines.forEach((ln) => {
    const cells = ln.trim().match(/^\|(.+)\|$/);
    if (!cells) return;
    if (/^\|?[\s|:-]+\|?$/.test(ln.trim()) && !/[a-zA-Z0-9]/.test(ln.replace(/[-|: ]/g, ''))) return; // separator row
    csv.push(
      cells[1].split('|').map((c) => `"${c.trim().replace(/"/g, '""')}"`).join(','),
    );
  });
  return csv.join('\n');
}

/** Plain-text version for 🖨 Print / 📋 Copy. */
export function answerToText(answer) {
  return String(answer || '')
    .replace(/\|([^|\n]*)\|/g, (_, inner) => inner.split('|').join(' | '))
    .replace(/\|?[\s|:-]{3,}\|?/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|\n)##\s*/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ── escape a value for HTML output ── */
const esc = (s) => String(s ?? '—')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/** Printable HTML report (used by the 🖨 Print button). */
export function answerToHtml(answer, title = 'Frontier Knitters ERP — Report') {
  const raw = String(answer || '');
  const lines = raw.split('\n');
  const body = [];
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i].trim();
    if (!ln) { i += 1; continue; }
    if (/^##\s+/.test(ln)) {
      body.push(`<h3>${esc(ln.replace(/^##\s+/, '').replace(/\*\*/g, ''))}</h3>`);
      i += 1;
      continue;
    }
    if (/^\|.*\|\s*$/.test(ln)) {
      const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i].trim())) {
        const t = lines[i].trim();
        if (/[a-zA-Z0-9]/.test(t.replace(/[-|: ]/g, ''))) {
          rows.push(t.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim().replace(/\*\*/g, '')));
        }
        i += 1;
      }
      if (rows.length) {
        const [head, ...rest] = rows;
        body.push('<table><thead><tr>' + head.map((c) => `<th>${esc(c)}</th>`).join('') + '</tr></thead><tbody>'
          + rest.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')
          + '</tbody></table>');
      }
      continue;
    }
    body.push(`<p>${esc(ln.replace(/^•\s*/, '• ').replace(/\*\*/g, ''))}</p>`);
    i += 1;
  }
  const stamp = new Date().toLocaleString('en-GB');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title>`
    + '<style>body{font-family:Arial,sans-serif;margin:28px;color:#102a43}h1{font-size:18px;margin:0}h3{font-size:14px;margin:18px 0 8px;color:#0b2a5b}'
    + '.meta{font-size:11px;color:#64748b;margin:4px 0 16px}p{font-size:12px;margin:4px 0}'
    + 'table{border-collapse:collapse;width:100%;margin:8px 0 14px;font-size:11.5px}th,td{border:1px solid #94a3b8;padding:5px 7px;text-align:left}th{background:#e3edf7;color:#0b2a5b}</style>'
    + `</head><body><h1>${esc(title)}</h1><div class="meta">Generated ${esc(stamp)}</div>`
    + body.join('') + '</body></html>';
}


/** Products mentioned in the question (by code or by a word of the name). */
function findProducts(text, ctx) {
  const q = norm(text);
  const skip = ['sheet', 'roll', 'ream', 'the', 'for', 'and'];
  return ctx.products.filter((p) => {
    if (q.includes(norm(p.code))) return true;
    const words = norm(p.name).split(' ').filter((w) => w.length > 3 && !skip.includes(w));
    return words.some((w) => q.includes(w));
  });
}

function stockLines(rows, limit = 8) {
  return rows.slice(0, limit)
    .map((r) => `• ${r.productNo} - ${r.productName} → **${r.store}** · ${r.stockType} · ${num(r.qty)} ${r.uom}`)
    .join('\n');
}

/** "Where is this product kept?" — store-wise table from the Stock module. */
function answerWhereProduct(text, ctx) {
  const hits = findProducts(text, ctx);
  if (!hits.length) return null;
  const out = [];
  hits.slice(0, 3).forEach((p) => {
    const rows = ctx.stock.filter((r) => r.productNo === p.code)
      .sort((a, b) => Number(b.qty) - Number(a.qty));
    const total = rows.reduce((s, r) => s + Number(r.qty || 0), 0);
    out.push(cap(`Where ${p.code} - ${p.name} is kept`));
    out.push(`_${p.type} · ${p.uom} · total balance **${num(total)} ${p.uom}** across ${rows.length} location(s)_`);
    out.push(tbl(
      ['Sno', 'Store (Place)', 'Stock Type', 'Qty', 'Uom', 'Rate', 'Value'],
      rows.length
        ? rows.map((r, i) => [i + 1, r.store, r.stockType, num(r.qty), r.uom, money(r.rate), money(Number(r.qty || 0) * Number(r.rate || 0))])
        : [['—', 'No stock record found', '—', '0', p.uom, '—', '—']],
    ));
    out.push('');
  });
  return out.join('\n').trim();
}

export const QUICK_ASKS = [
  'Where is A4 Sheet kept?',
  'Show stock by store',
  'How many indents are pending?',
  'What documents can my role see?',
  'How do I create an indent?',
  'Today summary',
];

/* ────────────────────────── the answer engine ────────────────────────── */

/**
 * Answer one question from the live ERP data + role configuration.
 * @param {string} question
 * @param {object|null} session logged-in user ({ username, role })
 * @returns {string} answer text (simple markdown: **bold**, *italic*, • bullets)
 */
export function answerQuestion(question, session) {
  const raw = String(question || '').trim();
  if (!raw) return 'Please type a question — for example: *Where is A4 Sheet kept?*';

  const ctx = buildContext(session);
  const q = norm(raw);
  const has = (...words) => words.some((w) => q.includes(w));
  const roleLine = ctx.role ? `\n\n_Signed in as **${ctx.session?.username || 'user'}** · role **${ctx.role}**_` : '';

  /* 0 — greeting / help */
  if (has('hello', 'hey', 'help', 'what can you do', 'kya kar', 'namaste')) {
    return [
      `Hello${ctx.session?.username ? ` ${ctx.session.username}` : ''} 👋 I am the Frontier Knitters ERP assistant.`,
      '',
      'I answer from the live data of this ERP — always in **table format**, and every table can be downloaded as a **report** (⬇ CSV / 🖨 Print / 📋 Copy under my message):',
      '',
      tbl(
        ['Sno', 'Topic', 'Example question'],
        [
          [1, '📦 Stock', '*Where is A4 Sheet kept?*'],
          [2, '🏪 Stores', '*List all stores*'],
          [3, '📋 Indent', '*How many indents are pending?*'],
          [4, '🧾 Invoices', '*Export invoice summary*'],
          [5, '🚚 Despatch', '*Despatch records*'],
          [6, '🔐 My role', '*What documents can my role see?*'],
          [7, '📊 Reports', '*Generate stock report*'],
        ],
      ),
      '',
      'Ask me anything, or tap a suggestion chip below.' + roleLine,
    ].join('\n');
  }

  /* 0a — "what can I ask / questions" → full grouped question table */
  if (has('what can i ask', 'what to ask', 'questions can', 'list of question', 'sample question', 'examples', 'question list')) {
    return [
      '**What you can ask me** — every question below works. Tap any suggestion chip or type it:',
      '',
      ...QUESTION_GROUPS.flatMap((g) => [
        cap(g.group),
        tbl(['Sno', 'Question you can ask'], g.ask.map((a, i) => [i + 1, a])),
        '',
      ]),
      '_Ask with a product code (PRD-A4S-001), a product word (A4 Sheet) or a store name (Yarn Store)._' + roleLine,
    ].join('\n').trim();
  }

  /* 0b — how-to guides.
     IMPORTANT: this check must run BEFORE the indent / stock / role data
     sections, otherwise "How do I create an indent?" (a quick-ask chip) is
     swallowed by the indent section and returns a data list instead of steps. */
  if (has('how to', 'how do i', 'how can i', 'steps', 'kaise', 'guide')) {
    if (has('indent')) {
      return [
        '**Create an Indent — step by step**',
        '1. Menu **Purchase & Stores ▾ → STORE → INDENT**',
        '2. Fill Indent No / Date / Unit / Type / Order No / Indent By',
        '3. In the item row pick **Product Type** → **Product No / Name**',
        '4. Store, Stock Type and Avail Stock **fetch automatically** for that product (from the Stock module)',
        '5. Change **Store** if you need another place — Stock Type + Avail Qty re-fetch for that store',
        '6. Type **Req Qty** → click **Add** (the row appears in the items table)',
        '7. Click **Save** — the indent is stored and the list view opens',
        '',
        '_Every field you filled is shown in the items table and on the print voucher._' + roleLine,
      ].join('\n');
    }
    if (has('role', 'document', 'right', 'permission')) {
      return [
        '**Grant documents / rights to a role**',
        '1. Login as Super Admin → click **🔐 Role Docs** in the navbar',
        '2. Choose the role (e.g. **Accounts**) and open the **List** view',
        '3. Tick **Access** for the documents that role may open',
        '4. Tick **View / Add / Edit / Delete** for each document',
        '5. Click **Save** — menu, dashboard cards and buttons update for that role at once',
        '',
        '_No **Add** right → the ➕ Add button is hidden and blocked. No **Access** → the document leaves the menu._' + roleLine,
      ].join('\n');
    }
    if (has('stock')) {
      return [
        '**Check stock**',
        '1. Menu **Purchase & Stores ▾ → STORE → STOCK** (or the dashboard card)',
        '2. Top table = every **store** with items / qty / value / Has Stock ✅',
        '3. Grid below = store-wise stock lines. Filter by **Store**, **Stock Type** (Fresh / Damage / Scrap) or search a product',
        '4. Bottom strip shows records, total qty and total value' + roleLine,
      ].join('\n');
    }
    return [
      '**Popular guides**',
      '• Create an indent → *how do I create an indent*',
      '• Check stock → *how do I check stock*',
      '• Give a role rights → *how do I grant rights to a role*',
      '• Locate an item → *where is A4 Sheet kept*' + roleLine,
    ].join('\n');
  }


  /* 1 — product location */
  if (has('where', 'which store', 'kaha', 'kahan', 'location', 'kept', 'rakha')) {
    const ans = answerWhereProduct(raw, ctx);
    if (ans) return ans + roleLine;
  }

  /* 2 — store master */
  if (has('how many store', 'store list', 'stores in system', 'list of store', 'store master', 'stores have stock', 'which store')) {
    const summary = stockSummary();
    return [
      cap(`Stores in the system — ${ctx.stores.length}`),
      '',
      tbl(
        ['Sno', 'Store', 'Items', 'Stock Qty', 'Stock Value', 'Has Stock'],
        summary.map((s, i) => [i + 1, s.store, s.items, num(s.qty), money(s.value), s.qty > 0 ? '✅ Yes' : '— Nil']),
      ),
      '',
      '_The Indent screen fetches its Store dropdown from this same store master._' + roleLine,
    ].join('\n');
  }

  /* 3 — stock / balance (skipped for "generate report" asks: those get the FULL report in 12b/12c) */
  if (has('stock', 'balance', 'available', 'inventory') && !has('generate', 'download report', 'export report')) {
    const prodAns = answerWhereProduct(raw, ctx);
    const type = has('damage') ? 'Damage' : has('scrap') ? 'Scrap' : has('fresh') ? 'Fresh' : '';
    let rows = ctx.stock.filter((r) => Number(r.qty) > 0);
    const storeHit = ctx.stores.find((s) => q.includes(norm(s)));
    if (storeHit) rows = rows.filter((r) => r.store === storeHit);
    if (type) rows = rows.filter((r) => r.stockType === type);
    rows.sort((a, b) => Number(b.qty) - Number(a.qty));
    const qty = rows.reduce((s, r) => s + Number(r.qty || 0), 0);
    const value = rows.reduce((s, r) => s + Number(r.qty || 0) * Number(r.rate || 0), 0);
    return [
      prodAns ? `${prodAns}\n` : '',
      cap(`Store-wise stock${storeHit ? ` — ${storeHit}` : ''}${type ? ` (${type})` : ''}`),
      `_Total **${num(qty)}** qty · value **${money(value)}** · ${rows.length} item line(s)_`,
      '',
      tbl(
        ['Sno', 'Store (Place)', 'Stock Type', 'Product No', 'Product Name', 'Qty', 'Uom', 'Rate', 'Value'],
        (rows.length ? rows.slice(0, 20) : []).map((r, i) => [
          i + 1, r.store, r.stockType, r.productNo, r.productName,
          num(r.qty), r.uom, money(r.rate), money(Number(r.qty || 0) * Number(r.rate || 0)),
        ]),
      ),
      rows.length ? '' : '• No matching stock lines.',
      rows.length > 20 ? `\n_…and ${rows.length - 20} more line(s). Ask **Generate stock report** for the full report._` : '',
    ].filter(Boolean).join('\n') + roleLine;
  }

  /* 4 — role documents & rights (skipped for "generate rights report": full table in 12c) */
  if (has('role', 'right', 'permission', 'document', 'access', 'can my', 'which document', 'allowed', 'hide') && !has('generate', 'download report', 'export report')) {
    const roleHit = ['Super Admin', 'Admin', 'Merchandiser', 'Production Manager', 'Cutting Master',
      'Stitching Supervisor', 'Quality Checker (QC)', 'Store Keeper', 'Packing Staff', 'Accounts', 'HR', 'DOCUMENT']
      .find((r) => q.includes(norm(r)) || q.includes(norm(r.split(' ')[0])));
    const targetRole = roleHit || ctx.role;
    const docHit = ROLE_DOCUMENTS.find((d) => !d.group && q.includes(norm(d.label)));

    if (docHit && targetRole) {
      const allowed = canUseRole(targetRole, docHit.key);
      const r = rightsFor(ctx.rightsData, targetRole, docHit.key);
      return [
        `**${docHit.label}** for role **${targetRole}** → ${allowed ? '✅ Access granted' : '❌ No access'}`,
        '',
        allowed
          ? `Rights — View ${r.view ? '✅' : '❌'} · Add ${r.add ? '✅' : '❌'} · Edit ${r.edit ? '✅' : '❌'} · Delete ${r.delete ? '✅' : '❌'}`
          : '_No access means no rights at all for this document._',
        '',
        'Change it in **🔐 Role Docs** → pick the role → tick Access / rights → Save.' + roleLine,
      ].join('\n');
    }

    if (targetRole) {
      const flat = ROLE_DOCUMENTS.filter((d) => !d.group);
      const allowed = flat.filter((d) => canUseRole(targetRole, d.key));
      const blocked = flat.filter((d) => !canUseRole(targetRole, d.key));
      const viewOnly = (k) => !rightsFor(ctx.rightsData, targetRole, k).add;
      return [
        `**Role "${targetRole}" — granted documents: ${allowed.length} · blocked: ${blocked.length}**`,
        '',
        cap('Granted documents'),
        allowed.length
          ? tbl(
            ['Sno', 'Document', 'Access'],
            allowed.slice(0, 30).map((d, i) => [i + 1, d.label, viewOnly(d.key) ? 'View only' : 'Full']),
          )
          : '• none',
        allowed.length > 30 ? `_…and ${allowed.length - 30} more._` : '',
        '',
        cap('Blocked documents'),
        blocked.length
          ? tbl(
            ['Sno', 'Document'],
            blocked.slice(0, 12).map((d, i) => [i + 1, d.label]),
          )
          : '• none',
        blocked.length > 12 ? `_…and ${blocked.length - 12} more._` : '',
        '',
        `_Saved setup: ${ctx.docs[targetRole] ? 'customised' : 'default'}._ Edit in **🔐 Role Docs**.` + roleLine,
      ].filter(Boolean).join('\n');
    }
  }

  /* 5 — indent (skipped for "generate indent report": full table in 12b) */
  if (has('indent') && !has('generate', 'download report', 'export report')) {
    const rows = ctx.indents;
    const pending = rows.filter((r) => !r.approved);
    const byStore = {};
    rows.forEach((r) => (r.items || []).forEach((it) => {
      const k = it.store || '—';
      byStore[k] = (byStore[k] || 0) + Number(it.reqQty || 0);
    }));
    return [
      `**Indents — total ${rows.length} · approved ${rows.length - pending.length} · pending ${pending.length}**`,
      '',
      cap('Indent list'),
      rows.length
        ? tbl(
          ['Sno', 'Indent No', 'Date', 'Type', 'Indent By', 'Status', 'Items'],
          rows.slice(0, 10).map((r, i) => [
            i + 1, r.indentNo || '—', r.date || r.indentDate || '—', r.type || '—',
            r.indentBy || '—', r.approved ? '✅ Approved' : '⏳ Pending', (r.items || []).length,
          ]),
        )
        : '• No indents yet.',
      rows.length > 10 ? `_…and ${rows.length - 10} more. Ask **Generate indent report** for the full list._` : '',
      '',
      Object.keys(byStore).length ? cap('Qty requested per store') : '',
      Object.keys(byStore).length
        ? tbl(['Sno', 'Store (Place)', 'Req Qty'], Object.entries(byStore).map(([s, v], i) => [i + 1, s, num(v)]))
        : '',
      '',
      '_The Indent screen fetches Store / Stock Type / Avail Qty from the Stock module._' + roleLine,
    ].filter(Boolean).join('\n');
  }

  /* 6 — purchase bill inward (skipped for "generate bill report": full table in 12c) */
  if (has('bill inward', 'bill-inward', 'purchase bill') && !has('generate', 'download report', 'export report')) {
    const amt = ctx.bills.reduce((s, r) => s + Number(r.totalAmount || r.amount || r.netAmount || 0), 0);
    return [
      `**Bill Inward — ${ctx.bills.length} record(s)** · total value **${money(amt)}**`,
      '',
      ctx.bills.length
        ? tbl(
          ['Sno', 'Bill No', 'Date', 'Supplier', 'Amount'],
          ctx.bills.slice(0, 10).map((r, i) => [
            i + 1, r.billNo || r.invoiceNo || r.id || '—', r.billDate || r.date || '—',
            r.supplierName || r.supplier || '—', money(r.totalAmount || r.amount || r.netAmount || 0),
          ]),
        )
        : '• No records yet.',
      ctx.bills.length > 10 ? `_…and ${ctx.bills.length - 10} more. Ask **Generate bill inward report** for the full list._` : '',
    ].filter(Boolean).join('\n') + roleLine;
  }

  /* 7 — general invoice (skipped for "generate report": full table in 12c) */
  if (has('general invoice', 'invoice general') && !has('generate', 'download report', 'export report')) {
    const amt = ctx.genInvoices.reduce((s, r) => s + Number(r.totalAmount || r.grandTotal || r.amount || 0), 0);
    return [
      `**General Invoice — ${ctx.genInvoices.length} record(s)** · total value **${money(amt)}**`,
      '',
      ctx.genInvoices.length
        ? tbl(
          ['Sno', 'Invoice No', 'Date', 'Party', 'Amount'],
          ctx.genInvoices.slice(0, 10).map((r, i) => [
            i + 1, r.invoiceNo || r.id || '—', r.invoiceDate || r.date || '—',
            r.partyName || r.customerName || '—', money(r.totalAmount || r.grandTotal || r.amount || 0),
          ]),
        )
        : '• No records yet.',
      ctx.genInvoices.length > 10 ? `_…and ${ctx.genInvoices.length - 10} more. Ask **Generate general invoice report** for the full list._` : '',
    ].filter(Boolean).join('\n') + roleLine;
  }

  /* ⚠ dead text removed here earlier — now flowing to section 8 */

  /* 8 — export invoice (skipped for "generate export report": full table in 12c) */
  if (has('export invoice', 'export-invoice') && !has('generate', 'download report', 'export report')) {
    const amt = ctx.expInvoices.reduce((s, r) => s + Number(r.totalAmount || r.grandTotal || r.amount || 0), 0);
    const qty = ctx.expInvoices.reduce((s, r) => s + Number(r.totalQty || r.quantity || 0), 0);
    return [
      `**Export Invoice — ${ctx.expInvoices.length} record(s)** · value **${money(amt)}** · qty **${num(qty)}**`,
      '',
      ctx.expInvoices.length
        ? tbl(
          ['Sno', 'Invoice No', 'Date', 'Buyer', 'Amount'],
          ctx.expInvoices.slice(0, 10).map((r, i) => [
            i + 1, r.invoiceNo || r.id || '—', r.invoiceDate || r.date || '—',
            r.buyerName || r.customerName || '—', money(r.totalAmount || r.grandTotal || r.amount || 0),
          ]),
        )
        : '• No records yet.',
      ctx.expInvoices.length > 10 ? `_…and ${ctx.expInvoices.length - 10} more. Ask **Generate export invoice report** for the full list._` : '',
    ].filter(Boolean).join('\n') + roleLine;
  }

  /* 9 — despatch (skipped for "generate despatch report": full table in 12c) */
  if (has('despatch', 'dispatch', 'shipment transfer', 'finish warehouse') && !has('generate', 'download report', 'export report')) {
    const qty = ctx.despatches.reduce((s, r) => s + Number(r.totalQty || r.quantity || 0), 0);
    return [
      `**Exports — Despatch — ${ctx.despatches.length} record(s)** · qty **${num(qty)}**`,
      '',
      ctx.despatches.length
        ? tbl(
          ['Sno', 'Despatch No', 'Date', 'Customer', 'Qty'],
          ctx.despatches.slice(0, 10).map((r, i) => [
            i + 1, r.despatchNo || r.id || '—', r.despatchDate || r.date || '—',
            r.customerName || r.buyerName || '—', num(r.totalQty || r.quantity || 0),
          ]),
        )
        : '• No records yet.',
      ctx.despatches.length > 10 ? `_…and ${ctx.despatches.length - 10} more. Ask **Generate despatch report** for the full list._` : '',
    ].filter(Boolean).join('\n') + roleLine;
  }

  /* 10 — requisition / purchase (skipped for "generate report": full table in 12c) */
  if (has('requisition', 'purchase order', 'purchase') && !has('generate', 'download report', 'export report')) {
    return [
      `**Purchase — Requisition — ${ctx.requisitions.length} record(s)**`,
      '',
      ctx.requisitions.length
        ? tbl(
          ['Sno', 'Req No', 'Date', 'Department', 'Status'],
          ctx.requisitions.slice(0, 10).map((r, i) => [
            i + 1, r.reqNo || r.requisitionNo || r.id || '—', r.date || '—',
            r.department || '—', r.status || (r.approved ? 'Approved' : 'Pending'),
          ]),
        )
        : '• No records yet.',
      ctx.requisitions.length > 10 ? `_…and ${ctx.requisitions.length - 10} more. Ask **Generate requisition report** for the full list._` : '',
    ].filter(Boolean).join('\n') + roleLine;
  }

  /* 11 — product catalog: related summary + TABLE */
  if (has('product', 'catalog', 'a4 sheet', 'item list', 'product list')) {
    const prodAns = answerWhereProduct(raw, ctx);
    return [
      prodAns ? `${prodAns}\n` : '',
      `**Product catalog — ${ctx.products.length} item(s)**`,
      '',
      tbl(
        ['Sno', 'Code', 'Name', 'Type', 'Uom'],
        ctx.products.slice(0, 12).map((p, i) => [i + 1, p.code, p.name, p.type, p.uom]),
      ),
      ctx.products.length > 12 ? `_…and ${ctx.products.length - 12} more._` : '',
      '',
      '_The Product Type / Product No / Uom dropdowns of the Indent screen come from this catalog._',
    ].filter(Boolean).join('\n') + roleLine;
  }

  /* 12 — how-to guides: MOVED to section 0b (above the data sections) so
     "how do I …" questions are answered with steps, not with a data list. */
  if (false && has('how to', 'how do i', 'steps', 'kaise', 'guide')) {
    if (has('indent')) {
      return [
        '**Create an Indent — step by step**',
        '1. Menu **Purchase & Stores ▾ → STORE → INDENT**',
        '2. Fill Indent No / Date / Unit / Type / Order No / Indent By',
        '3. In the item row pick **Product Type** → **Product No / Name**',
        '4. Store, Stock Type and Avail Stock **fetch automatically** for that product (from the Stock module)',
        '5. Change **Store** if you need another place — Stock Type + Avail Qty re-fetch for that store',
        '6. Type **Req Qty** → click **Add** (the row appears in the items table)',
        '7. Click **Save** — the indent is stored and the list view opens',
        '',
        '_Every field you filled is shown in the items table and on the print voucher._' + roleLine,
      ].join('\n');
    }
    if (has('role', 'document', 'right', 'permission')) {
      return [
        '**Grant documents / rights to a role**',
        '1. Login as Super Admin → click **🔐 Role Docs** in the navbar',
        '2. Choose the role (e.g. **Accounts**) and open the **List** view',
        '3. Tick **Access** for the documents that role may open',
        '4. Tick **View / Add / Edit / Delete** for each document',
        '5. Click **Save** — menu, dashboard cards and buttons update for that role at once',
        '',
        '_No **Add** right → the ➕ Add button is hidden and blocked. No **Access** → the document leaves the menu._' + roleLine,
      ].join('\n');
    }
    if (has('stock')) {
      return [
        '**Check stock**',
        '1. Menu **Purchase & Stores ▾ → STORE → STOCK** (or the dashboard card)',
        '2. Top table = every **store** with items / qty / value / Has Stock ✅',
        '3. Grid below = store-wise stock lines. Filter by **Store**, **Stock Type** (Fresh / Damage / Scrap) or search a product',
        '4. Bottom strip shows records, total qty and total value' + roleLine,
      ].join('\n');
    }
    return [
      '**Popular guides**',
      '• Create an indent → *how do I create an indent*',
      '• Check stock → *how do I check stock*',
      '• Give a role rights → *how do I grant rights to a role*',
      '• Locate an item → *where is A4 Sheet kept*' + roleLine,
    ].join('\n');
  }

  /* 12b — REPORT GENERATOR (part 1: stock + indent full tables).
     "generate … report" always lands here — before summary/products sections. */
  if (has('generate stock', 'generate full stock', 'stock report', 'download stock', 'export stock')) {
    const stamp = new Date().toLocaleString('en-GB');
    const rows = [...ctx.stock].sort((a, b) => Number(b.qty || 0) - Number(a.qty || 0));
    const qty = rows.reduce((s, r) => s + Number(r.qty || 0), 0);
    const value = rows.reduce((s, r) => s + Number(r.qty || 0) * Number(r.rate || 0), 0);
    return [
      cap(`Stock report — ${rows.length} line(s) · generated ${stamp}`),
      `_Total **${num(qty)}** qty · value **${money(value)}**_`,
      '',
      rows.length
        ? tbl(
          ['Sno', 'Store (Place)', 'Stock Type', 'Product No', 'Product Name', 'Qty', 'Uom', 'Rate', 'Value'],
          rows.map((r, i) => [i + 1, r.store, r.stockType, r.productNo, r.productName, num(r.qty), r.uom, money(r.rate), money(Number(r.qty || 0) * Number(r.rate || 0))]),
        )
        : '• No stock lines.',
      '',
      '_Use the report buttons under this message: **⬇ CSV** downloads it (opens in Excel), **🖨 Print** prints it, **📋 Copy** copies it._' + roleLine,
    ].filter(Boolean).join('\n');
  }
  if (has('generate indent', 'indent report', 'download indent', 'export indent')) {
    const stamp = new Date().toLocaleString('en-GB');
    return [
      cap(`Indent report — ${ctx.indents.length} indent(s) · generated ${stamp}`),
      '',
      ctx.indents.length
        ? tbl(
          ['Sno', 'Indent No', 'Date', 'Type', 'Store', 'Indent By', 'Status', 'Items'],
          ctx.indents.map((r, i) => [i + 1, r.indentNo || '—', r.date || r.indentDate || '—', r.type || '—', ((r.items || [])[0] || {}).store || '—', r.indentBy || '—', r.approved ? '✅ Approved' : '⏳ Pending', (r.items || []).length]),
        )
        : '• No indents yet.',
      '',
      '_Use **⬇ CSV / 🖨 Print / 📋 Copy** under this message to save the report._' + roleLine,
    ].filter(Boolean).join('\n');
  }

  /* 12c — REPORT GENERATOR (part 2: bills / invoices / despatch / role / full ERP). */
  if (has('generate bill', 'bill inward report', 'bill report')) {
    const stamp = new Date().toLocaleString('en-GB');
    const amt = ctx.bills.reduce((s, r) => s + Number(r.totalAmount || r.amount || r.netAmount || 0), 0);
    return [
      cap(`Bill Inward report — ${ctx.bills.length} record(s) · total ${money(amt)} · ${stamp}`),
      '',
      ctx.bills.length
        ? tbl(
          ['Sno', 'Bill No', 'Date', 'Supplier', 'Amount'],
          ctx.bills.map((r, i) => [i + 1, r.billNo || r.invoiceNo || r.id || '—', r.billDate || r.date || '—', r.supplierName || r.supplier || '—', money(r.totalAmount || r.amount || r.netAmount || 0)]),
        )
        : '• No records yet.',
      '',
      '_Use **⬇ CSV / 🖨 Print / 📋 Copy** under this message to save the report._' + roleLine,
    ].filter(Boolean).join('\n');
  }
  if (has('generate export', 'export invoice report', 'export report')) {
    const stamp = new Date().toLocaleString('en-GB');
    return [
      cap(`Export Invoice report — ${ctx.expInvoices.length} record(s) · ${stamp}`),
      '',
      ctx.expInvoices.length
        ? tbl(
          ['Sno', 'Invoice No', 'Date', 'Buyer', 'Amount'],
          ctx.expInvoices.map((r, i) => [i + 1, r.invoiceNo || r.id || '—', r.invoiceDate || r.date || '—', r.buyerName || r.customerName || '—', money(r.totalAmount || r.grandTotal || r.amount || 0)]),
        )
        : '• No records yet.',
      '',
      '_Use **⬇ CSV / 🖨 Print / 📋 Copy** under this message to save the report._' + roleLine,
    ].filter(Boolean).join('\n');
  }
  if (has('generate despatch', 'generate dispatch', 'despatch report')) {
    const stamp = new Date().toLocaleString('en-GB');
    return [
      cap(`Despatch report — ${ctx.despatches.length} record(s) · ${stamp}`),
      '',
      ctx.despatches.length
        ? tbl(
          ['Sno', 'Despatch No', 'Date', 'Customer', 'Qty'],
          ctx.despatches.map((r, i) => [i + 1, r.despatchNo || r.id || '—', r.despatchDate || r.date || '—', r.customerName || r.buyerName || '—', num(r.totalQty || r.quantity || 0)]),
        )
        : '• No records yet.',
      '',
      '_Use **⬇ CSV / 🖨 Print / 📋 Copy** under this message to save the report._' + roleLine,
    ].filter(Boolean).join('\n');
  }
  if (has('generate role', 'role rights report', 'rights report', 'generate rights')) {
    const stamp = new Date().toLocaleString('en-GB');
    const flat = ROLE_DOCUMENTS.filter((d) => !d.group);
    const allowed = flat.filter((d) => canUseRole(ctx.role, d.key));
    return [
      cap(`Role rights report — ${ctx.role || '—'} · ${stamp}`),
      '',
      tbl(['Sno', 'Document', 'View', 'Add', 'Edit', 'Delete'],
        allowed.map((d, i) => {
          const r = rightsFor(ctx.rightsData, ctx.role, d.key);
          return [i + 1, d.label, r.view ? '✅' : '❌', r.add ? '✅' : '❌', r.edit ? '✅' : '❌', r.delete ? '✅' : '❌'];
        })),
      '',
      '_Use **⬇ CSV / 🖨 Print / 📋 Copy** under this message to save the report._' + roleLine,
    ].join('\n');
  }
  if (has('generate full', 'full erp report', 'full report', 'download report', 'export report', 'generate report')) {
    const stamp = new Date().toLocaleString('en-GB');
    const stockQty = ctx.stock.reduce((s, r) => s + Number(r.qty || 0), 0);
    const stockVal = ctx.stock.reduce((s, r) => s + Number(r.qty || 0) * Number(r.rate || 0), 0);
    const billT = ctx.bills.reduce((s, r) => s + Number(r.totalAmount || r.amount || 0), 0);
    const genT = ctx.genInvoices.reduce((s, r) => s + Number(r.totalAmount || r.grandTotal || r.amount || 0), 0);
    const expT = ctx.expInvoices.reduce((s, r) => s + Number(r.totalAmount || r.grandTotal || r.amount || 0), 0);
    const dspQ = ctx.despatches.reduce((s, r) => s + Number(r.totalQty || r.quantity || 0), 0);
    return [
      cap(`Full ERP report · generated ${stamp}`),
      '',
      tbl(
        ['Sno', 'Module', 'Records', 'Key total'],
        [
          [1, 'Stock', ctx.stock.length, `${num(stockQty)} qty · ${money(stockVal)}`],
          [2, 'Indents', ctx.indents.length, `${ctx.indents.filter((r) => !r.approved).length} pending`],
          [3, 'Bill Inward', ctx.bills.length, money(billT)],
          [4, 'General Invoice', ctx.genInvoices.length, money(genT)],
          [5, 'Export Invoice', ctx.expInvoices.length, money(expT)],
          [6, 'Despatch', ctx.despatches.length, `${num(dspQ)} qty`],
          [7, 'Requisition', ctx.requisitions.length, `${ctx.requisitions.length} record(s)`],
        ],
      ),
      '',
      '_Ask **Generate stock report** (or indent / bill inward / export invoice / despatch / role rights) for the module-wise full table._' + roleLine,
    ].join('\n');
  }

  /* 13 — summary / today (skipped for "generate report" asks: those get the FULL report in 12b/12c) */
  if (has('summary', 'today', 'overview', 'dashboard', 'report') && !has('generate', 'download report', 'export report')) {
    const stockQty = ctx.stock.reduce((s, r) => s + Number(r.qty || 0), 0);
    const stockVal = ctx.stock.reduce((s, r) => s + Number(r.qty || 0) * Number(r.rate || 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const isToday = (d) => String(d || '').slice(0, 10) === today;
    return [
      '**ERP summary (live data)**',
      `• **Stock** — ${ctx.stores.length} stores · ${num(stockQty)} qty · value ${money(stockVal)}`,
      `• **Indent** — ${ctx.indents.length} total · ${ctx.indents.filter((r) => !r.approved).length} pending · ${ctx.indents.filter((r) => isToday(r.date || r.indentDate)).length} today`,
      `• **Bill Inward** — ${ctx.bills.length} · **General Invoice** — ${ctx.genInvoices.length} · **Export Invoice** — ${ctx.expInvoices.length}`,
      `• **Despatch** — ${ctx.despatches.length} · **Requisition** — ${ctx.requisitions.length}`,
      `• **My role** — ${ctx.role || '—'} · ${ctx.isSuper ? 'full access' : `${ctx.granted.length} document(s) granted`}`,
      '',
      '_The dashboard shows only the granted working documents (Stores → Exports)._' + roleLine,
    ].join('\n');
  }

  /* 14 — what is blocked for my role: related summary + TABLE */
  if (has('blocked', 'not showing', 'hidden', 'cannot see', 'why not', 'nahi')) {
    return [
      `**Role "${ctx.role || '—'}"** — granted **${ctx.granted.length}** · blocked **${ctx.denied.length}**`,
      '',
      ctx.denied.length ? cap('Blocked documents') : '',
      ctx.denied.length
        ? tbl(['Sno', 'Document'], ctx.denied.slice(0, 20).map((d, i) => [i + 1, d.label]))
        : 'Nothing is blocked — your role has access to every document.',
      '',
      '_Note: the DOCUMENT role never sees Accounts / Shipment / Stock by design; Super Admin sees everything._' + roleLine,
    ].filter(Boolean).join('\n');
  }

  /* 15 — fallback: still try the product match, else show the menu of topics */
  const prodAns = answerWhereProduct(raw, ctx);
  if (prodAns) return prodAns + roleLine;

  return [
    `I could not match that exactly${ctx.role ? ` (role **${ctx.role}**)` : ''}. Here is what I can do:`,
    '',
    '• *where is A4 Sheet kept* · *show stock by store* · *damage stock lines*',
    '• *how many indents are pending* · *indent summary*',
    '• *bill inward total* · *export invoice summary* · *despatch records*',
    '• *what documents can my role see* · *does Accounts have access to Collection Receipts*',
    '• *how do I create an indent* · *how do I grant rights* · *today summary*',
    '',
    `_You can also ask with a product code (PRD-A4S-001) or a store name (Yarn Store)._${roleLine}`,
  ].join('\n');
}
