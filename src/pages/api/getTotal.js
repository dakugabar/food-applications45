// api/gettotal.js
import Order from '../../models/Order'; // Import your Order model
import connectDB from '../../app/lib/dbconnect'; // DB connection utility
import jwt from 'jsonwebtoken';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Connect to the database
    await connectDB();

    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
    }

    // Verify and decode token to get userId
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }

    console.log('User ID:', userId); // Debugging log

    // Fetch the latest order for the user
    const latestOrder = await Order.findOne({ userId }).sort({ createdAt: -1 });
    if (!latestOrder) {
      return res.status(404).json({ success: false, message: 'No order found' });
    }

    console.log('Latest Order:', latestOrder); // Debugging log

    // Assuming 'total' is the field storing the total amount of the order
    const orderTotal = latestOrder.total;

    return res.status(200).json({
      success: true,
      orderTotal, // Return the total of the latest order
    });
  } catch (error) {
    console.error('Error fetching order total:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default handler;
