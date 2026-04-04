const nodemailer = require('nodemailer');
const { formatCurrency, maskAccountNumber } = require('./helpers');

/**
 * Email service for sending notifications
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  /**
   * Send email
   * @param {Object} options - Email options
   */
  async sendEmail(options) {
    const mailOptions = {
      from: `Online Banking <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:', {
          to: options.to,
          subject: options.subject
        });
        return { success: true, mock: true };
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(user, accountNumber) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a237e, #3949ab); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Online Banking</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #1a237e;">Hello ${user.name}!</h2>
          <p>Thank you for opening an account with us. Your account has been successfully created.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Account Number:</strong> ${accountNumber}</p>
            <p><strong>Account Type:</strong> Savings</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          <p>You can now login to your account and start managing your finances.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Online Banking - Account Created',
      html
    });
  }

  /**
   * Send transaction success notification
   */
  async sendTransactionSuccess(user, transaction, type) {
    const isDebit = type === 'debit';
    const color = isDebit ? '#f44336' : '#4caf50';
    const icon = isDebit ? '📤' : '📥';
    const action = isDebit ? 'debited from' : 'credited to';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${color}; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">${icon} Transaction Successful</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #333;">Hello ${user.name},</h2>
          <p>Your transaction has been completed successfully.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
            <p><strong>Amount:</strong> <span style="color: ${color}; font-size: 18px; font-weight: bold;">${formatCurrency(transaction.amount)}</span></p>
            <p><strong>Type:</strong> ${type.toUpperCase()}</p>
            <p><strong>${isDebit ? 'To' : 'From'}:</strong> ${maskAccountNumber(isDebit ? transaction.receiverAccount : transaction.senderAccount)}</p>
            <p><strong>Reference:</strong> ${transaction.reference || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
          </div>
          <p>Amount ${action} your account.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you did not make this transaction, please contact support immediately.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Transaction ${type === 'debit' ? 'Debit' : 'Credit'} - ${formatCurrency(transaction.amount)}`,
      html
    });
  }

  /**
   * Send transaction failed notification
   */
  async sendTransactionFailed(user, transaction, reason) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f44336; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">❌ Transaction Failed</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #333;">Hello ${user.name},</h2>
          <p>Unfortunately, your transaction could not be completed.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Transaction ID:</strong> ${transaction.transactionId || 'N/A'}</p>
            <p><strong>Amount:</strong> ${formatCurrency(transaction.amount)}</p>
            <p><strong>To Account:</strong> ${maskAccountNumber(transaction.receiverAccount)}</p>
            <p><strong>Reason:</strong> <span style="color: #f44336;">${reason}</span></p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Please check your account balance and try again, or contact support if the issue persists.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Transaction Failed - Action Required',
      html
    });
  }

  /**
   * Send scheduled transaction reminder
   */
  async sendScheduledReminder(user, scheduledTransaction) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ff9800; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">⏰ Scheduled Transaction Reminder</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #333;">Hello ${user.name},</h2>
          <p>You have a scheduled transaction coming up.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Amount:</strong> ${formatCurrency(scheduledTransaction.amount)}</p>
            <p><strong>To Account:</strong> ${maskAccountNumber(scheduledTransaction.receiverAccount)}</p>
            <p><strong>Scheduled Date:</strong> ${new Date(scheduledTransaction.scheduledDate).toLocaleString()}</p>
            <p><strong>Reference:</strong> ${scheduledTransaction.reference || 'N/A'}</p>
          </div>
          <p>Please ensure sufficient balance in your account before the scheduled time.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Scheduled Transaction Reminder - ${formatCurrency(scheduledTransaction.amount)}`,
      html
    });
  }

  /**
   * Send account frozen notification
   */
  async sendAccountFrozenNotification(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f44336; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔒 Account Frozen</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #333;">Hello ${user.name},</h2>
          <p>Your account has been frozen by the administrator.</p>
          <p>During this time, you will not be able to:</p>
          <ul>
            <li>Make transfers</li>
            <li>Withdraw funds</li>
            <li>Schedule transactions</li>
          </ul>
          <p>Please contact our support team for more information.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Important: Your Account Has Been Frozen',
      html
    });
  }

  /**
   * Send account unfrozen notification
   */
  async sendAccountUnfrozenNotification(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4caf50; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔓 Account Restored</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #333;">Hello ${user.name},</h2>
          <p>Good news! Your account has been unfrozen and is now fully active.</p>
          <p>You can now:</p>
          <ul>
            <li>Make transfers</li>
            <li>Withdraw funds</li>
            <li>Schedule transactions</li>
          </ul>
          <p>Thank you for your patience.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Your Account Has Been Restored',
      html
    });
  }
}

// Export singleton instance
module.exports = new EmailService();
