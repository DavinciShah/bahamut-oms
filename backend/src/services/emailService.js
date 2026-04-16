'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SENDGRID_SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SENDGRID_SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SENDGRID_SMTP_USER || 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

const FROM_ADDRESS = process.env.EMAIL_FROM || 'noreply@bahamut-oms.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Bahamut OMS';

const emailService = {
  async sendEmail(to, subject, html, text) {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('[emailService] SENDGRID_API_KEY not set – skipping email send');
      return { skipped: true };
    }
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
    return info;
  },

  async sendOrderConfirmation(order, customer) {
    const subject = `Order Confirmation – #${order.id}`;
    const html = `
      <h2>Thank you for your order, ${customer.name}!</h2>
      <p>Your order <strong>#${order.id}</strong> has been received and is being processed.</p>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
        </thead>
        <tbody>
          ${(order.items || [])
            .map(
              (i) =>
                `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.price}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
      <p><strong>Total:</strong> ${order.total}</p>
    `;
    return this.sendEmail(customer.email, subject, html);
  },

  async sendPasswordReset(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const subject = 'Password Reset Request';
    const html = `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `;
    return this.sendEmail(email, subject, html);
  },

  async sendNotification(email, notification) {
    const subject = notification.title || 'New Notification';
    const html = `
      <h2>${notification.title}</h2>
      <p>${notification.message}</p>
    `;
    return this.sendEmail(email, subject, html);
  },
};

module.exports = emailService;
