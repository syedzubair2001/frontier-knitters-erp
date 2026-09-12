import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../auth';
import { MASTER_LIST } from '../masterConfig';

// Top navigation bar with a "Masters ▾" dropdown containing all master sub-menus
export default function Navbar({ session }) {
  const nav = useNavigate();
  const path = useLocation().pathname;
  const [open, setOpen] = useState(false);
  const dd = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (dd.current && !dd.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const activeMasters = path.startsWith('/masters');
  const activeSub = activeMasters ? path.replace(/\/+$/, '').split('/').pop() : null;

  return (
    <header className="navbar">
      <div className="nav-left">
        <Link to="/home" className="brand">🧵 Frontier Knitters</Link>
        <span className="nav-sep">|</span>
        <Link to="/home" className={'nav-link' + (path === '/home' ? ' on' : '')}>🏠 Home</Link>

        <div className="dd" ref={dd}>
          <button type="button" className={'dd-btn' + (activeMasters ? ' on' : '')} onClick={() => setOpen(!open)}>
            🗂️ Masters <span className="caret">▾</span>
          </button>
          {open && (
            <div className="dd-menu">
              {MASTER_LIST.map((m) => (
                <Link
                  key={m.key}
                  to={`/masters/${m.key}`}
                  className={'dd-item' + (m.key === activeSub ? ' on' : '')}
                  onClick={() => setOpen(false)}
                >
                  <span className="dd-ic">{m.icon}</span> {m.plural}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link to="/orders" className={'nav-link' + (path === '/orders' ? ' on' : '')}>📦 Orders</Link>
      </div>
      <div className="nav-right">
        <div className="avatar">{session ? session.username.charAt(0).toUpperCase() : '?'}</div>
        <span className="badge role">{session ? `${session.username} · ${session.role}` : ''}</span>
        <button className="btn-outline" onClick={() => { logout(); nav('/login'); }}>Logout</button>
      </div>
    </header>
  );
}