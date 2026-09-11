import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSession, logout } from '../auth';
import { MODULE_LIST } from '../roles';

export default function ModulePage() {
  const { key } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const mod = MODULE_LIST.find((m) => m.key === key) || { key, label: key, icon: '📁', desc: '' };

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);
  }, [nav]);

  if (!session) {
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Segoe UI,Arial' }}>Loading… please wait</div>;
  }

  return (
    <div className="wrap">
      <header className="top">
        <div className="top-left">
          <h1>🧵 Frontier Knitters Pvt Ltd</h1>
          <h2>{mod.icon} {mod.label}</h2>
        </div>
        <div className="userbox">
          <div className="avatar">{session.username.charAt(0).toUpperCase()}</div>
          <span className="badge role">{session.username} · {session.role}</span>
          <button className="btn-outline" onClick={() => nav('/home')}>📋 Modules</button>
          <button className="btn-outline" onClick={() => { logout(); nav('/login'); }}>Logout</button>
        </div>
      </header>

      <div className="content">
        <div className="hero">
          <h2>{mod.icon} {mod.label} — Next module in line</h2>
          <p>{mod.desc || 'Coming soon'}. This module will be built next after you approve the current one.</p>
        </div>
        <div className="panel">
          <h2>⏳ Under Construction</h2>
          <p className="muted">This module comes after the previous one is approved. Building one by one as you said man.</p>
          <div className="stat-row">
            <div className="stat-box"><b>Status</b><span>Not built</span></div>
            <div className="stat-box"><b>Order</b><span>{MODULE_LIST.findIndex((m) => m.key === key) + 1}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}