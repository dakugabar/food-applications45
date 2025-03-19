// pages/api/getCartPrice.js

import dbConnect from '../../app/lib/dbconnect'; // Adjust the path as needed
import Coupon from '../../models/Coupon'; // Adjust the path as needed

export default async function handler(req, res) {
  await dbConnect();

  try {
    // Fetch the active coupon
    const activeCoupons = await Coupon.find({ status: 'active' });

    if (activeCoupons.length > 0) {
      // Assuming you want to return the lowest cartPrice among active coupons
      const cartPrice = Math.min(...activeCoupons.map(coupon => coupon.cartPrice));
      return res.status(200).json({ cartPrice });
    }

    // Default value if no active coupons found
    return res.status(200).json({ cartPrice: 500 });
  } catch (error) {
    console.error('Error fetching cart price:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
