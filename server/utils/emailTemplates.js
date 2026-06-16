// HTML email templates with NayePankh branding (orange header, contact footer).
const BRAND = {
  orange: '#F97316',
  dark: '#EA580C',
  bg: '#FFFBF5',
  logo: 'https://nayepankh.com/logo.png',
};

const wrap = (title, bodyHtml) => `
<div style="background:${BRAND.bg};padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1C1917">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E7E5E4">
    <div style="background:${BRAND.orange};padding:20px 24px;color:#fff">
      <h1 style="margin:0;font-size:20px">NayePankh Foundation</h1>
      <p style="margin:4px 0 0;font-size:12px;opacity:.9">Giving Wings to the Underprivileged</p>
    </div>
    <div style="padding:24px">
      <h2 style="margin-top:0;color:${BRAND.dark};font-size:18px">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="background:#FFF7ED;padding:16px 24px;font-size:12px;color:#78716C;text-align:center">
      NayePankh Foundation • UP Govt. Registered NGO • 80G &amp; 12A Certified<br/>
      contact@nayepankh.com • +91-8318500748<br/>
      Instagram • LinkedIn • YouTube • Facebook • Twitter
    </div>
  </div>
</div>`;

const button = (url, label) =>
  `<a href="${url}" style="display:inline-block;background:${BRAND.orange};color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;margin:16px 0">${label}</a>`;

module.exports = {
  verification: ({ name, url }) => ({
    subject: 'Verify your NayePankh account',
    html: wrap(
      `Welcome, ${name}! 👋`,
      `<p>Thanks for registering as a volunteer. Please verify your email address to continue. This link expires in 24 hours.</p>${button(url, 'Verify My Email')}<p style="font-size:12px;color:#78716C">If the button doesn't work, paste this link into your browser:<br/>${url}</p>`
    ),
  }),
  newRegistrationAdmin: ({ volunteerName, city, reviewUrl }) => ({
    subject: `New volunteer registered: ${volunteerName}`,
    html: wrap(
      'A new volunteer needs review',
      `<p><strong>${volunteerName}</strong> from <strong>${city}</strong> just verified their email and is awaiting approval.</p>${button(reviewUrl, 'Review Application')}`
    ),
  }),
  approved: ({ name, volunteerId }) => ({
    subject: "🎉 You're now a NayePankh Volunteer!",
    html: wrap(
      `Congratulations, ${name}! 🎉`,
      `<p>Your application has been approved. Your Volunteer ID is:</p><p style="font-size:24px;font-weight:bold;color:${BRAND.orange}">${volunteerId}</p><p>Log in to your dashboard to browse upcoming drives and start making a difference.</p>`
    ),
  }),
  rejected: ({ name, reason }) => ({
    subject: 'Update on your NayePankh application',
    html: wrap(
      `Hi ${name}`,
      `<p>Thank you for your interest in volunteering with us. After review, we're unable to approve your application at this time.</p><p><strong>Reason:</strong> ${reason || 'Not specified'}</p><p>You're welcome to apply again in the future. We'd love to have you.</p>`
    ),
  }),
  eventRegistered: ({ name, eventName, date, venue }) => ({
    subject: `You're registered for ${eventName}`,
    html: wrap(
      `See you there, ${name}!`,
      `<p>You're registered for <strong>${eventName}</strong>.</p><ul><li><strong>Date:</strong> ${date}</li><li><strong>Venue:</strong> ${venue || 'Online'}</li></ul>`
    ),
  }),
  passwordReset: ({ name, url }) => ({
    subject: 'Reset your NayePankh password',
    html: wrap(
      `Hi ${name}`,
      `<p>We received a request to reset your password. This link expires in 1 hour.</p>${button(url, 'Reset Password')}<p style="font-size:12px;color:#78716C">If you didn't request this, you can safely ignore this email.</p>`
    ),
  }),
  certificateReady: ({ name }) => ({
    subject: 'Your Volunteer Certificate is ready! 🎓',
    html: wrap(
      `Well done, ${name}! 🎓`,
      `<p>Your Volunteer Appreciation Certificate is attached to this email. Thank you for your dedication to uplifting the underprivileged.</p>`
    ),
  }),
};
