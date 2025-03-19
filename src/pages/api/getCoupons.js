import dbConnect from '../../app/lib/dbconnect'; // Utility to connect to the database
import Coupon from '../../models/Coupon';     // Mongoose model for Coupon

// Connect to the database
dbConnect();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch all coupons from the database
      const coupons = await Coupon.find();
      
      // Send back the coupons as a JSON response
      res.status(200).json(coupons);
    } catch (error) {
      // If there's an error, respond with a 500 status and the error message
      res.status(500).json({ message: 'Failed to load coupons', error: error.message });
    }
  } else {
    // Respond with a 405 status if the method is not GET
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
