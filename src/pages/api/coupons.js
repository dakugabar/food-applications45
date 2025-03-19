import Coupon from '../../models/Coupon';
import dbConnect from '../../app/lib/dbconnect'; // Ensure this path is correct

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { code, rate, terms, expiry, usageLimit, cartPrice, maxDiscount } = req.body; // Include maxDiscount

      // Validate the required fields
      if (!code || !rate || !terms || !expiry || !usageLimit || !cartPrice || !maxDiscount) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if coupon code already exists
      const existingCoupon = await Coupon.findOne({ code });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }

      // Create new coupon
      const newCoupon = new Coupon({
        code,
        rate,
        terms,
        expiry,
        usageLimit,
        cartPrice,
        maxDiscount, // Save the maximum discount price
      });

      await newCoupon.save();
      res.status(201).json(newCoupon);
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
