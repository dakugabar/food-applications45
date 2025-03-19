import dbConnect from '../../app/lib/dbconnect';
import Order from '../../models/Order';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { paymentStatus, transactionId, userId, items, totalAmount, address } = req.body;

      // Create a new order
      const newOrder = new Order({
        userId,
        items,
        totalAmount,
        address,
        paymentStatus,
        transactionId: paymentStatus === 'UPI' ? transactionId : null,
      });

      await newOrder.save();
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error submitting order:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
