'use strict';

const { env } = require('../config/env');

const ACCESS_COOKIE = 'hb_access_token';
const REFRESH_COOKIE = 'hb_refresh_token';
const REMEMBER_COOKIE = 'hb_remember_session';
const LEGACY_ACCESS_COOKIE = 'hb_user_token';

function cookieValue(req, name) {
  const cookies = String(req.headers.cookie || '').split(';');
  const prefix = `${name}=`;
  const cookie = cookies.map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return cookie ? cookie.slice(prefix.length) : '';
}

function cookieOptions(req, maxAge) {
  const secure = req.secure || req.get('x-forwarded-proto') === 'https';
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    ...(Number.isFinite(maxAge) ? { maxAge: maxAge * 1000 } : {}),
  };
}

function setAuthCookies(req, res, accessToken, refreshToken) {
  const marker = cookieValue(req, REMEMBER_COOKIE);
  const rememberMe =
    typeof req.body?.rememberMe === 'boolean' ? req.body.rememberMe : marker ? marker === '1' : true;
  const accessOptions = cookieOptions(req, rememberMe ? env.JWT_ACCESS_TTL_SECONDS : undefined);
  const refreshOptions = cookieOptions(req, rememberMe ? env.JWT_REFRESH_TTL_SECONDS : undefined);
  res.cookie(ACCESS_COOKIE, accessToken, accessOptions);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshOptions);
  res.cookie(REMEMBER_COOKIE, rememberMe ? '1' : '0', refreshOptions);
}

function sessionResponseData(req, data, accessToken, refreshToken) {
  return req.get('origin') ? data : { ...data, token: accessToken, refreshToken };
}

function clearAuthCookies(req, res) {
  const options = cookieOptions(req, 0);
  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(REFRESH_COOKIE, options);
  res.clearCookie(REMEMBER_COOKIE, options);
  res.clearCookie(LEGACY_ACCESS_COOKIE, options);
}

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REMEMBER_COOKIE,
  cookieValue,
  setAuthCookies,
  sessionResponseData,
  clearAuthCookies,
};
