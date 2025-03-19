// Next.js API route example
import dbConnect from '../../app/lib/dbconnect'; // Assuming you're using a utility for MongoDB connection
import Coupon from '../../models/Coupon'; // Coupon model

export default async function handler(req, res) {
  await dbConnect();

  try {
    // Fetch only coupons with status "active"
    const coupons = await Coupon.find({ status: 'active' });
    
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to fetch coupons' });
  }
}
