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

/** "Where is this product kept?" — store-wise breakdown from the Stock module. */
function answerWhereProduct(text, ctx) {
  const hits = findProducts(text, ctx);
  if (!hits.length) return null;
  const out = [];
  hits.slice(0, 3).forEach((p) => {
    const rows = ctx.stock.filter((r) => r.productNo === p.code)
      .sort((a, b) => Number(b.qty) - Number(a.qty));
    const total = rows.reduce((s, r) => s + Number(r.qty || 0), 0);
    out.push(`**${p.code} - ${p.name}** (${p.type} · ${p.uom}) — total **${num(total)} ${p.uom}**`);
    out.push(rows.length
      ? rows.map((r) => `   • ${r.store} → ${num(r.qty)} ${r.uom} (${r.stockType})`).join('\n')
      : '   • No stock record found.');
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
      'I answer from the live data of this ERP:',
      '• **Stock** — store-wise balance, "where is <product> kept"',
      '• **Indent** — pending / approved counts, items, stores',
      '• **Invoice** — Bill Inward, General Invoice, Export Invoice',
      '• **Exports** — Despatch records',
      '• **Roles** — which documents & rights a role has (Role Documents)',
      '',
      'Ask me anything, or tap a suggestion chip below.' + roleLine,
    ].join('\n');
  }

  /* 1 — product location */
  if (has('where', 'which store', 'kaha', 'kahan', 'location', 'kept', 'rakha')) {
    const ans = answerWhereProduct(raw, ctx);
    if (ans) return ans + roleLine;
  }

  /* 2 — store master */
  if (has('how many store', 'store list', 'stores in system', 'list of store', 'store master')) {
    const summary = stockSummary();
    return [
      `**Stores in the system: ${ctx.stores.length}**`,
      '',
      ...summary.map((s) => `• **${s.store}** → ${s.items} items · ${num(s.qty)} qty · value ${money(s.value)} ${s.qty > 0 ? '✅' : '(nil)'}`),
      '',
      '_The Indent screen fetches its Store dropdown from this same store master._' + roleLine,
    ].join('\n');
  }

  /* 3 — stock / balance */
  if (has('stock', 'balance', 'available', 'inventory')) {
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
      `**Store-wise stock${storeHit ? ` — ${storeHit}` : ''}${type ? ` (${type})` : ''}**`,
      `Total **${num(qty)}** qty · value **${money(value)}** · ${rows.length} item line(s)`,
      '',
      stockLines(rows) || '• No matching stock lines.',
      rows.length > 8 ? `\n_…and ${rows.length - 8} more line(s). Open **Purchase & Stores → STORE → STOCK** for the full grid._` : '',
    ].filter(Boolean).join('\n') + roleLine;
  }

  /* 4 — role documents & rights */
  if (has('role', 'right', 'permission', 'document', 'access', 'can my', 'which document', 'allowed', 'hide')) {
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
        `**Role "${targetRole}" — granted documents: ${allowed.length}**`,
        '',
        allowed.slice(0, 30).map((d) => `• ${d.label}${viewOnly(d.key) ? ' _(view only)_' : ''}`).join('\n'),
        allowed.length > 30 ? `_…and ${allowed.length - 30} more._` : '',
        '',
        `**Blocked documents: ${blocked.length}**`,
        blocked.slice(0, 12).map((d) => `• ${d.label}`).join('\n') || '• none',
        blocked.length > 12 ? `_…and ${blocked.length - 12} more._` : '',
        '',
        `_Saved setup: ${ctx.docs[targetRole] ? 'customised' : 'default'}._ Edit in **🔐 Role Docs**.` + roleLine,
      ].filter(Boolean).join('\n');
    }
  }

  /* 5 — indent */
  if (has('indent')) {
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
      rows.slice(0, 6).map((r) => `• ${r.indentNo} · ${r.date || r.indentDate || '—'} · ${r.type || '—'} · ${r.indentBy || '—'} · ${r.approved ? '✅ Approved' : '⏳ Pending'} · ${(r.items || []).length} item(s)`).join('\n') || '• No indents yet.',
      '',
      Object.keys(byStore).length
        ? `**Qty requested per store:**\n${Object.entries(byStore).map(([s, v]) => `• ${s} → ${num(v)}`).join('\n')}`
        : '',
      '',
      '_The Indent screen fetches Store / Stock Type / Avail Qty from the Stock module._' + roleLine,
    ].filter(Boolean).join('\n');
  }

  /* 6 — purchase bill inward */
  if (has('bill inward', 'bill-inward', 'purchase bill')) {
    const amt = ctx.bills.reduce((s, r) => s + Number(r.totalAmount || r.amount || r.netAmount || 0), 0);
    return [
      `**Bill Inward — ${ctx.bills.length} record(s)** · total value **${money(amt)}**`,
      '',
      ctx.bills.slice(0, 8).map((r) => `• ${r.billNo || r.invoiceNo || r.id || '—'} · ${r.billDate || r.date || '—'} · ${r.supplierName || r.supplier || '—'} · ${money(r.totalAmount || r.amount || r.netAmount || 0)}`).join('\n') || '• No records yet.',
    ].join('\n') + roleLine;
  }

  /* 7 — general invoice */
  if (has('general invoice', 'invoice general')) {
    const amt = ctx.genInvoices.reduce((s, r) => s + Number(r.totalAmount || r.grandTotal || r.amount || 0), 0);
    return [
      `**General Invoice — ${ctx.genInvoices.length} record(s)** · total value **${money(amt)}**`,
      '',
      ctx.genInvoices.slice(0, 8).map((r) => `• ${r.invoiceNo || r.id || '—'} · ${r.invoiceDate || r.date || '—'} · ${r.partyName || r.customerName || '—'} · ${money(r.totalAmount || r.grandTotal || r.amount || 0)}`).join('\n') || '• No records yet.',
    ].join('\n') + roleLine;
  }

  /* ⚠ dead text removed here earlier — now flowing to section 8 */

  /* 8 — export invoice */
  if (has('export invoice', 'export-invoice')) {
    const amt = ctx.expInvoices.reduce((s, r) => s + Number(r.totalAmount || r.grandTotal || r.amount || 0), 0);
    const qty = ctx.expInvoices.reduce((s, r) => s + Number(r.totalQty || r.quantity || 0), 0);
    return [
      `**Export Invoice — ${ctx.expInvoices.length} record(s)** · value **${money(amt)}** · qty **${num(qty)}**`,
      '',
      ctx.expInvoices.slice(0, 8).map((r) => `• ${r.invoiceNo || r.id || '—'} · ${r.invoiceDate || r.date || '—'} · ${r.buyerName || r.customerName || '—'} · ${money(r.totalAmount || r.grandTotal || r.amount || 0)}`).join('\n') || '• No records yet.',
    ].join('\n') + roleLine;
  }

  /* 9 — despatch / shipment transfer */
  if (has('despatch', 'dispatch', 'shipment transfer', 'finish warehouse')) {
    const qty = ctx.despatches.reduce((s, r) => s + Number(r.totalQty || r.quantity || 0), 0);
    return [
      `**Exports — Despatch — ${ctx.despatches.length} record(s)** · qty **${num(qty)}**`,
      '',
      ctx.despatches.slice(0, 8).map((r) => `• ${r.despatchNo || r.id || '—'} · ${r.despatchDate || r.date || '—'} · ${r.customerName || r.buyerName || '—'} · qty ${num(r.totalQty || r.quantity || 0)}`).join('\n') || '• No records yet.',
    ].join('\n') + roleLine;
  }

  /* 10 — requisition / purchase */
  if (has('requisition', 'purchase order', 'purchase')) {
    return [
      `**Purchase — Requisition — ${ctx.requisitions.length} record(s)**`,
      '',
      ctx.requisitions.slice(0, 8).map((r) => `• ${r.reqNo || r.requisitionNo || r.id || '—'} · ${r.date || '—'} · ${r.department || '—'} · ${r.status || (r.approved ? 'Approved' : 'Pending')}`).join('\n') || '• No records yet.',
    ].join('\n') + roleLine;
  }

  /* 11 — product catalog */
  if (has('product', 'catalog', 'a4 sheet', 'item list', 'product list')) {
    const prodAns = answerWhereProduct(raw, ctx);
    return [
      prodAns ? `${prodAns}\n` : '',
      `**Product catalog — ${ctx.products.length} item(s)**`,
      ctx.products.slice(0, 12).map((p) => `• ${p.code} - ${p.name} · ${p.type} · ${p.uom}`).join('\n'),
      ctx.products.length > 12 ? `_…and ${ctx.products.length - 12} more._` : '',
      '',
      '_The Product Type / Product No / Uom dropdowns of the Indent screen come from this catalog._',
    ].filter(Boolean).join('\n') + roleLine;
  }

  /* 12 — how-to guides */
  if (has('how to', 'how do i', 'steps', 'kaise', 'guide')) {
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

  /* 13 — summary / today */
  if (has('summary', 'today', 'overview', 'dashboard', 'report')) {
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

  /* 14 — what is blocked for my role */
  if (has('blocked', 'not showing', 'hidden', 'cannot see', 'why not', 'nahi')) {
    return [
      `**Role "${ctx.role || '—'}"**`,
      '',
      ctx.denied.length
        ? `These documents are **blocked** for your role:\n${ctx.denied.slice(0, 20).map((d) => `• ${d.label}`).join('\n')}`
        : 'Nothing is blocked — your role has access to every document.',
      '',
      `Granted: **${ctx.granted.length}** document(s).`,
      '',
      '_Note: the DOCUMENT role never sees Accounts / Shipment / Stock by design; Super Admin sees everything._' + roleLine,
    ].join('\n');
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
