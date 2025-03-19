// pages/api/payments.js

import dbConnect from '../../app/lib/dbconnect';
import Payment from '../../models/Payment';

export default async function handler(req, res) {
  await dbConnect();

  try {
    const payments = await Payment.find({ status: 'Active' });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
