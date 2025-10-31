const nodemailer = require("nodemailer");

class MailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: Number(process.env.EMAIL_SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
    });
  }

  async sendMail({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) {
    const from = process.env.FROM_EMAIL || process.env.EMAIL_SMTP_USER;
    return await this.transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
  }
}

export const mailService = new MailService();
