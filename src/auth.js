// Simple Auth using localStorage (no backend needed)
// Users stored as: [{ username, password, role }]

const USERS_KEY = 'fk_users';
const SESSION_KEY = 'fk_session';

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Default Super Admin seed (so you can login first time)
export function seedDefaultAdmin() {
  const users = getUsers();
  if (!users.find((u) => u.username === 'superadmin')) {
    users.push({ username: 'superadmin', password: 'admin123', role: 'Super Admin' });
    saveUsers(users);
  }
}

// SIGNUP: username + password + role
export function signup(username, password, role) {
  username = username.trim();
  if (!username || !password || !role) return { ok: false, msg: 'Username, Password and Role are required' };
  const users = getUsers();
  if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, msg: 'Username already exists!' };
  }
  users.push({ username, password, role });
  saveUsers(users);
  return { ok: true, msg: 'Signup successful! Now Login.' };
}

// LOGIN: username + password + role (role must match)
export function login(username, password, role) {
  username = username.trim();
  if (!username || !password || !role) return { ok: false, msg: 'Username, Password and Role are required' };
  const users = getUsers();
  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return { ok: false, msg: 'User not found! Please Signup first.' };
  if (user.password !== password) return { ok: false, msg: 'Wrong password!' };
  if (user.role !== role) return { ok: false, msg: `Role mismatch! This user is '${user.role}', not '${role}'.` };
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, role: user.role }));
  return { ok: true, msg: 'Login successful!' };
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}