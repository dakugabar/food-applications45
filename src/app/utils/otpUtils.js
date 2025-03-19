import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendOtpToMobile = async (mobileNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your OTP code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber,
    });
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return Promise.reject(error);
  }
};
