import Coupon from '../../models/Coupon';
import CartTotal from '../../models/CartTotal';
import dbConnect from '../../app/lib/dbconnect';
import jwt from 'jsonwebtoken'; // Install this library with `npm install jsonwebtoken`

export default async function handler(req, res) {
  await dbConnect(); // Ensure you're connected to the DB

  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Assumes the format is "Bearer <token>"

    // Verify the token and extract the userId
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace `process.env.JWT_SECRET` with your secret key
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const { userId } = decoded; // Assuming `userId` is stored in the token payload

    // Fetch all active coupons
    const activeCoupons = await Coupon.find({ status: 'active' });

    // Get the usage count for each coupon by the user
    const userCartTotals = await CartTotal.find({
      userId: userId,
      couponStatus: 'active'
    }).select('couponId');

    const usedCouponIds = userCartTotals.map((cart) => cart.couponId.toString());

    // Filter coupons based on usage limit and check if the user has already used them
    const availableCoupons = activeCoupons.filter(coupon => {
      const userCouponUsageCount = userCartTotals.filter(cart => cart.couponId.toString() === coupon._id.toString()).length;
      return userCouponUsageCount < coupon.usageLimit;
    });

    // Return the available coupons
    return res.status(200).json({ success: true, data: availableCoupons });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
