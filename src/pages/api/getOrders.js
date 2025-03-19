import dbConnect from '../../app/lib/dbconnect'; 
import OrderPayment from '../../models/OrderPayment'; 
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect(); // Connect to the database

  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token is required' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded; // Extract userId from the token

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Fetch all order payments for the authenticated user
    const orderPayments = await OrderPayment.find({ user: userId }).populate('items.foodId');

    if (!orderPayments || orderPayments.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found' });
    }

    // Return the order payments
    res.status(200).json({ success: true, orderPayments });
  } catch (error) {
    console.error('Error fetching order payments:', error.message || error);
    res.status(500).json({ success: false, message: 'Error fetching order payments' });
  }
}
