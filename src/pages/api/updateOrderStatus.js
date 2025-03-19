import dbConnect from '../../app/lib/dbconnect'; // A utility to connect to your MongoDB
import OrderPayment from '../../models/OrderPayment'; // Import your Order model

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  const { orderId, status } = req.body;

  try {
    // Validate input
    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: 'Order ID and status are required' });
    }

    // Find the order by ID and update the status
    const updatedOrder = await OrderPayment.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
