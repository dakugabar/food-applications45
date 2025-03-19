// pages/api/update-payment.js
import dbConnect from '../../app/lib/dbconnect';
import Payment from '../../models/Payment'; // Adjust the path if necessary

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      await dbConnect();
      const { id } = req.query; // Get payment ID from the query string
      const { status } = req.body; // Get new status from the request body

      // Validate input
      if (!id || !status) {
        return res.status(400).json({ message: 'Payment ID and status are required' });
      }

      // Update the payment status in the database
      const updatedPayment = await Payment.findByIdAndUpdate(
        id,
        { status },
        { new: true } // Return the updated document
      );

      if (!updatedPayment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      res.status(200).json(updatedPayment);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
