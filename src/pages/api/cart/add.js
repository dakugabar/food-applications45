// add.js
import dbConnect from '../../../app/lib/dbconnect';
import Cart from '../../../models/Cart';
import User from '../../../models/user';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await dbConnect();

    const { token, foodId, quantity, imageUrl, name, price } = req.body;

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

      const totalPrice = price * quantity;

      const existingItem = await Cart.findOne({ userId, foodId });
      if (existingItem) {
        // Update the existing item quantity and total price
        existingItem.quantity = quantity;
        existingItem.totalPrice = totalPrice;
        await existingItem.save();
      } else {
        // Create a new cart item
        await Cart.create({
          userId,
          foodId,
          imageUrl,
          name,
          price,
          quantity,
          totalPrice
        });
      }

      return res.status(200).json({ success: true, message: 'Item added to cart' });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return res.status(500).json({ success: false, message: 'Failed to add item to cart', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
