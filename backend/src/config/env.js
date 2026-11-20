'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

function required(key) {
  const value = process.env[key];
  if (!value) {
    // Fail loudly at boot rather than silently running with a missing
    // secret — the same philosophy as the PHP version this replaces.
    // eslint-disable-next-line no-console
    console.error(`[HouseBank] FATAL: missing required env var ${key}`);
    process.exit(1);
  }
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: parseInt(process.env.PORT || '3001', 10),
  APP_URL: (process.env.APP_URL || '').replace(/\/$/, ''),
  FRONTEND_URL: (process.env.FRONTEND_URL || '').replace(/\/$/, ''),

  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_NAME: required('DB_NAME'),
  DB_USER: required('DB_USER'),
  DB_PASS: process.env.DB_PASS || '',

  JWT_SECRET: required('JWT_SECRET'),
  JWT_ACCESS_TTL_SECONDS: parseInt(process.env.JWT_ACCESS_TTL_SECONDS || '1800', 10),
  JWT_REFRESH_TTL_SECONDS: parseInt(process.env.JWT_REFRESH_TTL_SECONDS || '1209600', 10),

  BREVO_API_KEY: required('BREVO_API_KEY'),
  BREVO_SENDER_EMAIL: required('BREVO_SENDER_EMAIL'),
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || 'HouseBank',

  // Twilio SMS (Joan, Sep 2026: "sms notification is on payments,
  // bookings and approvals only") -- see src/utils/sms.js. Optional: if
  // any of these three are blank, sendSms() logs and no-ops rather than
  // throwing, so a missing Twilio setup never breaks the payment/
  // booking/approval action itself.
  TWILIO_SID: process.env.TWILIO_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_FROM: process.env.TWILIO_FROM || '',

  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || '',
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY || '',

  UPLOAD_MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE || String(5 * 1024 * 1024), 10),
};

if (env.JWT_SECRET.length < 32) {
  // eslint-disable-next-line no-console
  console.error('[HouseBank] FATAL: JWT_SECRET is too short — generate a long random value (see .env.example).');
  process.exit(1);
}

module.exports = { env };
