// Customer FORM screen — MASTER > PARTY > CUSTOMER (Add / Edit)
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import { PARTY_MENU } from '../masterConfig';
import {
  CUSTOMER_CATEGORIES, TAX_CATEGORIES, PAY_TERMS, CURRENCIES,
  ADDRESS_FIELDS, ADDRESS_LABELS, makeAddress, makeCustomer,
} from '../customerModel';
import { getCustomer, saveCustomer } from '../customerService';
import BlueSelect from '../components/BlueSelect';

export default function CustomerForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [customer, setCustomer] = useState(makeCustomer);
  const [addresses, setAddresses] = useState([]);
  const [tab, setTab] = useState('info1');
  const [editor, setEditor] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);
  const [sel, setSel] = useState(-1);
  const [msg, setMsg] = useState('');
  const [errs, setErrs] = useState({});

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);
  }, [nav]);

  useEffect(() => {
    if (id) {
      const found = getCustomer(id);
      setCustomer(makeCustomer(found));
      setAddresses(found ? (found.addresses || []).map((a) => ({ ...a })) : []);
    } else {
      setCustomer(makeCustomer());
      setAddresses([]);
    }
    setTab('info1'); setEditor(null); setEditIndex(-1); setSel(-1); setMsg(''); setErrs({});
  }, [id]);

  if (!session) {
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Segoe UI,Arial' }}>Loading… please wait</div>;
  }

  if (id && !getCustomer(id)) {
    return (
      <div className="wrap">
        <Navbar session={session} />
        <div className="erp-body">
          <div className="panel empty">
            <h2>Customer not found</h2>
            <p className="muted">The requested customer record no longer exists.</p>
            <button className="btn-primary sm" onClick={() => nav('/masters/customer')}>◀ Back to Customer List</button>
          </div>
        </div>
      </div>
    );
  }

  const set = (k, v) => setCustomer((c) => ({ ...c, [k]: v }));
  const onCheck = (k) => (e) => set(k, e.target.checked);

  const save = (e) => {
    e.preventDefault();
    const res = saveCustomer(customer, addresses);
    if (!res.ok) { setErrs(res.errors || {}); setMsg(res.msg); return; }
    setErrs({}); setMsg(res.msg);
    setTimeout(() => nav('/masters/customer'), 1000);
  };

  const openAdd = () => { setEditor(makeAddress()); setEditIndex(-1); setSel(-1); setMsg(''); };
  const openEdit = () => {
    if (sel < 0) { setMsg('Select an address row first, then Edit.'); return; }
    setEditor({ ...addresses[sel] }); setEditIndex(sel); setMsg('');
  };
  const closeEditor = () => { setEditor(null); setEditIndex(-1); };
  const saveAddr = () => {
    if (!editor.address1.trim()) { setMsg('Address1 is required.'); return; }
    if (editIndex >= 0) setAddresses(addresses.map((a, i) => (i === editIndex ? { ...editor } : a)));
    else setAddresses([...addresses, { ...editor, id: `A${Date.now()}` }]);
    setMsg('Address saved ✅'); setEditor(null); setEditIndex(-1);
  };
  const delAddr = (i) => {
    if (!confirm('Delete this address?')) return;
    setAddresses(addresses.filter((_, x) => x !== i)); setSel(-1); setMsg('');
  };

  const field = (name, label, el, extra = {}) => (
    <div className={'field' + (errs[name] ? ' err' : '')} key={name}>
      <label>{label}{extra.req ? <b className="req"> *</b> : null}</label>
      {el}
      {errs[name] ? <span className="f-err">{errs[name]}</span> : null}
    </div>
  );
  const text = (name, label, extra = {}) => field(name, label,
    <input value={customer[name] || ''} onChange={(e) => set(name, e.target.value)} type={extra.type || 'text'} step={extra.step} min={extra.min} />, extra);
  const select = (name, label, options, extra = {}) => field(name, label,
    <BlueSelect value={customer[name] || ''} onChange={(e) => set(name, e.target.value)}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </BlueSelect>, extra);

  return (
    <div className="wrap">
      <Navbar session={session} />

      <div className="crumbbar">
        <span className="crumb">MASTER</span><span className="crumb-sep">&gt;</span>
        <span className="crumb">PARTY</span><span className="crumb-sep">&gt;</span>
        <span className="crumb on">CUSTOMER</span>
        <div className="crumb-right">
          <button className="btn-outline sm" onClick={() => nav('/masters/customer')}>◀ Back to List</button>
        </div>
      </div>

      <div className="erp-body">
        <aside className="rail">
          <div className="rail-cap">MASTER › PARTY</div>
          <nav className="rail-list">
            {PARTY_MENU.map((p) => (
              <Link key={p.key} to={p.route} className={'rail-item' + (p.key === 'customer' ? ' on' : '')}>
                <span className="rail-code">{p.code}</span> {p.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="erp-main">
          <form className="erp-form" onSubmit={save}>
            <div className="fhead">
              <h1>Customer — {id ? 'Edit Record' : 'Add New'}</h1>
            </div>

            <div className="ftabs">
              <button type="button" className={'ftab' + (tab === 'info1' ? ' on' : '')} onClick={() => setTab('info1')}>Info 1</button>
              <button type="button" className={'ftab' + (tab === 'info2' ? ' on' : '')} onClick={() => setTab('info2')}>Info 2</button>
            </div>

            <div className="fsec">
              {tab === 'info1' ? (
                <>
                  <div className="fgrid">
                    {select('category', 'Category', CUSTOMER_CATEGORIES, { req: true })}
                    {text('name', 'Name', { req: true })}
                    {text('aliasName', 'Alias Name')}
                    {select('taxCategory', 'Tax Category', TAX_CATEGORIES)}
                    {text('commissionPct', 'Commission %', { type: 'number', step: '0.01', min: '0' })}
                    {text('extPct', 'Ext %', { type: 'number', step: '0.01', min: '0' })}
                    {select('payTerm', 'PayTerm', PAY_TERMS)}
                    {text('acLedger', 'A/C Ledger')}
                    {text('agent', 'Agent')}
                    {select('currency', 'Currency', CURRENCIES)}
                    {text('manager', 'Manager')}
                    {text('merchandiser', 'Merchandiser')}
                    {text('team', 'Team')}
                  </div>
                  <div className="fchecks">
                    <label className="chk"><input type="checkbox" checked={!!customer.lookup} onChange={onCheck('lookup')} /> Look Up</label>
                    <label className="chk"><input type="checkbox" checked={!!customer.isActive} onChange={onCheck('isActive')} /> IsActive</label>
                    <label className="chk"><input type="checkbox" checked={!!customer.lotMixing} onChange={onCheck('lotMixing')} /> Lot Mixing</label>
                    <label className="chk"><input type="checkbox" checked={!!customer.prospective} onChange={onCheck('prospective')} /> Prospective</label>
                    <label className="chk"><input type="checkbox" checked={!!customer.createLedger} onChange={onCheck('createLedger')} /> Create Ledger</label>
                  </div>
                </>
              ) : (
                <div className="fsec-empty">No additional fields configured here yet.</div>
              )}
            </div>

            <div className="asec">
              <div className="asec-head">
                <h2>Address</h2>
                <div className="fhead-actions">
                  <button type="button" className="btn-outline sm" onClick={openAdd}>➕ Add</button>
                  <button type="button" className="btn-outline sm" onClick={openEdit}>✏️ Edit</button>
                  <button type="button" className="btn-outline sm" onClick={() => sel >= 0 && delAddr(sel)}>🗑️ Delete</button>
                </div>
              </div>

              {editor && (
                <div className="addr-edit">
                  <div className="fgrid">
                    {ADDRESS_FIELDS.map((f) => (
                      <div className="field" key={f}>
                        <label>{ADDRESS_LABELS[f]}</label>
                        <input value={editor[f] || ''} onChange={(e) => setEditor({ ...editor, [f]: e.target.value })} />
                      </div>
                    ))}
                  </div>
                  <div className="addr-actions">
                    <button type="button" className="btn-primary sm" onClick={saveAddr}>Save Address</button>
                    <button type="button" className="btn-outline sm" onClick={closeEditor}>Cancel</button>
                  </div>
                </div>
              )}

              <div className="tblbox">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      {ADDRESS_FIELDS.map((f) => <th key={f}>{ADDRESS_LABELS[f]}</th>)}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {addresses.map((a, i) => (
                      <tr key={i} className={sel === i ? 'sel' : ''} onClick={() => { setSel(i); setMsg(''); }}>
                        <td>{i + 1}</td>
                        {ADDRESS_FIELDS.map((f) => <td key={f}>{a[f] || ''}</td>)}
                        <td><button type="button" className="del" onClick={(e) => { e.stopPropagation(); delAddr(i); }}>🗑️</button></td>
                      </tr>
                    ))}
                    {!addresses.length && <tr><td colSpan={ADDRESS_FIELDS.length + 2} className="empty">No data to display</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="fbar">
              <button type="submit" className="btn-primary sm">💾 Save</button>
              <button type="button" className="btn-outline sm" onClick={() => nav('/masters/customer')}>✕ Cancel</button>
              {msg && <span className={msg.includes('required') || msg.includes('Select') ? 'msg err' : 'msg ok'}>{msg}</span>}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}