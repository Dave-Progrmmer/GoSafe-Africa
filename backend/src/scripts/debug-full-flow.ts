
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { sendOTPEmail } from '../services/email.service';
import { generateOTP, hashOTP, getOTPExpiry } from '../utils/crypto';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const testForgotPasswordFlow = async () => {
    try {
        console.log('--- Testing Forgot Password Flow Logic ---');
        
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is missing');
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Test with the EXACT email the user relies on
        const rawEmail = 'opabunmidavid@gmail.com'; 
        const email = rawEmail.trim().toLowerCase();
        
        console.log(`Searching for user with phone/email: '${email}'`);

        const user = await User.findOne({ phone: email });

        if (!user) {
            console.error('❌ User NOT FOUND. Logic would return silent success.');
            return;
        }
        console.log('✅ User Found.');

        // Simulate OTP Generation
        const otp = generateOTP();
        const otpExpiresAt = getOTPExpiry();
        console.log(`Generated OTP: ${otp}`);

        // Update User
        user.resetOtp = await hashOTP(otp);
        user.resetOtpExpiry = otpExpiresAt;
        await user.save();
        console.log('✅ User updated with OTP hash.');

        // Simulate Email Sending
        console.log(`Attempting to send OTP email to ${email}...`);
        const sent = await sendOTPEmail(email, otp);

        if (sent) {
            console.log('✅ Email successfully sent (according to transport).');
        } else {
            console.error('❌ Email failed to send.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testForgotPasswordFlow();
