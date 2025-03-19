// update.js
import dbConnect from '../../../app/lib/dbconnect';
import Cart from '../../../models/Cart';
import User from '../../../models/user';
import jwt from 'jsonwebtoken';


export default async function handler(req, res) {
  if (req.method === 'POST') {
    await dbConnect();

    const { token, foodId, quantity } = req.body;

    if (!token || !foodId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Token, foodId, and quantity are required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const userExists = await User.findById(userId);
      if (!userExists) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const item = await Cart.findOne({ userId, foodId });
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found in cart' });
      }

      item.quantity = quantity;
      item.totalPrice = item.price * quantity;
      await item.save();

      return res.status(200).json({ success: true, message: 'Item quantity updated' });
    } catch (error) {
      console.error('Error updating item quantity:', error);
      return res.status(500).json({ success: false, message: 'Failed to update item quantity', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
