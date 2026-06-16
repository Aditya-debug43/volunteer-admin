const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
}

/**
 * @param {Object} opts { to, subject, html, attachments? }
 */
async function sendEmail({ to, subject, html, attachments }) {
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    // Do not crash the request flow if email fails; log and continue.
    logger.error(`Email failed to ${to}: ${err.message}`);
  }
}

module.exports = sendEmail;
