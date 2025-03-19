import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true },
  otp: { type: String, required: true },
  resendCount: { type: Number, default: 1}, // Count for resend attempts
  lastSent: { type: Date, default: Date.now }, // Last OTP sent time
 
 
});



export default mongoose.models.OTP || mongoose.model('OTP', otpSchema);
