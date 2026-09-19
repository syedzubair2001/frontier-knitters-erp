import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROLE_LIST } from '../roles';
import { login } from '../auth';
import AuthArt from '../components/AuthArt';
import BlueSelect from '../components/BlueSelect';
import FrontierLogo from '../components/FrontierLogo';
import { showLoading, hideLoading } from '../loading';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLE_LIST[0]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);
  const nav = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    showLoading(); // loading animation while signing in + moving to the dashboard
    const res = login(username, password, role);
    setMsg(res.msg);
    setErr(!res.ok);
    if (res.ok) {
      // stays spinning until the Dashboard screen has rendered
      setTimeout(() => nav('/dashboard'), 900);
    } else {
      hideLoading(); // wrong credentials → stop the animation right away
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
          <BlueSelect value={role} onChange={(e) => setRole(e.target ? e.target.value : e)} options={ROLE_LIST} placeholder="Select role" />

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