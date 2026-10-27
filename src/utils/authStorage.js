// LocalStorage auth users & session (original section 2)

export const AUTH_USERS_KEY = 'maintainiq_users_v1';
export const AUTH_SESSION_KEY = 'maintainiq_session_v1';

export const DEFAULT_DEMO_USERS = [
  {
    id: 'usr-admin-01',
    fullName: 'Syed Ali Raza (Campus Admin)',
    email: 'admin@smit.edu.pk',
    password: 'password123',
    role: 'Administrator',
    department: 'Facilities & Infrastructure Command',
    organization: 'SMIT Main Campus Facilities',
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'usr-tech-01',
    fullName: 'Sara Khan',
    email: 'sara.khan@smit.edu.pk',
    password: 'password123',
    role: 'Technician',
    department: 'IT, AV & Electronics',
    organization: 'SMIT Main Campus Facilities',
    createdAt: '2026-01-02T09:00:00Z'
  },
  {
    id: 'usr-tech-02',
    fullName: 'Bilal Ahmed',
    email: 'bilal.ahmed@smit.edu.pk',
    password: 'password123',
    role: 'Technician',
    department: 'HVAC & Mechanical',
    organization: 'SMIT Main Campus Facilities',
    createdAt: '2026-01-03T09:00:00Z'
  }
];

export function loadRegisteredUsers() {
  try {
    const raw = window.localStorage.getItem(AUTH_USERS_KEY);
    if (!raw) {
      window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(DEFAULT_DEMO_USERS));
      return DEFAULT_DEMO_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(DEFAULT_DEMO_USERS));
      return DEFAULT_DEMO_USERS;
    }
    return parsed;
  } catch (_) {
    return DEFAULT_DEMO_USERS;
  }
}

export function saveRegisteredUsers(users) {
  try {
    window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  } catch (_) {}
}

export function loadActiveSession() {
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email) return parsed;
    return null;
  } catch (_) {
    return null;
  }
}

export function saveActiveSession(userObj) {
  try {
    if (!userObj) {
      window.localStorage.removeItem(AUTH_SESSION_KEY);
    } else {
      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(userObj));
    }
  } catch (_) {}
}
