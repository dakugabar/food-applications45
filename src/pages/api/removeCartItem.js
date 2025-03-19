import jwt from 'jsonwebtoken';
import dbConnect from '../../app/lib/dbconnect'; // Adjust the path as needed
import Cart from '../../models/Cart'; // Adjust the path as needed
import User from '../../models/user'; // Adjust the path as needed

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'DELETE') {
    const { itemId } = req.body; // Ensure the itemId is provided in the request body
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token is required' });
    }

    try {
      await dbConnect();

      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { userId } = decoded;

      // Fetch user from the database
      const userExists = await User.findById(userId);
      if (!userExists) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Remove the item from the cart
      const result = await Cart.findOneAndDelete({ userId, _id: itemId });

      if (!result) {
        return res.status(404).json({ success: false, message: 'Item not found in cart' });
      }

      res.status(200).json({ success: true, message: 'Item removed successfully' });
      
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
