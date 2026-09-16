// Role Documents setup — assign documents to Roles & Teams (role-based access control)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import { ROLES } from '../roles';
import {
  TEAMS, ROLE_DOCUMENTS, roleOptions, loadRoleDocs, saveRoleDocs,
} from '../roleDocsService';

export default function RoleDocuments() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [team, setTeam] = useState(TEAMS[0]);
  const [role, setRole] = useState(roleOptions()[0]);
  const [data, setData] = useState(loadRoleDocs);
  const [msg, setMsg] = useState('');
  const [view, setView] = useState('list');
  const [docTerm, setDocTerm] = useState('');

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);
  }, [nav]);

  if (!session) {
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Segoe UI,Arial' }}>Loading… please wait</div>;
  }

  const rolePerm = data[role] || {};
  const granted = ROLE_DOCUMENTS.filter((d) => rolePerm[d.key]);
  const visibleDocs = ROLE_DOCUMENTS.filter((d) => !docTerm.trim() || d.label.toLowerCase().includes(docTerm.trim().toLowerCase()));
  const roles = roleOptions();

  const toggleDoc = (key) => {
    setData((d) => {
      const perm = { ...(d[role] || {}) };
      perm[key] = !perm[key];
      return { ...d, [role]: perm };
    });
  };
  const setAll = (val) => {
    setData((d) => {
      const perm = {};
      ROLE_DOCUMENTS.forEach((doc) => { perm[doc.key] = val; });
      return { ...d, [role]: perm };
    });
  };
  const toggleCell = (roleKey, docKey) => {
    setData((d) => {
      const perm = { ...(d[roleKey] || {}) };
      perm[docKey] = !perm[docKey];
      return { ...d, [roleKey]: perm };
    });
  };
  const save = () => {
    const res = saveRoleDocs(data);
    setMsg(res.ok ? `Documents saved for ${role} (team: ${team}) ✅` : res.msg);
  };

  return (
    <div className="wrap">
      <Navbar session={session} />

      <div className="crumbbar">
        <span className="crumb">ADMIN</span><span className="crumb-sep">&gt;</span>
        <span className="crumb on">ROLE DOCUMENTS</span>
        <div className="crumb-right">
          <button className="btn-outline sm" onClick={() => nav('/home')}>🏠 Home</button>
        </div>
      </div>

      <div className="erp-body">
        <main className="erp-main">
          <div className="fpanel">
            <div className="fpanel-title">Role (choose type) + Team — assign documents to every role</div>
            <div className="fpanel-row">
              <div className="field">
                <label>Role — choose type</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Team (department)</label>
                <select value={team} onChange={(e) => setTeam(e.target.value)}>
                  {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="role-chips">
              {roles.map((r) => (
                <button key={r} type="button"
                  className={'chip' + (r === role ? ' on' : '') + (r === ROLES.SUPER_ADMIN ? ' vip' : '')}
                  onClick={() => setRole(r)}>
                  {r === ROLES.SUPER_ADMIN ? '🛡️ ' : ''}{r}
                </button>
              ))}
            </div>
              <div className="fpanel-row" style={{ marginTop: 10 }}>
                <button className="btn-outline sm" onClick={() => setAll(true)}>✅ Grant All</button>
                <button className="btn-outline sm" onClick={() => setAll(false)}>⬜ Clear All</button>
                <button className="btn-primary sm" onClick={save}>💾 Save Documents</button>
                <button className={'btn-outline sm' + (view === 'list' ? ' on' : '')} onClick={() => setView('list')}>List by Role</button>
                <button className={'btn-outline sm' + (view === 'matrix' ? ' on' : '')} onClick={() => setView('matrix')}>Role × Document Matrix</button>
                <input className="search" style={{ flex: 1, minWidth: 180 }} placeholder="🔍 Search document…" value={docTerm} onChange={(e) => setDocTerm(e.target.value)} />
              </div>
              {msg && <p className="msg ok">{msg}</p>}
            </div>

          {role === ROLES.SUPER_ADMIN && (
            <div className="fpanel note">
              <b>Super Admin</b> always sees every document — access cannot be switched off for this role.
            </div>
          )}

          {view === 'list' ? (
            <div className="fpanel">
              <div className="fpanel-title">Documents for Role type: <b>{role}</b> · Team: {team}</div>
              <div className="doc-count">{granted.length} of {ROLE_DOCUMENTS.length} documents granted</div>
              <div className="tblbox">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Document</th>
                      <th>Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleDocs.map((d, i) => (
                      <tr key={d.key}>
                        <td>{i + 1}</td>
                        <td>{d.group ? <b>{d.label}</b> : d.label}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!rolePerm[d.key]}
                            disabled={role === ROLES.SUPER_ADMIN}
                            onChange={() => toggleDoc(d.key)}
                          />
                        </td>
                      </tr>
                    ))}
                    {!visibleDocs.length && <tr><td colSpan={3} className="empty">No documents match your search.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="fpanel">
              <div className="fpanel-title">Role × Document Matrix — tick the documents each role can see</div>
              <div className="doc-count">{roles.filter((r) => r !== ROLES.SUPER_ADMIN).length} configurable roles · Super Admin is always full access</div>
              <div className="tblbox">
                <table className="tbl matrix">
                  <thead>
                    <tr>
                      <th>Document</th>
                      {roles.map((r) => <th key={r}>{r}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleDocs.map((d) => (
                      <tr key={d.key}>
                        <td>{d.group ? <b>{d.label}</b> : d.label}</td>
                        {roles.map((r) => (
                          <td key={r}>
                            <input
                              type="checkbox"
                              checked={!!(data[r] && data[r][d.key])}
                              disabled={r === ROLES.SUPER_ADMIN}
                              onChange={() => toggleCell(r, d.key)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {!visibleDocs.length && <tr><td colSpan={roles.length + 1} className="empty">No documents match your search.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="fpanel note">
            <small className="muted">Only logged-in users holding this role will see the documents you tick above. Mastership, Orders, Purchase &amp; Stores menus all obey these settings.</small>
          </div>
        </main>
      </div>
    </div>
  );
}