import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not found in .env. Email sending skipped.');
      console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
      return false;
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"GoSafe Africa" <noreply@gosafeafrica.com>',
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

export const sendOTPEmail = async (email: string, otp: string) => {
  const subject = 'Password Reset OTP - GoSafe Africa';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Reset Your Password</h2>
      <p>Hello,</p>
      <p>You requested a password reset for your GoSafe Africa account. Please use the following One-Time Password (OTP) to reset your password:</p>
      <div style="background-color: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1F2937;">${otp}</span>
      </div>
      <p>This OTP is valid for <strong>10 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <br/>
      <p style="color: #6B7280; font-size: 14px;">Stay safe,<br/>GoSafe Africa Team</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};
