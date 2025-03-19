// API Route: /api/updateOrderStatus.js
import dbConnect from '../../app/lib/dbconnect'; // A utility to connect to your MongoDB
import OrderPayment from '../../models/OrderPayment';
// Import your OrderPayment model

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'PUT') {
    const { orderId, status } = req.body;

    try {
      const order = await OrderPayment.findById(orderId);

      if (order) {
        order.status = status;
        await order.save();
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ success: false, message: 'Order not found' });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
