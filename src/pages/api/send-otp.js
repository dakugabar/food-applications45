import mongoose from 'mongoose';
import User from '../../models/user'; // Assuming you have a User model
import Otp from '../../models/Otp';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Extract data from request body
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Connect to MongoDB if not already connected
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();

    // Check if OTP record exists for the mobile number
    let otpRecord = await Otp.findOne({ mobileNumber });

    if (otpRecord) {
      const resendDelay = 1 * 60 * 1000; // 1 minute delay for resending
      const nextAllowedTime = new Date(otpRecord.lastSent.getTime() + resendDelay);

      if (now < nextAllowedTime) {
        const remainingTime = Math.ceil((nextAllowedTime - now) / 1000);
        return res.status(429).json({
          error: `OTP already sent. Please wait ${remainingTime} seconds before resending.`,
        });
      }

      // Update existing record
      otpRecord.otp = otp;
      otpRecord.lastSent = now;
      otpRecord.resendCount += 1;
    } else {
      // Create a new OTP record
      otpRecord = new Otp({
        mobileNumber,
        otp,
        lastSent: now,
        resendCount: 1,
      });
    }

    // Save the OTP record
    await otpRecord.save();

    // Format mobile number for the PHP API
    const formattedMobile = mobileNumber.startsWith('91')
      ? mobileNumber
      : `91${mobileNumber}`;

    const postData = {
      From: 'EFLATB',
      To: formattedMobile,
      TemplateName: 'ContentEFBOTP',
      VAR1: otp,
    };

    const phpApiUrl =
      'http://2factor.in/API/V1/51a830db-c684-11e6-afa5-00163ef91450/ADDON_SERVICES/SEND/TSMS';

    // Send OTP using the PHP API
    const response = await fetch(phpApiUrl, {
      method: 'POST',
      body: new URLSearchParams(postData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result = await response.text();

    if (response.ok) {
      return res.status(200).json({ message: 'OTP sent successfully' });
    } else {
      console.error('Error sending OTP:', result);
      return res.status(500).json({ error: 'Failed to send OTP' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
