'use strict';

const { env } = require('../config/env');
const { logger } = require('./logger');

/**
 * All outbound mail uses Brevo's transactional-email API. There is no
 * SMTP transport or fallback: configure the API key and verified sender
 * identity before starting the backend.
 */

function maskEmail(email) {
  const [localPart, domain] = String(email).split('@');
  if (!localPart || !domain) return '[invalid-email]';
  return `${localPart[0]}***@${domain}`;
}

async function sendViaBrevo(toEmail, subject, html) {
  logger.info('Brevo email dispatch started', {
    recipient: maskEmail(toEmail),
    subject,
    sender: { name: env.BREVO_SENDER_NAME, email: env.BREVO_SENDER_EMAIL },
  });

  try {
    const endpoint = 'https://api.brevo.com/v3/smtp/email';
    const payload = {
      sender: { name: env.BREVO_SENDER_NAME, email: env.BREVO_SENDER_EMAIL },
      to: [{ email: toEmail }],
      subject,
      htmlContent: html,
    };

    logger.info('Brevo API request', {
      endpoint,
      method: 'POST',
      recipient: maskEmail(toEmail),
      payload_size: JSON.stringify(payload).length,
    });

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    logger.info('Brevo API response received', {
      recipient: maskEmail(toEmail),
      status: res.status,
      statusText: res.statusText,
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => '');
      logger.error('Failed to send email via Brevo', {
        to: maskEmail(toEmail),
        status: res.status,
        body: bodyText.slice(0, 500),
      });
      return false;
    }

    let messageId;
    try {
      const body = await res.json();
      messageId = body.messageId;
    } catch (err) {
      logger.warning('Brevo accepted email but returned an unreadable response body', {
        to: maskEmail(toEmail),
        status: res.status,
        error: err.message,
      });
    }
    logger.info('Brevo accepted email request', {
      recipient: maskEmail(toEmail),
      status: res.status,
      message_id: messageId,
    });
    return true;
  } catch (err) {
    logger.error('Failed to send email via Brevo', {
      to: maskEmail(toEmail),
      error: err.message,
      stack: err.stack,
    });
    return false;
  }
}

async function sendMail(toEmail, subject, html) {
  return sendViaBrevo(toEmail, subject, html);
}

async function sendOtp(toEmail, code, purposeLabel, metadata = {}) {
  const logContext = {
    user_id: metadata.userId,
    purpose: metadata.purpose || purposeLabel,
    recipient: maskEmail(toEmail),
    mail_driver: 'brevo',
  };
  logger.info('OTP email dispatch started', logContext);

  const subject = 'Your HouseBank verification code';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#111;">HouseBank verification code</h2>
      <p>Use the code below to ${purposeLabel}. It expires in 10 minutes.</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background:#f4f4f4; padding: 16px; text-align:center; border-radius:8px;">${code}</p>
      <p style="color:#666; font-size: 13px;">If you didn't request this, you can safely ignore this email — no one can access your account without this code.</p>
    </div>`;
  let sent;
  try {
    sent = await sendMail(toEmail, subject, html);
  } catch (err) {
    logger.error('OTP email dispatch threw an error', { ...logContext, error: err.message });
    throw err;
  }

  if (sent) {
    logger.info('OTP email accepted by mail transport', logContext);
  } else {
    logger.warning('OTP email was not accepted by mail transport', logContext);
  }
  return sent;
}

/**
 * Check Brevo connectivity and credentials once at startup. A failure is
 * logged clearly; email requests still use Brevo only and report delivery
 * failure to the caller.
 */
async function verifyMailTransport() {
  try {
    const res = await fetch('https://api.brevo.com/v3/account', {
      headers: { 'api-key': env.BREVO_API_KEY, Accept: 'application/json' },
    });
    if (res.ok) {
      logger.info('Mail transport: Brevo API key verified OK.');
    } else {
      logger.error('Mail transport: Brevo API key rejected at boot -- emails will not send until this is fixed.', {
        status: res.status,
      });
    }
  } catch (err) {
    logger.error('Mail transport: Brevo verification request failed', { error: err.message });
  }
}

module.exports = { sendMail, sendOtp, verifyMailTransport };
