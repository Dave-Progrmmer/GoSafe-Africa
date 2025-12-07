
import dotenv from 'dotenv';
import path from 'path';
import { Resend } from 'resend';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const testResend = async () => {
    console.log('--- Testing Resend Email Service ---');
    
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('❌ RESEND_API_KEY is missing!');
        return;
    }
    console.log(`API Key found: ${apiKey.substring(0, 5)}...`);

    const resend = new Resend(apiKey);
    const testRecipient = 'opabunmidavid@gmail.com'; 

    console.log(`Sending test email to ${testRecipient}...`);

    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: testRecipient,
            subject: 'Test Email from GoSafe (Resend)',
            html: '<h1>It Works!</h1><p>Your GoSafe Africa app is now using Resend successfully.</p>'
        });

        if (data.error) {
            console.error('❌ Resend API Error:', data.error);
        } else {
            console.log(`✅ Email sent successfully! ID: ${data.data?.id}`);
        }
    } catch (error) {
        console.error('❌ Exception:', error);
    }
};

testResend();
