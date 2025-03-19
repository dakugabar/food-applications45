// pages/api/changeOrderStatus.js
import dbConnect from '../../app/lib/dbconnect'; // Ensure this is the correct path
import OrderPayment from '../../models/OrderPayment'; // Ensure this is the correct path

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { orderId, status } = req.body;

      // Validate input
      if (!orderId || !status) {
        return res.status(400).json({ success: false, message: 'Order ID and status are required' });
      }

      // Update the order status
      const updatedOrder = await OrderPayment.findByIdAndUpdate(orderId, { status }, { new: true });

      if (!updatedOrder) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.status(200).json({ success: true, order: updatedOrder });
    } catch (error) {
      console.error('Error updating order status:', error.message); // Improved error logging
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
