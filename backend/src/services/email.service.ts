import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not found in .env. Email sending skipped.');
      console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
      return false;
    }

    // For free tier, you must send FROM onboarding@resend.dev unless you verify a domain
    const from = process.env.EMAIL_FROM_RESEND || 'onboarding@resend.dev';

    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (data.error) {
        console.error('❌ Resend API Error:', data.error);
        return false;
    }

    console.log(`📧 Email sent successfully: ${data.data?.id}`);
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
