import * as nodemailer from 'nodemailer'; // ✅ This imports everything as a namespace

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
  secure: false,
  auth: SMTP_USER
    ? {
        user: SMTP_USER,
        pass: SMTP_PASS,
      }
    : undefined,
});

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  if (!SMTP_HOST || !SMTP_FROM) {
    // Placeholder: in development you might log instead of sending
    // eslint-disable-next-line no-console
    console.log('Email disabled. Would send:', { to, subject, text });
    return;
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
}

