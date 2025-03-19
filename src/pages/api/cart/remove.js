// remove.js
import dbConnect from '../../../app/lib/dbconnect';
import Cart from '../../../models/Cart';
import User from '../../../models/user';
import jwt from 'jsonwebtoken';


export default async function handler(req, res) {
  if (req.method === 'POST') {
    await dbConnect();

    const { token, foodId } = req.body;

    if (!token || !foodId) {
      return res.status(400).json({ success: false, message: 'Token and foodId are required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const userExists = await User.findById(userId);
      if (!userExists) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const result = await Cart.deleteOne({ userId, foodId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'Item not found in cart' });
      }

      return res.status(200).json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return res.status(500).json({ success: false, message: 'Failed to remove item from cart', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
