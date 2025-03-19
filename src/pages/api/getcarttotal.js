import dbConnect from '../../app/lib/dbconnect';
import CartTotalModel from '../../models/CartTotal';
import jwt from 'jsonwebtoken'; // Import the JWT library

export default async function handler(req, res) {
  await dbConnect(); // Connect to the database

  if (req.method === 'GET') {
    try {
      // Extract token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1]; // Get token after "Bearer"

      if (!token) {
        return res.status(401).json({ success: false, message: 'Token is required' });
      }

      try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded; // Extract userId from the decoded token

        if (!userId) {
          return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Fetch the latest cart total for the user
        const cartTotal = await CartTotalModel.findOne({ userId }).sort({ createdAt: -1 });

        if (!cartTotal) {
          return res.status(404).json({ success: false, message: 'No cart total found' });
        }

        // Respond with the total amount
        res.status(200).json({ success: true, total: cartTotal.total });
      } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token', error: error.message });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching cart total', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
