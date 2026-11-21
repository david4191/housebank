import { Cookies } from 'react-cookie';

// Single shared cookie jar used by both the RTK Query layer (redux/housebank.ts)
// and AuthContext, previously these read/wrote two different cookie jars under
// different key names (note_user_token vs hb_user_token), which meant the
// Authorization header was NEVER actually sent on any "protected" request.
export const cookieManager = new Cookies();

// This legacy cookie is removed on startup. Active session tokens are
// server-issued HttpOnly cookies and cannot be read from JavaScript.
export const TOKEN_COOKIE = 'hb_user_token';

// Cached copy of the logged-in user object (id, email, role, ...), so the app
// can render role-aware UI (route guards, dashboard sidebars) without waiting
// on a network round trip on every page load. Never treated as a source of
// truth for authorization, every actual write/read still goes through the
// backend, which re-checks the JWT and ownership independently.
export const USER_COOKIE = 'hb_user';
export const REMEMBER_SESSION_KEY = 'hb_remember_session';

cookieManager.remove('hb_user_token', { path: '/' });
cookieManager.remove('hb_refresh_token', { path: '/' });

export function clearAuthCookies() {
  cookieManager.remove('hb_user_token', { path: '/' });
  cookieManager.remove('hb_refresh_token', { path: '/' });
  cookieManager.remove(USER_COOKIE, { path: '/' });
  localStorage.removeItem(REMEMBER_SESSION_KEY);
}
