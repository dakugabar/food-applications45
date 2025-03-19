import mongoose from 'mongoose';
import Otp from '../../models/Otp';
import User from '../../models/user'; // Assuming you have a User model
import jwt from 'jsonwebtoken';

// Function to generate a random string of a given length
const generateRandomString = (length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { mobileNumber, otp } = req.body;

  if (!mobileNumber || !otp) {
    return res.status(400).json({ error: 'Mobile number and OTP are required' });
  }

  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Find the OTP record for the mobile number
    const otpRecord = await Otp.findOne({ mobileNumber });

    if (!otpRecord) {
      return res.status(400).json({ error: 'No valid OTP found' });
    }

    // Check if the OTP is expired
    const otpExpirationTime = new Date(otpRecord.lastSent.getTime() + 10 * 60 * 1000); // 10 minutes
    if (new Date() > otpExpirationTime) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Reset OTP record
    await Otp.findOneAndUpdate(
      { mobileNumber },
      { resendCount: 0, otp: null, lastSent: new Date() }
    );

    // Find the user associated with the mobile number
    let user = await User.findOne({ mobileNumber });

    if (!user) {
      // Create a new user if not found
      const newUser = new User({
        mobileNumber,
        isVerified: true, // Mark the new user as verified
        userName: generateRandomString(10), // Assign a unique random userName
      });

      // Save the new user
      user = await newUser.save();
    }

    // If user is not verified, mark as verified
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // Generate JWT tokens
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'OTP verified successfully',
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
