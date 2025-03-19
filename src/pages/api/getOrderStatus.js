import dbConnect from '../../app/lib/dbconnect';
import OrderPayments from '../../models/OrderPayment'; // Ensure this matches your model file

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  if (method === 'GET') {
    const { orderId } = req.query;

    try {
      const order = await OrderPayments.findById(orderId); // Use the correct model here
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.status(200).json({ success: true, status: order.status });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
