import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../auth';
import { MASTER_MENU } from '../masterConfig';
import { PURCHASE_STORES_MENU } from '../purchaseConfig';
import { SALES_SHIPMENT_MENU } from '../salesConfig';
import { ACCOUNTS_MENU } from '../accountsConfig';
import { DOCUMENTS_TEAM_MENU } from '../documentsTeamConfig';
import { ROLES } from '../roles';
import { canUseRole, docKeyFor } from '../roleDocsService';

// Nested sub-menu (e.g. MASTER > PARTY ⇢ CUSTOMER / CONSIGNEE / SUPPLIER / BANK / TRANSPORT)
function MasterGroup({ item, onNav }) {
  const [subOpen, setSubOpen] = useState(false);
  const timeoutRef = useRef(null);
  const path = useLocation().pathname;
  const isActive = (route) => path === route || path.startsWith(route + '/');

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSubOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setSubOpen(false);
    }, 150);
  };

  return (
    <div className="dd-group" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="dd-group-cap" onClick={() => setSubOpen(!subOpen)}>
        <span className="dd-ic">{item.icon}</span> {item.label}
        <span className="caret">▸</span>
      </div>
      {subOpen && (
        <div className="dd-sub">
          {item.children.map((c) => (c.children ? (
            <MasterGroup key={c.key} item={c} onNav={onNav} />
          ) : (
            <Link key={c.key} to={c.route} className={'dd-item' + (isActive(c.route) ? ' on' : '')} onClick={onNav}>
              {c.code ? <span className="dd-code">{c.code}</span> : c.icon ? <span className="dd-ic">{c.icon}</span> : null} {c.label}
            </Link>
          )))}
        </div>
      )}
    </div>
  );
}

// Reusable top dropdown menu (Masters, Purchase & Stores…) with nested groups
function MenuDropdown({ icon, label, menu, path }) {
  const [open, setOpen] = useState(false);
  const dd = useRef(null);

  useEffect(() => {
    const close = (e) => { if (dd.current && !dd.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const matchActive = (route) => path === route || path.startsWith(route + '/');
  const anyActive = (items) => items.some((it) => (it.children
    ? anyActive(it.children)
    : (it.route && matchActive(it.route))));

  return (
    <div className="dd" ref={dd}>
      <button type="button" className={'dd-btn' + (anyActive(menu) ? ' on' : '')} onClick={() => setOpen(!open)}>
        {icon} {label} <span className="caret">▾</span>
      </button>
      {open && (
        <div className="dd-menu dd-col">
          {menu.map((item) => (item.children ? (
            <MasterGroup key={item.key} item={item} onNav={() => setOpen(false)} />
          ) : (
            <Link key={item.key} to={item.route} className={'dd-item' + (matchActive(item.route) ? ' on' : '')} onClick={() => setOpen(false)}>
              <span className="dd-ic">{item.icon}</span> {item.label}
            </Link>
          )))}
        </div>
      )}
    </div>
  );
}

// Top navigation bar with "Masters ▾" / "Purchase & Stores ▾" dropdowns
export default function Navbar({ session }) {
  const nav = useNavigate();
  const path = useLocation().pathname;
  const role = session ? session.role : null;
  const isSuper = role === ROLES.SUPER_ADMIN;
  const isAdmin = isSuper || role === ROLES.ADMIN;

  // "That role only" — recursively filter items granted to the role
  const permitMenu = (menu) => menu
    .map((item) => {
      if (item.children) {
        const children = permitMenu(item.children);
        return { ...item, children };
      }
      return item;
    })
    .filter((item) => (item.children ? item.children.length > 0 : canUseRole(role, docKeyFor(item.key) || item.key)));

  const mastersMenu = isSuper ? MASTER_MENU : permitMenu(MASTER_MENU);
  const purchaseMenu = isSuper ? PURCHASE_STORES_MENU : permitMenu(PURCHASE_STORES_MENU);
  const salesMenu = isSuper ? SALES_SHIPMENT_MENU : permitMenu(SALES_SHIPMENT_MENU);
  const accountsMenu = isSuper ? ACCOUNTS_MENU : permitMenu(ACCOUNTS_MENU);
  const docTeamMenu = isSuper ? DOCUMENTS_TEAM_MENU[0].children : permitMenu(DOCUMENTS_TEAM_MENU[0].children);
  const showOrders = isSuper || canUseRole(role, 'orders');
  const showRoleDocs = isAdmin || canUseRole(role, 'role-docs');

  return (
    <header className="navbar">
      <div className="nav-left">
        <Link to="/dashboard" className="brand">🧵 Frontier Knitters</Link>
        <span className="nav-sep">|</span>
        <Link to="/dashboard" className={'nav-link' + (path === '/dashboard' ? ' on' : '')}>📊 Dashboard</Link>

        {mastersMenu.length > 0 && <MenuDropdown icon="🗂️" label="Masters" menu={mastersMenu} path={path} />}
        {purchaseMenu.length > 0 && <MenuDropdown icon="🛒" label="Purchase & Stores" menu={purchaseMenu} path={path} />}
        {salesMenu.length > 0 && <MenuDropdown icon="🚢" label="Sales & Shipment" menu={salesMenu} path={path} />}
        {accountsMenu.length > 0 && <MenuDropdown icon="💰" label="Accounts" menu={accountsMenu} path={path} />}
        {docTeamMenu.length > 0 && <MenuDropdown icon="📄" label="Documents Team" menu={docTeamMenu} path={path} />}
        {showOrders && <Link to="/orders" className={'nav-link' + (path === '/orders' ? ' on' : '')}>📦 Orders</Link>}
        {showRoleDocs && <Link to="/admin/role-documents" className={'nav-link' + (path === '/admin/role-documents' ? ' on' : '')}>🔐 Role Docs</Link>}
      </div>
      <div className="nav-right">
        <div className="avatar">{session ? session.username.charAt(0).toUpperCase() : '?'}</div>
        <span className="badge role">{session ? `${session.username} · ${session.role}` : ''}</span>
        <button className="btn-outline" onClick={() => { logout(); nav('/login'); }}>Logout</button>
      </div>
    </header>
  );
}