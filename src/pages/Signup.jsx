import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROLE_LIST } from '../roles';
import { signup } from '../auth';
import AuthArt from '../components/AuthArt';
import FrontierLogo from '../components/FrontierLogo';
import { showLoading, hideLoading } from '../loading';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLE_LIST[0]);
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    showLoading(); // loading animation while creating the account
    const res = signup(username, password, role);
    setMsg(res.msg);
    if (res.ok) {
      // stays spinning until the Login screen has rendered
      setTimeout(() => nav('/login'), 1000);
    } else {
      hideLoading(); // e.g. username already taken → stop the animation
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-artwrap">
          <AuthArt />
          <div className="auth-artoverlay">
            <div className="auth-logo"><span className="logo-plate auth-logo-plate"><FrontierLogo height={30} /></span></div>
            <h1>Frontier Knitters Pvt Ltd</h1>
            <p>Create your account to enter the ERP system</p>
          </div>
        </div>
        <ul>
          <li>🔐 Pick your Garment role</li>
          <li>📦 Order Management</li>
          <li>✅ Production to Packing workflow</li>
          <li>🧾 Invoice & Delivery Challan</li>
        </ul>
        <div className="auth-foot">© 2026 Frontier Knitters Pvt Ltd — All rights reserved</div>
      </div>

      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSignup}>
          <h2>Create Account</h2>
          <p className="muted">Signup with username, password & role</p>

          <label>USERNAME</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" />

          <label>PASSWORD</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password" />

          <label>ROLE (Garments Based)</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLE_LIST.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <button type="submit" className="btn-primary">SIGNUP ➜</button>
          {msg && <p className="msg ok">{msg}</p>}

          <p className="muted center">Already have account? <Link to="/login">Login</Link></p>
        </form>
      </div>
    </div>
  );
}