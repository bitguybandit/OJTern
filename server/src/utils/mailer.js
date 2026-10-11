const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (env.SMTP.USER && env.SMTP.PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP.HOST,
      port: env.SMTP.PORT,
      secure: env.SMTP.PORT === 465,
      auth: {
        user: env.SMTP.USER,
        pass: env.SMTP.PASS
      }
    });
  } else {
    // Generate test account with Ethereal in dev, or fallback to json transport / console
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`✓ Ethereal test email account initialized: ${testAccount.user}`);
    } catch (etherealErr) {
      console.log('Using console fallback for email transport');
      transporter = {
        sendMail: async (mailOptions) => {
          console.log(`[EMAIL DISPATCH] To: ${mailOptions.to} | Subject: ${mailOptions.subject} | Text: ${mailOptions.text}`);
          return { messageId: 'console-' + Date.now() };
        }
      };
    }
  }

  return transporter;
};

const sendNotificationEmail = async ({ to, subject, text, html }) => {
  try {
    const client = await getTransporter();
    const info = await client.sendMail({
      from: env.SMTP.FROM,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`
    });

    if (info && nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info)) {
      console.log(`[EMAIL SENT] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
    }
    return info;
  } catch (err) {
    console.warn(`[EMAIL WARNING] Could not send email to ${to}: ${err.message}. (In-app notification preserved)`);
    return null;
  }
};

module.exports = {
  sendNotificationEmail
};
