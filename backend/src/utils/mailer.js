// backend/src/utils/mailer.js
//
// Generic SMTP mailer using nodemailer. Reads connection details from
// environment variables so no secrets are hard-coded here.
//
// Required .env variables (add these to backend/.env):
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_SECURE=false          (true if using port 465)
//   SMTP_USER=your@email.com
//   SMTP_PASS=your-app-password
//   EMAIL_FROM="Crazy Nails & Lashes <your@email.com>"   (optional, falls back to SMTP_USER)
//
// If you already have a mailer set up elsewhere in the project (e.g. for
// booking confirmations), point that code at this same file instead of
// keeping two separate transporters.

const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('[mailer] SMTP_HOST/SMTP_USER/SMTP_PASS not set — emails will be logged but not sent.');
        return null;
    }

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    return transporter;
};

/**
 * Send an email. Never throws — failures are logged and swallowed so a
 * broken mail config can never break an order/return/cancel API call.
 */
const sendEmail = async ({ to, subject, html }) => {
    if (!to) {
        console.warn('[mailer] sendEmail called with no recipient, skipping');
        return false;
    }

    const t = getTransporter();
    if (!t) {
        console.log(`[mailer] (not sent — SMTP not configured) To: ${to} | Subject: ${subject}`);
        return false;
    }

    try {
        await t.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to,
            subject,
            html
        });
        console.log(`[mailer] Email sent to ${to}: ${subject}`);
        return true;
    } catch (error) {
        console.error('[mailer] Failed to send email:', error.message);
        return false;
    }
};

module.exports = { sendEmail };