// pages/api/saveOrder.js
import mongoose from 'mongoose';
import Order from '../../models/Order'; // Adjust path as needed

async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await connectToDatabase();
      
      const { userId, items, amount, address, status, date, payment } = req.body;

      const order = new Order({
        userId,
        items,
        amount,
        address,
        status,
        date,
        payment
      });

      const result = await order.save();

      res.status(200).json({ success: true, orderId: result._id });
    } catch (error) {
      console.error('Error saving order:', error);
      res.status(500).json({ success: false, message: 'Error saving order' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
