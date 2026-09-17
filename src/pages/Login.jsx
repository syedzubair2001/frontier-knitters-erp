import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROLE_LIST } from '../roles';
import { login } from '../auth';
import AuthArt from '../components/AuthArt';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLE_LIST[0]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);
  const nav = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const res = login(username, password, role);
    setMsg(res.msg);
    setErr(!res.ok);
    if (res.ok) setTimeout(() => nav('/dashboard'), 900);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-artwrap">
          <AuthArt />
          <div className="auth-artoverlay">
            <div className="auth-logo">🧵</div>
            <h1>Frontier Knitters Pvt Ltd</h1>
            <p>Garment Manufacturing & Export ERP System</p>
          </div>
        </div>
 
        <div className="auth-foot">© 2026 Frontier Knitters Pvt Ltd — All rights reserved</div>
      </div>

      <div className="auth-right">
        <form className="auth-card" onSubmit={handleLogin}>
          <h2>Welcome back!</h2>
          <p className="muted">Login with your username, password & role</p>

          <label>USERNAME</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />

          <label>PASSWORD</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />

          <label>ROLE</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLE_LIST.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <button type="submit" className="btn-primary">LOGIN ➜</button>
          {msg && <p className={'msg' + (err ? ' err' : ' ok')}>{msg}</p>}

          <div className="demo">
            <b>Demo account:</b> superadmin &nbsp;/&nbsp; admin123 &nbsp;·&nbsp; Select <b>DOCUMENT</b> role for Indent-only access
          </div>
          <p className="muted center">No account? <Link to="/signup">Create an account</Link></p>
        </form>
      </div>
    </div>
  );
}