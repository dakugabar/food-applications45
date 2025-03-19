import dbConnect from '../../app/lib/dbconnect';
import Cart from '../../models/Cart';
import Item from '../../models/item';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  try {
    await dbConnect(); // Ensure database connection

    // Ensure the request is a GET request
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authorization token is required' });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token has expired, please log in again' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { userId } = decoded;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    // Fetch cart items for the user and populate foodId with Item details
    const cartItems = await Cart.find({ userId })
      .populate({
        path: 'foodId', 
        select: 'name price discount imageUrl gstRate', // Populate fields from Item model
        model: 'Item', // Ensure to reference the Item model
      });

    // If no cart items found
    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ success: false, message: 'No cart items found for this user' });
    }

    // Return the populated cart items
    return res.status(200).json({ success: true, cartItems });
  } catch (error) {
    console.error('Error handling cart API:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch cart items' });
  }
}
