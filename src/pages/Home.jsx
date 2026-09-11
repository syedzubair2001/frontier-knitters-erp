import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSession, logout } from '../auth';
import { MODULE_LIST } from '../roles';

export default function Home() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);

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
          <h2>🏠 Modules</h2>
        </div>
        <div className="userbox">
          <div className="avatar">{session.username.charAt(0).toUpperCase()}</div>
          <span className="badge role">{session.username} · {session.role}</span>
          <button className="btn-outline" onClick={() => { logout(); nav('/login'); }}>Logout</button>
        </div>
      </header>

      <div className="content">
        <div className="hero">
          <h2>Welcome, {session.username}! 👋</h2>
          <p>Frontier Knitters Pvt Ltd — Garment ERP. Build the system module by module.</p>
        </div>

        <div className="cards">
          {MODULE_LIST.map((m) => (
            <Link key={m.key} to={m.key === 'masters' ? '/masters' : m.key === 'orders' ? '/orders' : `/module/${m.key}`} className="card">
              <span className="c-ic">{m.icon}</span>
              <b>{m.label}</b>
              <span className="c-go">{m.desc}</span>
            </Link>
          ))}
        </div>

        <div className="rights">
          <h3>✅ Module build plan (one by one)</h3>
          <div className="chips">
            <span className="chip on">1. Masters ✦ DONE</span>
            <span className="chip">2. Orders — next</span>
            <span className="chip">3. Cutting</span>
            <span className="chip">4. Stitching</span>
            <span className="chip">5. QC</span>
            <span className="chip">6. Packing</span>
            <span className="chip">7. Shipping</span>
            <span className="chip">8. Invoice & DC</span>
          </div>
        </div>
      </div>
    </div>
  );
}