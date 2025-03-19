import dbConnect from '../../app/lib/dbconnect'; // Ensure this is the correct path
import Payment from '../../models/Payment'; // Ensure this is the correct path

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'DELETE') {
    const { id } = req.query;

    try {
      const deletedPayment = await Payment.findByIdAndDelete(id);
      if (deletedPayment) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ success: false, message: 'Payment not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
